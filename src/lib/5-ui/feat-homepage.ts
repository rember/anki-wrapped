import { goto } from '$app/navigation';
import { Effect, identity } from 'effect';
import { toast } from 'svelte-french-toast';
import { writable, type Readable } from 'svelte/store';
import * as Persistence from '../2-services/persistence';
import * as WorkerTasks from '../4-runtime/worker-tasks';

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
	const persistence = yield* Persistence.Persistence;
	const workerTasks = yield* WorkerTasks.WorkerTasks;

	// ##: State

	const stateCollectionAnki$ = writable<StateCollectionAnki>({ _tag: 'Idle' });

	// ##: Commands

	const onFileSelected = ({ file }: { file: File }) =>
		Effect.gen(function* () {
			stateCollectionAnki$.set({ _tag: 'Loading', file });

			const { dataImage } = yield* workerTasks.processCollectionAnki({ file });
			yield* persistence.setDataImage({ dataImage });

			yield* Effect.promise(() => goto('/result-2024'));
		}).pipe(
			Effect.tapErrorCause(Effect.logError),
			Effect.catchAll(() =>
				Effect.sync(() => {
					toast.error('Something went wrong');
				})
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
