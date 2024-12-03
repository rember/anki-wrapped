<script lang="ts">
	import CompBackgroundStarryNight from './comp-background-starry-night.svelte';
</script>

<div class="relative h-svh min-h-svh">
	<!-- #: Background -->

	<div class="absolute inset-0 size-full">
		<CompBackgroundStarryNight />
	</div>

	<div class="absolute inset-0 z-10 flex size-full flex-col items-center">
		<!-- #: Main Content -->

		<div class="flex max-w-[36rem] flex-1 flex-col justify-center gap-8 px-4">
			<h1 class="text-center text-7xl font-black text-white">
				<span class="font-bold">2024</span><br />Anki Wrapped
			</h1>
			<p class="text-center text-2xl text-gray-300">
				Your year in spaced repetition flashcards, like Spotify Wrapped but for your Anki
				collection.
			</p>
			<div class="mt-8 text-center text-2xl text-white">Coming soon</div>
		</div>

		<!-- #: Footer -->

		<div
			class="flex flex-wrap items-center justify-between gap-3 self-stretch px-6 py-3 text-sm text-white"
		>
			<a
				href="https://rember.com"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 rounded-full border border-gray-200 border-opacity-30 bg-gray-200 bg-opacity-60 px-4 py-2"
			>
				<div class="font-semibold">Built by the team behind</div>
				<enhanced:img
					src="$lib/assets/rember-logo-text.png"
					class="mb-[0.39rem] w-14"
					alt="Rember"
				/>
			</a>
			<div class="opacity-60">This tool is not affiliated with or endorsed by Anki.</div>
		</div>
	</div>
</div>
