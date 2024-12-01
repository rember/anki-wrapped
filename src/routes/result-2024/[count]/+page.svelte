<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>This image is SSRed</h1>

<div>
	{@html data.svg}
</div>
