import { WorkerRunner } from '@effect/platform';
import { BrowserWorkerRunner } from '@effect/platform-browser';
import { Effect, Layer, Logger, Schema } from 'effect';
import {
	TaskGenerateSvg,
	TaskProcessCollectionAnki,
	TaskRenderPng
} from '../1-shared/worker-tasks';
import * as CollectionAnki from '../2-services/collection-anki';
import * as Image from '../2-services/image';

// #:

const layerWorkerRunner = WorkerRunner.layerSerialized(
	Schema.Union(TaskGenerateSvg, TaskRenderPng, TaskProcessCollectionAnki),
	{
		TaskGenerateSvg: (req) =>
			Effect.gen(function* () {
				const image = yield* Image.Image;
				const svg = yield* image.generateSvg({ dataYear: req.dataYear, dataImage: req.dataImage });
				return { svg };
			}).pipe(Effect.tapErrorCause(Effect.logError)),
		TaskRenderPng: (req) =>
			Effect.gen(function* () {
				const image = yield* Image.Image;
				const bytesPng = yield* image.renderPng({ dataImage: req.dataImage, svg: req.svg });
				return { bytesPng };
			}).pipe(Effect.tapErrorCause(Effect.logError)),
		TaskProcessCollectionAnki: (req) =>
			Effect.gen(function* () {
				const collectionAnki = yield* CollectionAnki.CollectionAnki;
				const dataImage = yield* collectionAnki.processFile({
					file: req.file,
					dataYear: req.dataYear
				});
				return { dataImage };
			}).pipe(
				Effect.tapErrorCause(Effect.logError),
				Effect.catchAll((_) => Effect.fail({ message: 'Error processing Anki collection' }))
			)
	}
).pipe(
	Layer.provide(Image.Image.Default),
	Layer.provide(CollectionAnki.CollectionAnki.Default),
	Layer.provide(Logger.pretty),
	Layer.provide(BrowserWorkerRunner.layer)
);

// #: Run

Effect.runFork(Layer.launch(layerWorkerRunner));
