import {
	TaskWorkerGenerateSvg,
	TaskWorkerProcessCollectionAnki,
	TaskWorkerRenderPng
} from '$lib/values';
import { WorkerRunner } from '@effect/platform';
import { BrowserWorkerRunner } from '@effect/platform-browser';
import { Effect, Layer, Logger, Schema } from 'effect';
import * as CollectionAnki from '../collection-anki';
import * as Image from '../image';

// #:

const layerWorker = WorkerRunner.layerSerialized(
	Schema.Union(TaskWorkerGenerateSvg, TaskWorkerRenderPng, TaskWorkerProcessCollectionAnki),
	{
		TaskWorkerGenerateSvg: (req) =>
			Effect.gen(function* () {
				const image = yield* Image.Image;
				const svg = yield* image.generateSvg({ dataImage: req.dataImage });
				return { svg };
			}).pipe(Effect.tapErrorCause(Effect.logError)),
		TaskWorkerRenderPng: (req) =>
			Effect.gen(function* () {
				const image = yield* Image.Image;
				const bytesPng = yield* image.renderPng({ dataImage: req.dataImage, svg: req.svg });
				return { bytesPng };
			}).pipe(Effect.tapErrorCause(Effect.logError)),
		TaskWorkerProcessCollectionAnki: (req) =>
			Effect.gen(function* () {
				const collectionAnki = yield* CollectionAnki.CollectionAnki;
				const dataImage = yield* collectionAnki.processFile({ file: req.file });
				return { dataImage };
			}).pipe(
				Effect.tapErrorCause(Effect.logError),
				Effect.catchAll((_) => Effect.fail({ message: 'Error exporting files' }))
			)
	}
).pipe(
	Layer.provide(Image.Image.Default),
	Layer.provide(CollectionAnki.CollectionAnki.Default),
	Layer.provide(Logger.pretty),
	Layer.provide(BrowserWorkerRunner.layer)
);

// #: Run

Effect.runFork(Layer.launch(layerWorker));
