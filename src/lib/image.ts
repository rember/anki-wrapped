import { browser } from '$app/environment';
import { initWasm as initWasmResvg, Resvg } from '@resvg/resvg-wasm';
import { Effect, pipe } from 'effect';
import satori, { type SatoriOptions } from 'satori';
import type { DataImage } from './values';

// #:

export const URL_FONT_INTER =
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';

// #:

export class Image extends Effect.Service<Image>()('Image', {
	effect: Effect.gen(function* () {
		// ##: Init Resvg WASM
		// TODO: Load Resvg correctly instead of from a CDN.

		if (browser) {
			yield* Effect.promise(() =>
				initWasmResvg('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm')
			);
		}

		// ##: Load fonts

		const fontInter = yield* pipe(
			Effect.promise(() => fetch(URL_FONT_INTER)),
			Effect.andThen((response) => response.arrayBuffer())
		);

		// ##: generateSvg

		// Creating this object here should improve performance
		// REFS: https://github.com/vercel/satori/issues/590
		const optionsSatori: SatoriOptions = {
			width: 360,
			height: 640,
			fonts: [
				{
					name: 'Inter',
					data: fontInter,
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
								style: { display: 'flex' },
								children: [
									{
										type: 'div',
										props: {
											style: { color: 'blue' },
											children: `hello, world ${args.dataImage.countCardsCreated}`
										}
									},
									{
										type: 'div',
										props: {
											style: { width: '200px', height: '200px', backgroundColor: 'red' }
										}
									}
								]
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
					fitTo: {
						mode: 'width',
						value: 1080
					},
					background: 'white',
					font: { loadSystemFonts: false },
					textRendering: 1
				});
				const bufferPng = renderer.render().asPng();
				return bufferPng;
			});

		// ##:

		return {
			generateSvg,
			renderPng
		};
	})
}) {}
