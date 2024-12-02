<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { setCtxRuntime } from '$lib/services';
	import '../app.css';
	let { children } = $props();

	setCtxRuntime(runtime);
</script>

{@render children()}
