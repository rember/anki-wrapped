<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Exit, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import * as FeatResult2024 from './feat-result-2024';
	import { type DataImage } from './values';

	// ##: Props

	export let dataImage: DataImage;
	export let svg: string;

	// ##: Bindings

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { statePng$, stateMarketingEmail$, downloadPng, createMarketingEmail, onInputEmail } =
		FeatResult2024.make({
			dataImage,
			svg
		}).pipe(Scope.extend(scope), runtime.runSync);
</script>

<div
	class="flex min-h-svh flex-row flex-wrap items-center justify-center gap-16 bg-white px-4 py-16"
>
	<!-- #: SVG -->

	<div class="mt-2 h-[640px] w-[360px]">
		{@html svg}
	</div>

	<div class="flex h-[650px] w-[360px] flex-col gap-8 pt-[2px]">
		<!-- #: Header -->

		<div class="text-3xl font-bold text-[#000c3a]">Here is your 2024 Anki Wrapped</div>

		<button
			class="h-16 rounded-lg bg-[#000c3a] font-semibold text-white outline-none enabled:hover:bg-[#003d64] enabled:focus:bg-[#003d64] disabled:opacity-40"
			disabled={$statePng$._tag !== 'Ready'}
			onclick={() => void downloadPng.pipe(runtime.runFork)}
		>
			{#if $statePng$._tag === 'Rendering'}
				Rendering image...
			{/if}
			{#if $statePng$._tag === 'Ready'}
				Download image
			{/if}
			{#if $statePng$._tag === 'Downloaded'}
				Share the image with your friends!
			{/if}
		</button>

		<a
			href="https://rember.com"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 outline-none"
		>
			<div class="font-semibold text-[#000c3a]">Built by the team behind</div>
			<enhanced:img src="$lib/assets/rember-logo-text.png" class="mb-[0.39rem] w-14" alt="Rember" />
		</a>

		<div class="flex-1"></div>

		<!-- #: Footer -->

		<div class="flex flex-col gap-2">
			<div class="font-semibold text-[#000c3a]">
				We are building a new spaced repetition system, interested?
			</div>

			<div class="flex gap-4">
				{#if $stateMarketingEmail$._tag === 'Ready' || $stateMarketingEmail$._tag === 'Loading'}
					<input
						type="text"
						name="email"
						inputmode="email"
						autocomplete="email"
						autocorrect="off"
						autocapitalize="off"
						placeholder="Enter your email address..."
						class="flex-1 rounded bg-gray-50 p-2 text-gray-700"
						disabled={$stateMarketingEmail$._tag === 'Loading'}
						value={$stateMarketingEmail$.email}
						oninput={(e) =>
							void onInputEmail({ value: e.currentTarget.value }).pipe(runtime.runFork)}
					/>

					<button
						class="rounded bg-[#26b09a] p-2 font-semibold text-white outline-none enabled:hover:bg-[#198586] enabled:focus:bg-[#198586] disabled:opacity-40"
						class:text-transparent={$stateMarketingEmail$._tag === 'Loading'}
						class:animate-pulse={$stateMarketingEmail$._tag === 'Loading'}
						onclick={() => void createMarketingEmail.pipe(runtime.runFork)}
						disabled={$stateMarketingEmail$._tag === 'Loading'}
					>
						Let's go!
					</button>
				{/if}
				{#if $stateMarketingEmail$._tag === 'Success'}
					<div class="flex-1 rounded bg-[#26b09a] p-2 font-semibold text-white opacity-40">
						Thank you for subscribing!
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
