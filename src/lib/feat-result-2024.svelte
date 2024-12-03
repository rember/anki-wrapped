<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Array, Exit, Option, pipe, Record, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import CompImage from './comp-image.svelte';
	import * as FeatResult2024 from './feat-result-2024';
	import { TS_END, TS_START, type DataImage } from './values';

	// ##: Props

	export let dataImage: DataImage;
	export let svg: string;

	// ##: Bindings

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { stateImage$, downloadImage } = FeatResult2024.make({ dataImage, svg }).pipe(
		Scope.extend(scope),
		runtime.runSync
	);
</script>

<h1>This image is SSRed</h1>

<!-- TODO: -->
<div class="flex flex-row gap-16">
	<div>
		{@html svg}
	</div>

	<CompImage {dataImage} />
</div>

{#if $stateImage$._tag === 'Loading'}
	Loading...
{/if}
{#if $stateImage$._tag === 'Success'}
	<!-- TODO: -->
	<button onclick={() => void downloadImage.pipe(runtime.runFork)}>Download PNG</button>
{/if}
