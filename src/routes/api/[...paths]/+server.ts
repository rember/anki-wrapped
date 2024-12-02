import * as Router from '$lib/server/router';
import * as RuntimeServer from '$lib/server/runtime';
import { HttpApp } from '@effect/platform';
import type { RequestHandler } from '@sveltejs/kit';
import { Effect, pipe } from 'effect';

// #:

const handlerSvelteKit: RequestHandler = async (event) => {
	const handlerWeb = await pipe(
		Effect.gen(function* () {
			const router = yield* Router.Router;
			const runtime = yield* Effect.promise(() => RuntimeServer.runtime.runtime());

			return HttpApp.toWebHandlerRuntime(runtime)(router);
		}),
		RuntimeServer.runtime.runPromise
	);
	return await handlerWeb(event.request);
};

// #:

export const GET = handlerSvelteKit;
export const POST = handlerSvelteKit;
