<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import CompProgressBarNavigating from '$lib/comp-progress-bar-navigating.svelte';
	import * as PostHog from '$lib/posthog';
	import { runtime } from '$lib/runtime';
	import '@fontsource-variable/inter';
	import { Effect, pipe } from 'effect';
	import '../app.css';

	// ##: Props

	let { children } = $props();

	// ##: Posthog

	if (browser) {
		beforeNavigate(() =>
			pipe(
				PostHog.PostHog,
				Effect.andThen((posthog) => posthog.capture({ event: '$pageleave' })),
				runtime.runSync
			)
		);
		afterNavigate(() =>
			pipe(
				PostHog.PostHog,
				Effect.andThen((posthog) => posthog.capture({ event: '$pageview' })),
				runtime.runSync
			)
		);
	}
</script>

<CompProgressBarNavigating />

{@render children()}
