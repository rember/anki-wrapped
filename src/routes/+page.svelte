<script lang="ts">
	import { runtime } from '$lib/runtime';
	import { Exit, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import Dropzone from 'svelte-file-dropzone';
	import * as Bindings from './bindings';

	// ##:

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { stateCollectionAnki$, onFileSelected } = Bindings.make.pipe(
		Scope.extend(scope),
		runtime.runSync
	);
</script>

{#if $stateCollectionAnki$._tag === 'Idle'}
	<Dropzone
		accept="application/x-colpkg"
		multiple={false}
		on:drop={(e) => {
			if (e.detail.acceptedFiles.length === 0) {
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
	Loading...
{/if}
