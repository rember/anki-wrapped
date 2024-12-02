import { DataImage } from '$lib/shared/values';
import { Headers, HttpRouter, HttpServerResponse } from '@effect/platform';
import { Effect, pipe } from 'effect';
import * as GeneratorImage from './generate-image';

// #:

export class Router extends Effect.Service<Router>()('Router', {
	effect: Effect.gen(function* () {
		const generatorImage = yield* GeneratorImage.GeneratorImage;

		return HttpRouter.empty.pipe(
			HttpRouter.get(
				'/image-result-2024/:count',
				Effect.gen(function* () {
					const dataImage = yield* HttpRouter.schemaPathParams(DataImage);

					const svg = yield* generatorImage.generateSvg({ dataImage });
					const bufferPng = yield* generatorImage.renderPng({ dataImage, svg });

					return HttpServerResponse.raw(bufferPng, {
						contentType: 'image/png',
						headers: pipe(
							Headers.empty,
							Headers.set('Cache-Control', 'public, immutable, no-transform, max-age=31536000')
						)
					});
				})
			),
			HttpRouter.prefixAll('/api'),
			Effect.catchTags({
				RouteNotFound: () => HttpServerResponse.text('API route not found', { status: 404 })
			})
		);
	}),
	dependencies: [GeneratorImage.GeneratorImage.Default]
}) {}
