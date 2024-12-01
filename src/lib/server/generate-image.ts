import { Resvg } from '@resvg/resvg-js';
import { Effect } from 'effect';
import satori, { type SatoriOptions } from 'satori';
import type { DataImage } from '../shared/values';
import * as Fonts from './fonts';

// #:

export class GeneratorImage extends Effect.Service<GeneratorImage>()('GeneratorImage', {
	effect: Effect.gen(function* () {
		const fonts = yield* Fonts.Fonts;

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
				const renderer = new Resvg(args.svg, { background: 'white' });
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
