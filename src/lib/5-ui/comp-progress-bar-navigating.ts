import { browser } from '$app/environment';
import { navigating } from '$app/stores';
import type { Navigation } from '@sveltejs/kit';
import { Effect, Option, Schedule, Stream, identity, pipe } from 'effect';
import { writable, type Readable } from 'svelte/store';

// #: Types

export interface Bindings {
	// ##: State

	readonly progress$: Readable<Option.Option<number>>;
}

// #: make

export const make = Effect.gen(function* () {
	// ##: State

	const progress$ = writable<Option.Option<number>>(Option.none());

	// ##: Side effects

	const streamNavigating = browser
		? Stream.asyncPush<Option.Option<Navigation>>((emit) =>
				Effect.acquireRelease(
					Effect.sync(() =>
						navigating.subscribe((navigating) => emit.single(Option.fromNullable(navigating)))
					),
					(unsub) => Effect.sync(() => unsub())
				)
			)
		: Stream.empty;

	// Schedule for progress percentage while navigating:
	// Wait 200ms, emit 20, then every ~200ms increment the progress, up to 50
	const scheduleProgress = pipe(
		// Wait 200ms, then start at -1
		Schedule.duration('200 millis'),
		Schedule.map(() => -1),
		// Every ~200ms increment by one
		Schedule.andThen(Schedule.jittered(Schedule.spaced('200 millis'))),
		// Adjust to emit the sequence 20,21,22,23,...
		Schedule.map((cnt) => Math.min(20 + 1 + cnt, 50))
	);

	// Schedule for progress percentage after navigation end:
	// Emit 100 then wait 100ms and emit 100 again
	// NOTE: Basically we want the value of progress to be 100 for a short duration
	const scheduleProgressEnd = pipe(
		Schedule.fixed('100 millis'),
		Schedule.intersect(Schedule.recurs(2)),
		Schedule.map(() => 100)
	);

	yield* pipe(
		streamNavigating,
		Stream.map(Option.isSome),
		Stream.changes,
		Stream.flatMap(
			(navigating) => {
				if (navigating) {
					return pipe(Stream.fromSchedule(scheduleProgress), Stream.map(Option.some));
				} else {
					return Stream.make(Option.none());
				}
			},
			{ switch: true }
		),
		// Poor man's "pairwise" operator
		Stream.scan(
			[Option.none<number>(), Option.none<number>()] as const,
			([progress], progressNext) => [progressNext, progress] as const
		),
		// Detect progress switching from `Option.some(...)` to `Option.none()`.
		Stream.flatMap(([progress, progressPrev]) => {
			if (Option.isSome(progressPrev) && Option.isNone(progress)) {
				return pipe(
					Stream.fromSchedule(scheduleProgressEnd),
					Stream.map(Option.some),
					Stream.concat(Stream.make(Option.none()))
				);
			} else {
				return Stream.make(progress);
			}
		}),
		Stream.runForEach((progress) => Effect.sync(() => progress$.set(progress))),
		Effect.forkScoped
	);

	// ##:

	return identity<Bindings>({
		// State
		progress$
	});
});
