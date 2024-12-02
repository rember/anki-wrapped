import { Effect, Schema } from 'effect';

import { toLoad } from '$lib/runtime';
import * as SvelteKit from '$lib/svelte-kit';

import * as Image from '$lib/image';
import { DataImage } from '$lib/values';
import type { PageLoad } from './$types';

// #:

export const load: PageLoad<{
	dataImage: DataImage;
	svg: string;
}> = Effect.gen(function* () {
	yield* Effect.logDebug('Load page (server)');

	const event = yield* SvelteKit.LoadEvent;
	const image = yield* Image.Image;

	const countEnc = event.params.count;
	const dataImage = yield* Schema.decodeUnknown(DataImage)({ count: countEnc });

	const svg = yield* image.generateSvg({ dataImage });

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
