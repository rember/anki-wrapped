import { Effect } from 'effect';

import { toLoad } from '$lib/runtime';

import type { LayoutLoad } from './$types.js';

// #:

export const ssr = true;

// #:

// NOTE: This load function forces creating the services in the runtime before
// the page loads.
export const load: LayoutLoad = Effect.gen(function* () {
	yield* Effect.logDebug('Load layout (universal)');
	return undefined;
}).pipe(toLoad({ span: { name: '/+layout' } }));