<!--
  WARN: This component is not used in the webapp. It's a reference for the
  Satori code in the Image service.
-->
<script lang="ts">
	import { Array, Option, pipe, Record } from 'effect';
	import CompBackgroundStarryNight from './comp-background-starry-night.svelte';
	import { TS_END, TS_START, type DataImage } from './values';

	// ##: Props

	export let dataImage: DataImage;

	// ##:

	const dateStart = new Date(TS_START);
	const dateEnd = new Date(TS_END);

	const arrayDateIso: string[] = [];
	const dateCurrent = new Date(dateStart);
	while (dateCurrent < dateEnd) {
		arrayDateIso.push(dateCurrent.toISOString().split('T')[0]);
		dateCurrent.setDate(dateCurrent.getDate() + 1);
	}

	const recordHeatmap = pipe(
		dataImage.heatmapReviews,
		Array.map(({ dateIso, countReviews }) => [dateIso, countReviews] as const),
		Record.fromEntries
	);
	const dateIsoToOpacityHeatmap = (dateIso: string) => {
		const optionCountReviews = Record.get(recordHeatmap, dateIso);
		if (Option.isNone(optionCountReviews)) return 0.2;
		const countReviews = optionCountReviews.value;
		if (countReviews === 0) return 0.2;
		if (countReviews < 25) return 0.6;
		if (countReviews < 50) return 0.7;
		if (countReviews < 75) return 0.8;
		if (countReviews < 100) return 0.9;
		return 1;
	};

	const stripEmojis = (str: string) =>
		str
			.replace(
				/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
				''
			)
			.replace(/\s+/g, ' ')
			.trim();
</script>

<CompBackgroundStarryNight klass="p-[20px] flex h-[640px] w-[360px]">
	<!-- #: Heatmap -->
	<div class="flex w-1/3 justify-center pr-[5px] pt-[3px]">
		<div class="flex w-[76px] flex-row flex-wrap gap-[3px]">
			<!-- NOTE: Dec 1 2023 is a Friday -->
			<div class="size-[7px] flex-none"></div>
			<div class="size-[7px] flex-none"></div>
			<div class="size-[7px] flex-none"></div>
			<div class="size-[7px] flex-none"></div>
			{#each arrayDateIso as dateIso}
				<div
					class="size-[7px] flex-none bg-white"
					style="opacity: {dateIsoToOpacityHeatmap(dateIso)}"
				></div>
			{/each}
		</div>
	</div>

	<!-- #: Stats -->
	<div class="flex w-2/3 flex-col gap-[20px]">
		<!-- Reviews -->
		<div class="flex flex-col">
			<div class="text-white">Reviews</div>
			<div class="text-[32px] font-[700] leading-[40px] text-white">
				{dataImage.countReviews.toLocaleString('en-US')}
			</div>
		</div>

		<!-- Minutes Reviewed -->
		<div class="flex flex-col">
			<div class="text-white">Minutes Reviewed</div>
			<div class="text-[32px] font-[700] leading-[40px] text-white">
				{dataImage.minutesSpentReviewing.toLocaleString('en-US')}
			</div>
		</div>

		<!-- Cards Created -->
		<div class="flex flex-col">
			<div class="text-white">Cards Created</div>
			<div class="text-[32px] font-[700] leading-[40px] text-white">
				{dataImage.countCardsCreated.toLocaleString('en-US')}
			</div>
		</div>

		<!-- Top Decks -->
		<div class="flex flex-1 flex-col">
			<div class="pb-[4px] text-white">Top Decks</div>
			{#each dataImage.top5DecksByCountReviews as { name }, ix}
				<div class="flex gap-[12px]">
					<div class="font-[700] text-white">
						{(ix + 1).toLocaleString('en-US')}
					</div>
					<div class="truncate font-[700] text-white">
						{stripEmojis(name)}
					</div>
				</div>
			{/each}
		</div>

		<!-- URL -->
		<div class="font-[500] text-white">ANKIWRAPPED.COM</div>
	</div>
</CompBackgroundStarryNight>
