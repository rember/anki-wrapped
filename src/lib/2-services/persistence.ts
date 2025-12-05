import { KeyValueStore } from '@effect/platform';
import { BrowserKeyValueStore } from '@effect/platform-browser';
import { Effect, Layer, Option, Schema } from 'effect';
import { DataImage, DataImageFromBase64, type DataYear } from '../1-shared/values';

// #:

const makeKey = ({ dataYear }: { dataYear: DataYear }) => `ankiwrapped-result-${dataYear.name}`;

// #:

export class Persistence extends Effect.Service<Persistence>()('Persistence', {
	effect: Effect.gen(function* () {
		const store = yield* KeyValueStore.KeyValueStore;

		// ##: setDataImage

		const setDataImage = ({ dataYear, dataImage }: { dataYear: DataYear; dataImage: DataImage }) =>
			Effect.gen(function* () {
				const key = makeKey({ dataYear });
				const valueEnc = yield* Schema.encode(DataImageFromBase64)(dataImage);
				yield* store.set(key, valueEnc);
			});

		// ##: getDataImage

		const getDataImage = ({ dataYear }: { dataYear: DataYear }) =>
			Effect.gen(function* () {
				const key = makeKey({ dataYear });
				const optionValueEnc = yield* store.get(key);
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
	getDataImage: () => Effect.dieMessage('Not implemented')
});
