<script lang="ts">
	import * as RuntimeUniversal from '$lib/universal/runtime';
	import { Exit, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import * as Bindings from './bindings';

	export let data: PageData;

	// ##: Bindings

	const scope = Scope.make().pipe(RuntimeUniversal.runtime.runSync);
	onDestroy(
		() => void Scope.close(scope, Exit.succeed(undefined)).pipe(RuntimeUniversal.runtime.runFork)
	);

	const { stateImage$, downloadImage } = Bindings.make(data).pipe(
		Scope.extend(scope),
		RuntimeUniversal.runtime.runSync
	);
</script>

<svelte:head>
	<meta property="og:image" content="/api/image-result-2024/${data.dataImage.count}" />
	<meta property="og:image:width" content="600" />
	<meta property="og:image:height" content="400" />
	<meta property="og:image:type" content="image/png" />
</svelte:head>

<h1>This image is SSRed</h1>

<div>
	{@html data.svg}
</div>

{#if $stateImage$._tag === 'Loading'}
	Loading...
{/if}
{#if $stateImage$._tag === 'Success'}
	<button onclick={() => void downloadImage.pipe(RuntimeUniversal.runtime.runFork)}>
		Download PNG
	</button>
{/if}
