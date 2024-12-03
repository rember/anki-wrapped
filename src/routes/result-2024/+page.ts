import { Effect } from 'effect';

import { toLoad } from '$lib/runtime';
import * as Storage from '$lib/storage';

import * as Image from '$lib/image';
import * as SvelteKit from '$lib/svelte-kit';
import { DataImage } from '$lib/values';
import type { PageLoad } from './$types';

// #:

export const load: PageLoad<
	| {
			dataImage: DataImage;
			svg: string;
	  }
	| undefined
> = Effect.gen(function* () {
	yield* Effect.logDebug('Load page');

	const image = yield* Image.Image;
	const storage = yield* Storage.Storage;

	const optionDataImage = yield* storage.getDataImage;
	const dataImage = yield* optionDataImage;

	const svg = yield* image.generateSvg({ dataImage });

	return {
		dataImage,
		svg
	};
}).pipe(
	Effect.catchAll((error) => Effect.fail(new SvelteKit.Redirect({ location: '/', error }))),
	toLoad({ span: { name: '/result-2024' } })
);
