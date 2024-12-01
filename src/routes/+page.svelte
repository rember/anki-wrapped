<script lang="ts">
	let randomNumber = $state(Math.floor(Math.random() * 10000));

	function regenerateNumber() {
		randomNumber = Math.floor(Math.random() * 10000);
	}
</script>

<button class="rounded bg-gray-100 px-2 py-1 hover:bg-gray-200" onclick={regenerateNumber}
	>Regenerate Random Number</button
>
<div>Random Number: <span class="font-semibold">{randomNumber}</span></div>
<a class="text-blue-500 hover:underline" href={`/result-2024/${randomNumber}`}>Link</a>
