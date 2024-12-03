<svelte:head>
	<title>2024 Anki Wrapped</title>

	<!-- SEO Meta Tags -->
	<meta name="title" content="2024 Anki Wrapped: Your Year in Spaced Repetition Flashcards" />
	<meta
		name="description"
		content="Anki Wrapped is like Spotify Wrapped, but for your Anki flashcard collection. Discover fun stats about your learning habits with spaced repetition."
	/>
	<meta
		name="keywords"
		content="Anki Wrapped, 2024, Anki spaced repetition flashcards, spaced repetition flashcard stats, Anki year in review, Anki collection analytics, Rember"
	/>
	<meta name="robots" content="index, follow" />
	<meta name="author" content="Rember Team" />

	<!-- Open Graph Meta Tags -->
	<meta
		property="og:title"
		content="2024 Anki Wrapped: Your Year in Spaced Repetition Flashcards"
	/>
	<meta
		property="og:description"
		content="Anki Wrapped is like Spotify Wrapped, but for your Anki flashcard collection. Discover fun stats about your learning habits with spaced repetition."
	/>
	<meta property="og:url" content="https://ankiwrapped.com" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://ankiwrapped.com/og-image.png" />
	<meta property="og:site_name" content="Anki Wrapped" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Meta Tags -->
	<meta
		name="twitter:title"
		content="2024 Anki Wrapped: Your Year in Spaced Repetition Flashcards"
	/>
	<meta
		name="twitter:description"
		content="Anki Wrapped is like Spotify Wrapped, but for your Anki flashcard collection. Discover fun stats about your learning habits with spaced repetition."
	/>
	<meta name="twitter:image" content="https://ankiwrapped.com/images/preview.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="flex h-full flex-col items-center">
	<div class="flex max-w-[36rem] flex-1 flex-col justify-center gap-8 px-4">
		<h1 class="text-center text-7xl font-black text-white">
			<span class="font-bold">2024</span><br />Anki Wrapped
		</h1>
		<p class="text-center text-2xl text-gray-300">
			Your year in spaced repetition flashcards, like Spotify Wrapped but for your Anki collection.
		</p>
		<div class="mt-8 text-center text-2xl text-white">Coming soon</div>
	</div>

	<div
		class="flex flex-wrap items-center justify-between gap-3 self-stretch px-6 py-3 text-sm text-white"
	>
		<a
			href="https://rember.com"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 rounded-full border border-gray-200 border-opacity-30 bg-gray-200 bg-opacity-60 px-4 py-2"
		>
			<div class="font-semibold">Built by the team behind</div>
			<enhanced:img src="$lib/assets/rember-logo-text.png" class="mb-[0.39rem] w-14" alt="Rember" />
		</a>
		<div class="opacity-60">This tool is not affiliated with or endorsed by Anki.</div>
	</div>
</div>
