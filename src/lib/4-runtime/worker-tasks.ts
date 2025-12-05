import { Worker } from '@effect/platform';
import { BrowserWorker } from '@effect/platform-browser';
import { Effect, Layer } from 'effect';
import { DataImage, DataYear } from '../1-shared/values';
import {
	TaskGenerateSvg,
	TaskProcessCollectionAnki,
	TaskRenderPng
} from '../1-shared/worker-tasks';
import URL_WORKER from '../3-worker/worker?worker&url';

// #:

export class WorkerTasks extends Effect.Service<WorkerTasks>()('WorkerTasks', {
	scoped: Effect.gen(function* () {
		const pool = yield* Worker.makePoolSerialized({ size: 1 });

		// ##:

		const processCollectionAnki = (payload: { file: File; dataYear: DataYear }) =>
			pool.executeEffect(new TaskProcessCollectionAnki(payload));

		const generateSvg = (payload: { dataYear: DataYear; dataImage: DataImage }) =>
			pool.executeEffect(new TaskGenerateSvg(payload));

		const renderPng = (payload: { dataImage: DataImage; svg: string }) =>
			pool.executeEffect(new TaskRenderPng(payload));

		// ##:

		return {
			generateSvg,
			renderPng,
			processCollectionAnki
		};
	}),
	dependencies: [BrowserWorker.layer(() => new globalThis.Worker(URL_WORKER, { type: 'module' }))]
}) {}

// #:

export const layerEmpty = Layer.succeed(WorkerTasks, {
	_tag: 'WorkerTasks',
	generateSvg: () => Effect.dieMessage('Not implemented'),
	renderPng: () => Effect.dieMessage('Not implemented'),
	processCollectionAnki: () => Effect.dieMessage('Not implemented')
});
