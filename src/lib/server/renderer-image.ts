import { Resvg, initWasm as initWasmResvg } from '@resvg/resvg-wasm';
import * as SvelteKit from './svelte-kit';

import { Effect } from 'effect';

// import URL_WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm?url';
import URL_WASM_RESVG from '../../../static/resvg.wasm?url';

import type { DataImage } from '../shared/values';
import { FetchHttpClient, HttpClient } from '@effect/platform';

// #:

export class RendererImage extends Effect.Service<RendererImage>()('RendererImage', {
	effect: Effect.gen(function* () {
		// ##: Init Resvg WASM

		// const URL_WASM_RESVG = yield* Effect.promise(() => import('@resvg/resvg-wasm/index_bg.wasm'));
		// yield* Effect.promise(() => initWasmResvg(URL_WASM_RESVG));
		// prettier-ignore
		// yield* Effect.promise(async () => {
		// 	// const { default: wasmResvg } = await import(
		//   //   /* @vite-ignore */ `${URL_WASM_RESVG}?module`
		//   // );
		// 	// await initWasmResvg(wasmResvg);
		//   // await initWasmResvg(`${assets}/resvg.wasm`)
		//   if (!import.meta.env.SSR) {
		//     await initWasmResvg(URL_WASM_RESVG)
		//   }

		// });

		// ##: renderPng

		const renderPng = (args: { dataImage: DataImage; svg: string }) =>
			Effect.gen(function* () {
        const fetch = yield* FetchHttpClient.Fetch;
				yield* Effect.promise(async () => {
					await initWasmResvg(fetch(URL_WASM_RESVG));
				});

				const renderer = new Resvg(args.svg, {
					background: 'white',
					font: { loadSystemFonts: false }
				});
				const bufferPng = renderer.render().asPng();
				return bufferPng;
			});

		// ##:

		return {
			renderPng
		};
	})
}) {}
