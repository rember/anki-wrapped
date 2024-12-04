<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Array, Effect, pipe, Random } from 'effect';
	import type { Snippet } from 'svelte';

	// ##: Props

	let { children, klass }: { children: Snippet<[]>; klass: string } = $props();

	// ##:

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
		Effect.provideService(Random.Random, Random.make('ankiwrapped')),
		runtime.runSync
	);
</script>

<div class={`bg-starry-night ${klass}`}>
	<div class="absolute inset-x-0 top-0 h-[70%]">
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
