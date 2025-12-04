import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { Data, Effect, identity, Option, pipe, Schema } from 'effect';
import toast from 'svelte-french-toast';
import { get, writable, type Readable } from 'svelte/store';
import { isUserAgentMobile } from '../1-shared/utils';
import type { DataImage } from '../1-shared/values';
import { Email } from '../1-shared/values';
import * as Persistence from '../2-services/persistence';
import * as WorkerTasks from '../4-runtime/worker-tasks';

// #:

const NAME_FILE_IMAGE = 'Anki Wrapped 2025.png';

// #: Types

export type StateImage =
	| {
			readonly _tag: 'GeneratingSvg';
			readonly optionDataImage: Option.Option<DataImage>;
	  }
	| {
			readonly _tag: 'RenderingPng';
			readonly dataImage: DataImage;
			readonly svg: string;
	  }
	| {
			readonly _tag: 'Ready';
			readonly dataImage: DataImage;
			readonly svg: string;
			readonly blobPng: Blob;
	  }
	| {
			readonly _tag: 'Downloaded';
			readonly dataImage: DataImage;
			readonly svg: string;
			readonly blobPng: Blob;
	  };

export type StateMarketingEmail =
	| { readonly _tag: 'Ready'; readonly email: string }
	| { readonly _tag: 'Loading'; readonly email: Email }
	| { readonly _tag: 'Success' };

export interface Args {
	readonly dataImage: DataImage;
	readonly svg: string;
}

export interface Bindings {
	// ##: State

	readonly stateImage$: Readable<StateImage>;
	readonly stateMarketingEmail$: Readable<StateMarketingEmail>;

	// ##: Commands

	readonly downloadPng: Effect.Effect<void>;
	readonly createMarketingEmail: Effect.Effect<void>;

	readonly onInputEmail: ({ value }: { value: string }) => Effect.Effect<void>;
}

// #: make

export const make = Effect.gen(function* () {
	const storage = yield* Persistence.Persistence;
	const workerTasks = yield* WorkerTasks.WorkerTasks;

	// ##: State

	const optionDataImage = yield* storage.getDataImage;

	const stateImage$ = writable<StateImage>({ _tag: 'GeneratingSvg', optionDataImage });
	const stateMarketingEmail$ = writable<StateMarketingEmail>({ _tag: 'Ready', email: '' });

	// ##: Commands

	const downloadPng = Effect.gen(function* () {
		const stateImage = get(stateImage$);
		if (stateImage._tag !== 'Ready') {
			yield* Effect.logWarning('Cannot share PNG image, state is not Ready');
			return;
		}

		// Try using Web Share API on mobile
		if (isUserAgentMobile() && navigator.share != undefined && navigator.canShare != undefined) {
			const file = new File([stateImage.blobPng], 'image.png', { type: 'image/png' });
			if (navigator.canShare({ files: [file] })) {
				yield* Effect.tryPromise(() =>
					navigator.share({
						files: [file],
						title: 'Anki Wrapped 2025',
						text: "Here's my Anki Wrapped for 2025"
					})
				);

				return;
			}
		}

		// Fallback
		yield* Effect.acquireUseRelease(
			Effect.sync(() => URL.createObjectURL(stateImage.blobPng)),
			(url) =>
				Effect.try(() => {
					const elemAnchor = document.createElement('a');
					elemAnchor.href = url;
					elemAnchor.download = NAME_FILE_IMAGE;
					document.body.appendChild(elemAnchor);
					elemAnchor.click();
					document.body.removeChild(elemAnchor);
				}),
			(url) => Effect.sync(() => URL.revokeObjectURL(url))
		);

		// Success
		yield* Effect.sync(() =>
			stateImage$.set({
				_tag: 'Downloaded',
				dataImage: stateImage.dataImage,
				svg: stateImage.svg,
				blobPng: stateImage.blobPng
			})
		);
	}).pipe(
		Effect.tapErrorCause(Effect.logError),
		Effect.catchAll(() => Effect.sync(() => toast.error('Something went wrong')))
	);

	const createMarketingEmail = Effect.gen(function* () {
		const stateMarketingEmail = get(stateMarketingEmail$);
		if (stateMarketingEmail._tag !== 'Ready') {
			yield* Effect.logWarning('Cannot create marketing email, state is not Ready');
			return;
		}

		const email = yield* Schema.decode(Email)(stateMarketingEmail.email);

		yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Loading', email }));

		const response = yield* Effect.tryPromise({
			try: () =>
				fetch('https://www.rember.com/api/marketing/create-marketing-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, metadata: { source: 'ankiwrapped.com' } })
				}),
			catch: (error) => new ErrorCannotCreateMarketingEmail({ error })
		});

		if (response.ok) {
			yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Success' }));
		} else {
			yield* Effect.fail(new ErrorCannotCreateMarketingEmail({}));
		}
	}).pipe(
		Effect.tapErrorCause(Effect.logError),
		Effect.catchAll(() =>
			pipe(
				Effect.sync(() => toast.error('Something went wrong')),
				Effect.andThen(() =>
					Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Ready', email: '' }))
				)
			)
		)
	);

	const onInputEmail = ({ value }: { value: string }) =>
		Effect.gen(function* () {
			const stateMarketingEmail = get(stateMarketingEmail$);
			if (stateMarketingEmail._tag !== 'Ready') {
				yield* Effect.logWarning('Cannot create marketing email, state is not Ready');
				return;
			}

			yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Ready', email: value }));
		}).pipe(Effect.tapErrorCause(Effect.logError));

	// ##: Side effects
	// NOTE: We render the image as soon as the page load, we don't wait for
	// the user to press the "Download" button.

	if (browser) {
		if (Option.isNone(optionDataImage)) {
			yield* Effect.logError('Image data is missing');
			yield* Effect.promise(() => goto('/'));
		} else {
			const dataImage = yield* optionDataImage;

			yield* pipe(
				Effect.gen(function* () {
					// Generate SVG
					const { svg } = yield* workerTasks.generateSvg({ dataImage });
					yield* Effect.sync(() => stateImage$.set({ _tag: 'RenderingPng', dataImage, svg }));

					// Render PNG
					const { bytesPng } = yield* workerTasks.renderPng({ dataImage, svg });
					const blobPng = new Blob([bytesPng], { type: 'image/png' });
					stateImage$.set({ _tag: 'Ready', dataImage, svg, blobPng });
				}),
				Effect.tapErrorCause(Effect.logError),
				Effect.catchAll(() => Effect.sync(() => toast.error('Something went wrong'))),
				Effect.forkScoped
			);
		}
	}

	// ##:

	return identity<Bindings>({
		// State
		stateImage$: stateImage$,
		stateMarketingEmail$,
		// Commands
		downloadPng,
		createMarketingEmail,
		onInputEmail
	});
});

// #:

export class ErrorCannotCreateMarketingEmail extends Data.TaggedError(
	'FeatResult2025/CannotCreateMarketingEmail'
)<{ error?: unknown | undefined }> {
	override get message() {
		return 'Failed to create marketing email, response is not successful';
	}
}
