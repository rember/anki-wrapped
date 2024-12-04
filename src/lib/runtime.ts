import { goto } from '$app/navigation';
import * as Kit from '@sveltejs/kit';
import { Cause, Effect, Exit, identity, Layer, Logger, ManagedRuntime, pipe, Tracer } from 'effect';
import * as PostHog from './posthog';
import * as Storage from './storage';
import * as SvelteKit from './svelte-kit';

// #: Runtime

export type Services = Storage.Storage | PostHog.PostHog;

export const layer = Layer.mergeAll(Storage.Storage.Default, PostHog.PostHog.Default).pipe(
	Layer.provide(Logger.pretty)
);

export const runtime: ManagedRuntime.ManagedRuntime<Services, never> = ManagedRuntime.make(
	pipe(layer, Layer.tapErrorCause(Effect.logError), Layer.orDie)
);

// #: SvelteKit's load function

export const toLoad =
	({ span }: { span: { name: string; options?: Tracer.SpanOptions | undefined } }) =>
	<A>(self: Effect.Effect<A, SvelteKit.Redirect, Services | SvelteKit.LoadEvent>) =>
	(event: Kit.LoadEvent) =>
		pipe(
			self,
			Effect.provideService(SvelteKit.LoadEvent, event),
			// NOTE: `tapErrorCause` intercepts all defects.
			Effect.tapErrorCause((cause) =>
				Effect.gen(function* () {
					if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Redirect') {
						yield* Effect.logError(cause.error);
						return yield* Effect.log(cause.error.message);
					}
					return yield* Effect.logError(cause);
				})
			),
			Effect.withLogSpan(span.name),
			Effect.withSpan(span.name, span.options),
			Effect.exit,
			runtime.runPromise
		).then(
			Exit.match({
				onFailure: (cause) => {
					if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Redirect') {
						goto(cause.error.location);
						return undefined;
					}
					if (Cause.isFailType(cause)) {
						throw cause.error;
					}
					throw cause;
				},
				onSuccess: identity
			})
		);
