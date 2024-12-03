<script lang="ts">
	import FeatResult_2024 from '$lib/feat-result-2024.svelte';
	import type { PageData } from './$types';

	// ##: Props

	export let data: PageData;
</script>

<svelte:head>
	<title>2024 Anki Wrapped — Result</title>
</svelte:head>

{#if data.dataImage != undefined && data.svg != undefined}
	<FeatResult_2024 dataImage={data.dataImage} svg={data.svg} />
{/if}
