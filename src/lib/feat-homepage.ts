import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import * as Storage from '$lib/storage';
import { Worker as WorkerEffect } from '@effect/platform';
import { BrowserWorker } from '@effect/platform-browser';
import { Effect, identity } from 'effect';
import { toast } from 'svelte-french-toast';
import { writable, type Readable } from 'svelte/store';
import { TaskWorkerProcessCollectionAnki } from './values';

// #: Types

export type StateCollectionAnki =
	| { readonly _tag: 'Idle' }
	| { readonly _tag: 'Loading'; readonly file: File };

export interface Bindings {
	// ##: State

	readonly stateCollectionAnki$: Readable<StateCollectionAnki>;

	// ##: Commands

	readonly onFileSelected: (args: { file: File }) => Effect.Effect<void>;
}

// #: make

export const make = Effect.gen(function* () {
	const storage = yield* Storage.Storage;

	// ##: State

	const stateCollectionAnki$ = writable<StateCollectionAnki>({ _tag: 'Idle' });

	// ##: Commands

	const onFileSelected = ({ file }: { file: File }) =>
		Effect.gen(function* () {
			if (browser) {
				stateCollectionAnki$.set({ _tag: 'Loading', file });
				const pool = yield* WorkerEffect.makePoolSerialized({ size: 1 });

				const { dataImage } = yield* pool.executeEffect(
					new TaskWorkerProcessCollectionAnki({ file })
				);
				yield* storage.createDataImage({ dataImage });
				yield* Effect.promise(() => goto('/result-2024'));
			}
		}).pipe(
			Effect.tapErrorCause(Effect.logError),
			Effect.catchAll(() => Effect.sync(() => toast.error('Something went wrong'))),
			Effect.scoped,
			Effect.provide(
				BrowserWorker.layer(
					() => new Worker(new URL('./worker/worker.ts', import.meta.url), { type: 'module' })
				)
			)
		);

	// ##:

	return identity<Bindings>({
		// State
		stateCollectionAnki$,
		// Commands
		onFileSelected
	});
});
