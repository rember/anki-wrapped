import { browser } from '$app/environment';
import * as Kit from '@sveltejs/kit';
import { Cause, Effect, Exit, identity, Layer, Logger, ManagedRuntime, pipe } from 'effect';
import * as Persistence from '../2-services/persistence';
import * as PostHog from '../2-services/posthog';
import * as SvelteKit from '../2-services/svelte-kit';
import * as WorkerTasks from './worker-tasks';

// #: Runtime

export type Services = Persistence.Persistence | PostHog.PostHog | WorkerTasks.WorkerTasks;

export const layer = pipe(
	browser
		? Layer.mergeAll(
				Persistence.Persistence.Default,
				import.meta.env.MODE === 'development' ? PostHog.layerLog : PostHog.PostHog.Default,
				WorkerTasks.WorkerTasks.Default
			)
		: Layer.mergeAll(Persistence.layerEmpty, PostHog.layerEmpty, WorkerTasks.layerEmpty),
	Layer.provide(Logger.pretty)
);

export const runtime: ManagedRuntime.ManagedRuntime<Services, never> = ManagedRuntime.make(
	pipe(layer, Layer.tapErrorCause(Effect.logError), Layer.orDie)
);

// #: SvelteKit's `load` function

export const toLoad =
	({ span }: { span: { name: string } }) =>
	<A>(self: Effect.Effect<A, never, Services | SvelteKit.LoadEvent>) =>
	(event: Kit.LoadEvent) =>
		pipe(
			self,
			Effect.provideService(SvelteKit.LoadEvent, event),
			Effect.tapErrorCause(Effect.logError),
			Effect.withLogSpan(span.name),
			Effect.exit,
			runtime.runPromise
		).then(
			Exit.match({
				onFailure: (cause) => {
					if (Cause.isFailType(cause)) {
						throw cause.error;
					} else {
						throw cause;
					}
				},
				onSuccess: identity
			})
		);
