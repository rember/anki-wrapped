<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Exit, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import Dropzone from 'svelte-file-dropzone';
	import CompBackgroundStarryNight from './comp-background-starry-night.svelte';
	import * as FeatHomepage from './feat-homepage';

	// ##:

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { stateCollectionAnki$, onFileSelected } = FeatHomepage.make.pipe(
		Scope.extend(scope),
		runtime.runSync
	);
</script>

<CompBackgroundStarryNight klass="relative min-h-svh flex flex-col items-center gap-24 pt-16">
	<!-- #: Header -->

	<div class="flex max-w-[36rem] flex-1 flex-col justify-center gap-8 px-4 pt-16">
		<h1 class="text-center text-7xl font-black text-white">
			<span class="font-bold">2024</span><br />Anki Wrapped
		</h1>
		<p class="text-center text-2xl text-gray-300">
			Your year in spaced repetition flashcards, like Spotify Wrapped but for your Anki collection.
		</p>
	</div>

	<!-- #: Steps -->

	<div
		class="grid grid-cols-[auto] grid-rows-[auto,auto] gap-x-8 gap-y-12 px-4 lg:grid-cols-[auto,auto] lg:pl-6 lg:pr-20"
	>
		<!-- Step 1 -->
		<div class="flex gap-4 text-white">
			<div
				class="center mt-1 flex size-10 flex-none items-center justify-center rounded-full bg-white bg-opacity-40 text-center text-lg font-bold"
			>
				1
			</div>
			<div class="flex flex-col gap-3">
				<div class="w-[318px] font-semibold text-gray-300">
					In Anki, go to the <span class="text-white">File</span> menu and select
					<span class="text-white">Export...</span>
				</div>
				<enhanced:img
					src="$lib/assets/step1.png"
					class="h-[168px] w-[318px] rounded-xl"
					alt="Click on Export in Anki"
				/>
			</div>
		</div>
		<!-- Step 2 -->
		<div class="flex gap-4 text-white">
			<div
				class="center mt-1 flex size-10 flex-none items-center justify-center rounded-full bg-white bg-opacity-40 text-center text-lg font-bold"
			>
				2
			</div>
			<div class="flex flex-col gap-3">
				<div class="w-[318px] font-semibold text-gray-300">
					Select the <span class="text-white">.colpkg</span> format, uncheck all checkboxes, then
					click
					<span class="text-white">Export...</span>
				</div>
				<enhanced:img
					src="$lib/assets/step2.png"
					class="h-[168px] w-[318px] rounded-xl"
					alt="Export the .colpkg file"
				/>
			</div>
		</div>
		<!-- Step 3 -->
		<div class="flex gap-4 text-white lg:col-span-2">
			<div
				class="center mt-1 flex size-10 flex-none items-center justify-center rounded-full bg-white bg-opacity-40 text-center text-lg font-bold"
			>
				3
			</div>
			<div class="flex flex-1 flex-col gap-3">
				<div class="w-[318px] font-semibold text-gray-300 lg:w-full">
					Drag the exported <span class="text-white">.colpkg</span> file, or click below to select a
					file
				</div>
				<div
					class="h-[168px] w-[318px] overflow-hidden rounded-xl border-4 border-dashed border-white border-opacity-30 bg-white bg-opacity-60 outline-none focus-within:bg-opacity-70 hover:bg-opacity-70 lg:w-full"
				>
					{#if $stateCollectionAnki$._tag === 'Idle'}
						<Dropzone
							containerClasses="size-full text-white flex justify-center items-center font-semibold p-4 outline-none"
							disableDefaultStyles={true}
							multiple={false}
							on:drop={(e) => {
								if (e.detail.acceptedFiles.length === 0) {
									return;
								}
								if (!e.detail.acceptedFiles[0].name.endsWith('.colpkg')) {
									return;
								}
								if (e.detail.acceptedFiles.length > 1) {
									throw new Error('Unreachable');
								}
								onFileSelected({ file: e.detail.acceptedFiles[0] }).pipe(runtime.runFork);
							}}
						/>
					{/if}

					{#if $stateCollectionAnki$._tag === 'Loading'}
						<div class="flex size-full items-center justify-center p-4 font-semibold text-white">
							Loading...
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- #: Footer -->

	<div
		class="flex flex-col flex-wrap items-center justify-between gap-3 self-center px-4 py-3 text-sm text-white lg:px-6"
	>
		<a
			href="https://rember.com"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 rounded-full border border-gray-200 border-opacity-30 bg-gray-200 bg-opacity-60 px-4 py-2 outline-none hover:bg-opacity-70 focus:bg-opacity-70"
		>
			<div class="font-semibold">Built by the team behind</div>
			<enhanced:img src="$lib/assets/rember-logo-text.png" class="mb-[0.39rem] w-14" alt="Rember" />
		</a>
		<div class="opacity-60">This tool is not affiliated with or endorsed by Anki.</div>
	</div>
</CompBackgroundStarryNight>
