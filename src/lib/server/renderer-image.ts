import { initWasm as initWasmResvg, Resvg } from '@resvg/resvg-wasm';
import { Effect } from 'effect';
import type { DataImage } from '../shared/values';

// #:

export class RendererImage extends Effect.Service<RendererImage>()('RendererImage', {
	effect: Effect.gen(function* () {
		// ##: Init Resvg WASM
		// TODO: Load Resvg correctly instead of from a CDN.

		yield* Effect.promise(() => initWasmResvg('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));

		// ##: renderPng

		const renderPng = (args: { dataImage: DataImage; svg: string }) =>
			Effect.sync(() => {
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
