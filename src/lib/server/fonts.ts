import { Effect, pipe } from 'effect';

// #:

export const URL_FONT_INTER =
	'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';

// #:

export class Fonts extends Effect.Service<Fonts>()('Fonts', {
	effect: Effect.gen(function* () {
		const fontInter = yield* pipe(
			Effect.promise(() => fetch(URL_FONT_INTER)),
			Effect.andThen((response) => response.arrayBuffer())
		);

		return {
			fontInter
		};
	})
}) {}
