import { browser } from '$app/environment';
import { KeyValueStore } from '@effect/platform';
import { BrowserKeyValueStore } from '@effect/platform-browser';
import { Effect, Option, Schema } from 'effect';
import { DataImage, DataImageFromBase64 } from './values';

// ##:

export class Storage extends Effect.Service<Storage>()('Storage', {
	effect: Effect.gen(function* () {
		// ##: Return empty service in SSR

		if (!browser) {
			return {
				createDataImage: () => Effect.dieMessage('Not supported in SSR'),
				getDataImage: Effect.dieMessage('Not supported in SSR')
			};
		}

		// ##:

		const store = yield* KeyValueStore.KeyValueStore;

		// ##: createDataImage

		const createDataImage = ({ dataImage }: { dataImage: DataImage }) =>
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
			createDataImage,
			getDataImage
		};
	}),
	dependencies: [browser ? BrowserKeyValueStore.layerLocalStorage : KeyValueStore.layerMemory]
}) {}

// ##:

const KEY = 'ankiwrapped-result-2024';
