import { browser } from '$app/environment';
import * as Image from '$lib/image';
import { isUserAgentMobile } from '$lib/utils';
import type { DataImage } from '$lib/values';
import { Effect, identity, pipe } from 'effect';
import { get, writable, type Readable } from 'svelte/store';

// #:

const NAME_FILE_IMAGE = 'Anki Wrapped 2024.png';

// #: Types

export type StateImage =
	| { readonly _tag: 'Loading' }
	| { readonly _tag: 'Success'; readonly blob: Blob };

export interface Args {
	readonly dataImage: DataImage;
	readonly svg: string;
}

export interface Bindings {
	// ##: State

	readonly stateImage$: Readable<StateImage>;

	// ##: Commands

	readonly downloadImage: Effect.Effect<void>;
}

// #: make

export const make = (args: Args) =>
	Effect.gen(function* () {
		const image = yield* Image.Image;

		// ##: State

		const stateImage$ = writable<StateImage>({ _tag: 'Loading' });

		// ##: Commands

		const downloadImage = Effect.gen(function* () {
			const stateImage = get(stateImage$);

			if (stateImage._tag !== 'Success') {
				yield* Effect.logWarning('Cannot share image, state is not Success');
				return;
			}

			// Try using Web Share API on mobile
			if (isUserAgentMobile() && navigator.share != undefined && navigator.canShare != undefined) {
				const file = new File([stateImage.blob], 'image.png', { type: 'image/png' });
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
				Effect.sync(() => URL.createObjectURL(stateImage.blob)),
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
		}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

		// ##: Side effects
		// NOTE: We render the image as soon as the page load, we don't wait for
		// the user to press the "Download"/"Share" button.

		if (browser) {
			yield* pipe(
				image.renderPng({ dataImage: args.dataImage, svg: args.svg }),
				Effect.andThen((bytes) =>
					Effect.try(() => {
						const blob = new Blob([bytes], { type: 'image/png' });
						stateImage$.set({ _tag: 'Success', blob });
					})
				),
				Effect.tapErrorCause(Effect.logError),
				Effect.forkScoped
			);
		}

		// ##:

		return identity<Bindings>({
			// State
			stateImage$,
			// Commands
			downloadImage
		});
	});
