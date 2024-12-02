import { Effect, pipe } from 'effect';
import satori, { type SatoriOptions } from 'satori';
import type { DataImage } from './values';

// #:

export class GeneratorImage extends Effect.Service<GeneratorImage>()('GeneratorImage', {
	effect: Effect.gen(function* () {
		// Load fonts
		const fontInter = yield* pipe(
			Effect.promise(() => fetch(URL_FONT_INTER)),
			Effect.andThen((response) => response.arrayBuffer())
		);

		// Creating this object here should improve performance
		// REFS: https://github.com/vercel/satori/issues/590
		const optionsSatori: SatoriOptions = {
			width: 1080,
			height: 1920,
			fonts: [
				{
					name: 'Inter',
					data: fontInter,
					weight: 400,
					style: 'normal'
				}
			]
		};

		// ##: generateSvg

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

		// ##:

		return {
			generateSvg
		};
	})
}) {}

// #:

export const URL_FONT_INTER =
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
