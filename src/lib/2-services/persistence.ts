import { KeyValueStore } from '@effect/platform';
import { BrowserKeyValueStore } from '@effect/platform-browser';
import { Effect, Layer, Option, Schema } from 'effect';
import { DataImage, DataImageFromBase64 } from '../1-shared/values';

// #:

const KEY = 'ankiwrapped-result-2025';

// #:

export class Persistence extends Effect.Service<Persistence>()('Persistence', {
	effect: Effect.gen(function* () {
		const store = yield* KeyValueStore.KeyValueStore;

		// ##: setDataImage

		const setDataImage = ({ dataImage }: { dataImage: DataImage }) =>
			Effect.gen(function* () {
				const valueEnc = yield* Schema.encode(DataImageFromBase64)(dataImage);
				yield* store.set(KEY, valueEnc);
			});

		// ##: getDataImage

		const getDataImage = Effect.gen(function* () {
			const optionValueEnc = yield* store.get(KEY);
			if (Option.isNone(optionValueEnc)) {
				return Option.none<DataImage>();
			}
			const valueEnc = optionValueEnc.value;
			const dataImage = yield* Schema.decode(DataImageFromBase64)(valueEnc);
			return Option.some(dataImage);
		});

		// ##:

		return {
			setDataImage,
			getDataImage
		};
	}),
	dependencies: [BrowserKeyValueStore.layerLocalStorage]
}) {}

// #:

export const layerEmpty = Layer.succeed(Persistence, {
	_tag: 'Persistence',
	setDataImage: () => Effect.dieMessage('Not implemented'),
	getDataImage: Effect.dieMessage('Not implemented')
});
