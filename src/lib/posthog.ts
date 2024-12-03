import { browser } from '$app/environment';
import { Effect, pipe } from 'effect';
import type * as PostHogJS from 'posthog-js';

// #: Types

interface ArgsCapture extends PostHogJS.CaptureOptions {
	readonly event: string;
	readonly properties?: Record<string, unknown> | undefined;
}

// #:

export class PostHog extends Effect.Service<PostHog>()('PostHog', {
	scoped: Effect.gen(function* () {
		// ##: Return empty service in SSR
		// WARN: Cannot import from "posthog-js" in NodeJS

		if (!browser) {
			return {
				capture: () => Effect.dieMessage('Not supported in SSR')
			};
		}

		// ##: Return a mock service in development

		if (import.meta.env.MODE === 'development') {
			return {
				capture: (args: ArgsCapture) =>
					pipe(
						Effect.log(`Capture ${args.event}`),
						Effect.annotateLogs(args.properties ?? {}),
						Effect.withLogSpan('PostHog')
					)
			};
		}

		// ##: client

		const PostHogJS = yield* Effect.promise(() => import('posthog-js'));

		yield* Effect.sync(() =>
			PostHogJS.posthog.init('phc_GiJq1yxbxhiXxPFvDgZ2pBNv0Pg2xm5ivqkO0tPefQI', {
				api_host: 'https://us.i.posthog.com',
				person_profiles: 'identified_only',
				// Custom setup for SvelteKit
				// REFS: https://posthog.com/docs/libraries/svelte
				capture_pageview: false,
				capture_pageleave: false
			})
		);

		// ##: capture

		const capture = (args: ArgsCapture) =>
			Effect.sync(() => PostHogJS.posthog.capture(args.event, args.properties, args));

		// ##:

		return {
			capture
		};
	})
}) {}
