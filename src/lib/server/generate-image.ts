// REFS:
// - (Convert SVG into PNG in Cloudflare worker) https://hrishikeshpathak.com/tips/convert-svg-to-png-cloudflare-worker/
// - (vite-plugin-wasm-module-workers) https://www.npmjs.com/package/vite-plugin-wasm-module-workers

import { initWasm as initWasmResvg, Resvg } from '@resvg/resvg-wasm';
import URL_WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm?url';
import { Effect } from 'effect';
import satori, { type SatoriOptions } from 'satori';
import type { DataImage } from '../shared/values';
import * as Fonts from './fonts';

// #:

const { default: resvgwasm } = await import(/* @vite-ignore */ `${URL_WASM_RESVG}?module`);

// #:

export class GeneratorImage extends Effect.Service<GeneratorImage>()('GeneratorImage', {
	effect: Effect.gen(function* () {
		const fonts = yield* Fonts.Fonts;

		yield* Effect.promise(() => initWasmResvg(resvgwasm));

		// ##: generateSvg

		// Creating this object here should improve performance
		// REFS: https://github.com/vercel/satori/issues/590
		const optionsSatori: SatoriOptions = {
			width: 600,
			height: 400,
			fonts: [
				{
					name: 'Inter',
					data: fonts.fontInter,
					weight: 400,
					style: 'normal'
				}
			]
		};

		const generateSvg = (args: { dataImage: DataImage }) =>
			Effect.gen(function* () {
				const svg = yield* Effect.promise(() =>
					satori(
						{
							type: 'div',
							props: {
								children: `hello, world ${args.dataImage.count}`,
								style: { color: 'blue' }
							}
						},
						optionsSatori
					)
				);
				return svg;
			});

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
			generateSvg,
			renderPng
		};
	}),
	dependencies: [Fonts.Fonts.Default]
}) {}
