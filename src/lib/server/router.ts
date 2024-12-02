import { DataImage } from '$lib/shared/values';
import { Headers, HttpRouter, HttpServerResponse } from '@effect/platform';
import { Effect, pipe } from 'effect';
import * as GeneratorImage from '../shared/generator-image';
import * as RendererImage from './renderer-image';

// #:

export class Router extends Effect.Service<Router>()('Router', {
	effect: Effect.gen(function* () {
		const generatorImage = yield* GeneratorImage.GeneratorImage;
		const rendererImage = yield* RendererImage.RendererImage;

		return HttpRouter.empty.pipe(
			HttpRouter.get(
				'/image-result-2024/:count',
				Effect.gen(function* () {
					const dataImage = yield* HttpRouter.schemaPathParams(DataImage);

					const svg = yield* generatorImage.generateSvg({ dataImage });
					const bufferPng = yield* rendererImage.renderPng({ dataImage, svg });

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
			Effect.tapErrorCause(Effect.logError),
			Effect.catchTags({
				RouteNotFound: () => HttpServerResponse.text('API route not found', { status: 404 })
			})
		);
	}),
	dependencies: [GeneratorImage.GeneratorImage.Default, RendererImage.RendererImage.Default]
}) {}
