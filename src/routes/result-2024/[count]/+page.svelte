<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Exit, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import * as Bindings from './bindings';

	// ##: Props

	export let data: PageData;

	// ##: Bindings

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { stateImage$, downloadImage } = Bindings.make(data).pipe(
		Scope.extend(scope),
		runtime.runSync
	);
</script>

<h1>This image is SSRed</h1>

<div>
	{@html data.svg}
</div>

{#if $stateImage$._tag === 'Loading'}
	Loading...
{/if}
{#if $stateImage$._tag === 'Success'}
	<button onclick={() => void downloadImage.pipe(runtime.runFork)}> Download PNG </button>
{/if}
