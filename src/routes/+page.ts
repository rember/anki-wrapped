import { Effect, pipe } from 'effect';

import { toLoad } from '$lib/4-runtime/runtime';

import { browser } from '$app/environment';
import { preloadCode } from '$app/navigation';
import type { PageLoad } from './$types.js';

// #:

export const prerender = true;

// #:

// NOTE: This load function forces creating the services in the runtime before
// the page loads.
export const load: PageLoad = Effect.gen(function* () {
	yield* Effect.logDebug('Load page');

	// Preload imports for /result-2024
	if (browser) {
		yield* pipe(
			Effect.promise(() => preloadCode('/result-2024')),
			Effect.forkDaemon
		);
	}

	return undefined;
}).pipe(toLoad({ span: { name: 'page /' } }));
