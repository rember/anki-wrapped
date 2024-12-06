<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import * as PostHog from '$lib/2-services/posthog';
	import { runtime } from '$lib/4-runtime/runtime';
	import CompProgressBarNavigating from '$lib/5-ui/comp-progress-bar-navigating.svelte';
	import '@fontsource-variable/inter';
	import { Effect, pipe } from 'effect';
	import { Toaster } from 'svelte-french-toast';
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

<Toaster />

<CompProgressBarNavigating />

{@render children()}
