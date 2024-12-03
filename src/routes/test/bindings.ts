import { goto } from '$app/navigation';
import * as CollectionAnki from '$lib/collection-anki';
import * as Storage from '$lib/storage';
import { Effect, identity } from 'effect';
import { writable, type Readable } from 'svelte/store';

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
	const collectionAnki = yield* CollectionAnki.CollectionAnki;
	const storage = yield* Storage.Storage;

	// ##: State

	const stateCollectionAnki$ = writable<StateCollectionAnki>({ _tag: 'Idle' });

	// ##: Commands

	const onFileSelected = ({ file }: { file: File }) =>
		Effect.gen(function* () {
			stateCollectionAnki$.set({ _tag: 'Loading', file });
			const dataImage = yield* collectionAnki.processFile({ file });
			yield* storage.createDataImage({ dataImage });
			yield* Effect.promise(() => goto('/result-2024'));
		}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

	// ##:

	return identity<Bindings>({
		// State
		stateCollectionAnki$,
		// Commands
		onFileSelected
	});
});
