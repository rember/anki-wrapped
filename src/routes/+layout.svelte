<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import * as PostHog from '$lib/posthog';
	import { runtime } from '$lib/runtime';
	import '@fontsource-variable/inter';
	import { Array, Effect, pipe, Random } from 'effect';
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

	// ##: Background stars

	const stars = pipe(
		Array.replicate(
			Effect.gen(function* () {
				const random = yield* Random.Random;
				return {
					x: (yield* random.next) * 100,
					y: (yield* random.next) * 100,
					size: (yield* random.next) * 2 + 1,
					opacity: (yield* random.next) * 0.8 + 0.2
				};
			}),
			150
		),
		Effect.all,
		Effect.provideService(Random.Random, Random.make('anki-wrapped')),
		runtime.runSync
	);
</script>

<div class="bg-starry-night relative h-svh min-h-svh">
	<div class="absolute inset-x-0 top-0 h-[70svh]">
		{#each stars as star}
			<div
				class="absolute rounded-full bg-white"
				style="
				left: {star.x}%;
				top: {star.y}%;
				width: {star.size}px;
				height: {star.size}px;
				opacity: {star.opacity};
			"
			></div>
		{/each}
	</div>

	{@render children()}
</div>

<style>
	.bg-starry-night {
		background-image: radial-gradient(
			circle at 50% -150%,
			#000c3a,
			#000c3a 80%,
			#003d64 90%,
			#26b09a 100%
		);
	}
</style>
