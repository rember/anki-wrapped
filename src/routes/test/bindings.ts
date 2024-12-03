import * as CollectionAnki from '$lib/collection-anki';
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

	// ##: State

	const stateCollectionAnki$ = writable<StateCollectionAnki>({ _tag: 'Idle' });

	// ##: Commands

	const onFileSelected = ({ file }: { file: File }) =>
		Effect.gen(function* () {
			stateCollectionAnki$.set({ _tag: 'Loading', file });
			yield* collectionAnki.processFile({ file });
		}).pipe(Effect.tapErrorCause(Effect.logError), Effect.orDie);

	// ##:

	return identity<Bindings>({
		// State
		stateCollectionAnki$,
		// Commands
		onFileSelected
	});
});
