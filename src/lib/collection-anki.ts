import { browser } from '$app/environment';
import { SqliteClient } from '@effect/sql-sqlite-wasm';
import { Data, Effect, Layer, Option, Record } from 'effect';
import * as fzstd from 'fzstd';
import JSZip from 'jszip';

// #:

export class CollectionAnki extends Effect.Service<CollectionAnki>()('CollectionAnki', {
	effect: Effect.gen(function* () {
		if (!browser) {
			return {
				processFile: () => Effect.dieMessage('Cannot call processFile in SSR')
			};
		}

		const sql = yield* SqliteClient.SqliteClient;

		// ##: processFile

		const processFile = ({ file }: { file: File }) =>
			Effect.gen(function* () {
				// Unzip the .colpkg file
				const filesColpkg = yield* Effect.tryPromise({
					try: () => JSZip.loadAsync(file),
					catch: (error) => new ErrorCannotUnzip({ error })
				});

				// Find the collection.anki2b file
				const fileCollectionAnki21b = Record.get(filesColpkg.files, 'collection.anki21b');
				if (Option.isNone(fileCollectionAnki21b)) {
					return yield* new ErrorNotFoundCollectionApkg21b();
				}
				const bytesCollectionAnki21b = yield* Effect.tryPromise({
					try: () => fileCollectionAnki21b.value.async('uint8array'),
					catch: (error) => new ErrorCannotReadCollectionApkg21b({ error })
				});

				// Decompress the collection.anki2b file
				// TODO: Consider streaming
				const bytesCollectionAnki = yield* Effect.try({
					try: () => fzstd.decompress(bytesCollectionAnki21b),
					catch: (error) => {
						console.log('error', error);
						new ErrorCannotDecompressCollectionApkg21b({ error });
					}
				});

				// REFS: https://sqlite.org/forum/forumpost/a7e272cee9ac469f
				bytesCollectionAnki[18] = 1;
				bytesCollectionAnki[19] = 1;

				// Load SQLite database in memory
				yield* sql.import(bytesCollectionAnki);

				const cntCardsCreated = yield* sql`SELECT COUNT(*) AS cards_created
          FROM cards
          WHERE id BETWEEN ${TS_START} AND ${TS_END}`;
				console.log('cntCardsCreated', cntCardsCreated);
			});

		// ##:

		return {
			processFile
		};
	}),
	dependencies: [
		browser ? SqliteClient.layerMemory({}) : Layer.succeed(SqliteClient.SqliteClient, {} as any)
	]
}) {}

// #: Constants

// 01 Dec 2023
const TS_START = 1701388800000;

// 01 Dec 2024
const TS_END = 1733011200000;

// #: Errors

export class ErrorCannotUnzip extends Data.TaggedError('CollectionAnki/CannotUnzip')<{
	readonly error: unknown;
}> {
	override get message() {
		return 'Failed to unzip file';
	}
}

export class ErrorNotFoundCollectionApkg21b extends Data.TaggedError(
	'CollectionAnki/NotFoundCollectionApkg21b'
) {
	override get message() {
		return 'The file collection.anki21b is missing';
	}
}

export class ErrorCannotReadCollectionApkg21b extends Data.TaggedError(
	'CollectionAnki/CannotReadCollectionApkg21b'
)<{
	readonly error: unknown;
}> {
	override get message() {
		return 'Cannot read collection.anki21b as UInt8Array';
	}
}

export class ErrorCannotDecompressCollectionApkg21b extends Data.TaggedError(
	'CollectionAnki/CannotDecompressCollectionApkg21b'
)<{
	readonly error: unknown;
}> {
	override get message() {
		return 'Cannot decompress collection.anki21b';
	}
}
