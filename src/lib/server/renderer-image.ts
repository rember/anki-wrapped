import { Resvg, initWasm as initWasmResvg } from '@resvg/resvg-wasm';

import { Effect } from 'effect';

// @ts-expect-error
import URL_WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm?module';

import type { DataImage } from '../shared/values';

// #:

export class RendererImage extends Effect.Service<RendererImage>()('RendererImage', {
	effect: Effect.gen(function* () {
		// ##: Init Resvg WASM

		// const URL_WASM_RESVG = yield* Effect.promise(() => import('@resvg/resvg-wasm/index_bg.wasm'));
		yield* Effect.promise(() => initWasmResvg(URL_WASM_RESVG));

		// ##: renderPng

		const renderPng = (args: { dataImage: DataImage; svg: string }) =>
			Effect.gen(function* () {
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
