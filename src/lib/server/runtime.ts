import * as Kit from '@sveltejs/kit';
import { Cause, Effect, Exit, identity, Layer, ManagedRuntime, pipe, Tracer } from 'effect';
import * as GeneratorImage from '../shared/generator-image';
import * as RendererImage from './renderer-image';
import * as Router from './router';
import * as SvelteKit from './svelte-kit';

// #: Runtime

export type Services = Router.Router | GeneratorImage.GeneratorImage | RendererImage.RendererImage;

export const layer = Layer.mergeAll(
	GeneratorImage.GeneratorImage.Default,
	RendererImage.RendererImage.Default,
	Router.Router.Default
);

export const runtime: ManagedRuntime.ManagedRuntime<Services, never> = ManagedRuntime.make(
	pipe(layer, Layer.tapErrorCause(Effect.logError), Layer.orDie)
);

// #: SvelteKit's load function

export const toLoadServer =
	({ span }: { span: { name: string; options?: Tracer.SpanOptions | undefined } }) =>
	<A>(
		self: Effect.Effect<
			A,
			SvelteKit.Error | SvelteKit.Redirect,
			Services | SvelteKit.ServerLoadEvent
		>
	) =>
	(event: Kit.ServerLoadEvent) => {
		return self
			.pipe(
				Effect.provideService(SvelteKit.ServerLoadEvent, event),
				// NOTE: `tapErrorCause` intercepts all defects.
				Effect.tapErrorCause((cause) =>
					Effect.gen(function* () {
						if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Error') {
							return yield* Effect.logError(cause);
						}
						if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Redirect') {
							return yield* Effect.log(cause.error.messageLog);
						}
						return yield* Effect.logError(cause);
					})
				),
				Effect.withLogSpan(span.name),
				Effect.withSpan(span.name, span.options),
				Effect.exit,
				runtime.runPromise
			)
			.then(
				Exit.match({
					onFailure: (cause) => {
						if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Error') {
							return Kit.error(cause.error.status, cause.error.message);
						}
						if (Cause.isFailType(cause) && cause.error._tag === 'SvelteKit/Redirect') {
							return Kit.redirect(cause.error.status, cause.error.location);
						}
						return Kit.error(500, 'Unexpected error');
					},
					onSuccess: identity
				})
			);
	};
