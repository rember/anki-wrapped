import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import * as Image from '$lib/image';
import * as Storage from '$lib/storage';
import { isUserAgentMobile } from '$lib/utils';
import { Email, type DataImage } from '$lib/values';
import { Effect, identity, Option, pipe, Schema } from 'effect';
import { get, writable, type Readable } from 'svelte/store';

// #:

const NAME_FILE_IMAGE = 'Anki Wrapped 2024.png';

// #: Types

export type StateImage =
	| { readonly _tag: 'GeneratingSvg' }
	| { readonly _tag: 'RenderingPng'; svg: string }
	| { readonly _tag: 'Ready'; svg: string; readonly blobPng: Blob }
	| { readonly _tag: 'Downloaded'; svg: string; readonly blobPng: Blob };

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
	const image = yield* Image.Image;
	const storage = yield* Storage.Storage;

	// ##: State

	const stateImage$ = writable<StateImage>({ _tag: 'GeneratingSvg' });
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
						title: 'Anki Wrapped 2024',
						text: "Here's my Anki Wrapped for 2024"
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
			stateImage$.set({ _tag: 'Downloaded', svg: stateImage.svg, blobPng: stateImage.blobPng })
		);
	}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

	const createMarketingEmail = Effect.gen(function* () {
		const stateMarketingEmail = get(stateMarketingEmail$);
		if (stateMarketingEmail._tag !== 'Ready') {
			yield* Effect.logWarning('Cannot create marketing email, state is not Ready');
			return;
		}

		const email = yield* Schema.decode(Email)(stateMarketingEmail.email);

		yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Loading', email }));

		const response = yield* Effect.promise(() =>
			fetch('https://www.rember.com/api/marketing/create-marketing-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, metadata: { source: 'ankiwrapped.com' } })
			})
		);

		if (response.ok) {
			yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Success' }));
		} else {
			// TODO: Do this for all errors
			yield* Effect.logWarning('Failed to create marketing email');
			yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Ready', email: '' }));
		}
	}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

	const onInputEmail = ({ value }: { value: string }) =>
		Effect.gen(function* () {
			const stateMarketingEmail = get(stateMarketingEmail$);
			if (stateMarketingEmail._tag !== 'Ready') {
				yield* Effect.logWarning('Cannot create marketing email, state is not Ready');
				return;
			}

			yield* Effect.sync(() => stateMarketingEmail$.set({ _tag: 'Ready', email: value }));
		}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

	// ##: Side effects
	// NOTE: We render the image as soon as the page load, we don't wait for
	// the user to press the "Download" button.

	if (browser) {
		const optionDataImage = yield* storage.getDataImage;
		if (Option.isNone(optionDataImage)) {
			yield* Effect.logError('Image data is missing');
			yield* Effect.promise(() => goto('/'));
		} else {
			const dataImage = yield* optionDataImage;

			yield* pipe(
				Effect.gen(function* () {
					// Generate SVG
					const svg = yield* image.generateSvg({ dataImage });
					yield* Effect.sync(() => stateImage$.set({ _tag: 'RenderingPng', svg }));

					// Render PNG
					const bytesPng = yield* image.renderPng({ dataImage, svg });
					const blobPng = new Blob([bytesPng], { type: 'image/png' });
					stateImage$.set({ _tag: 'Ready', svg, blobPng });
				}),
				Effect.tapErrorCause(Effect.logError),
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
