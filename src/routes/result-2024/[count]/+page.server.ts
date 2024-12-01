import { Effect, Schema } from 'effect';

import * as RuntimeServer from '$lib/server/runtime';
import * as SvelteKit from '$lib/server/svelte-kit';

import * as GeneratorImage from '$lib/server/generate-image';
import { DataImage } from '$lib/shared/values';
import type { PageServerLoad } from './$types';

// #:

export const load: PageServerLoad<{
	dataImage: DataImage;
	svg: string;
}> = Effect.gen(function* () {
	yield* Effect.logDebug('Load page (server)');

	const event = yield* SvelteKit.ServerLoadEvent;
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
	RuntimeServer.toLoadServer({ span: { name: '/result-2024/+page.server' } })
);
