import { Effect, Schema } from 'effect';

import { toLoad } from '$lib/universal/runtime';
import * as SvelteKit from '$lib/universal/svelte-kit';

import * as GeneratorImage from '$lib/shared/generator-image';
import { DataImage } from '$lib/shared/values';
import type { PageLoad } from './$types';

// #:

export const load: PageLoad<{
	dataImage: DataImage;
	svg: string;
}> = Effect.gen(function* () {
	yield* Effect.logDebug('Load page (server)');

	const event = yield* SvelteKit.LoadEvent;
	const generatorImage = yield* GeneratorImage.GeneratorImage;

	const countEnc = event.params.count;
	const dataImage = yield* Schema.decodeUnknown(DataImage)({ count: countEnc });

	const svg = yield* generatorImage.generateSvg({ dataImage });

	return {
		dataImage,
		svg
	};
}).pipe(
	Effect.catchTags({
		ParseError: (_) => Effect.die(_)
	}),
	toLoad({ span: { name: '/result-2024/+page' } })
);
