<script lang="ts">
	import { Exit, Option, Scope } from 'effect';
	import { onDestroy } from 'svelte';
	import { runtime } from '../4-runtime/runtime';
	import * as CompProgressBarNavigating from './comp-progress-bar-navigating';

	// ##: Bindings

	const scope = Scope.make().pipe(runtime.runSync);
	onDestroy(() => void Scope.close(scope, Exit.succeed(undefined)).pipe(runtime.runFork));

	const { progress$ } = CompProgressBarNavigating.make.pipe(Scope.extend(scope), runtime.runSync);
</script>

{#if Option.isSome($progress$)}
	{@const progress = $progress$.value}
	<div
		class="fixed top-0 left-0 z-[999] h-1 bg-purple-300 transition-all duration-200 ease-out"
		style:width="{progress}%"
	></div>
{/if}
