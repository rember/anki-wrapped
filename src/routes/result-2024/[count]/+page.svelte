<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
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
