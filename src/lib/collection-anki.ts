import { browser } from '$app/environment';
import { Array, Data, Effect, Option, pipe, Record, Schema, String } from 'effect';
import * as fzstd from 'fzstd';
import { DataImage, TS_END, TS_START } from './values';

// #:

export class CollectionAnki extends Effect.Service<CollectionAnki>()('CollectionAnki', {
	effect: Effect.gen(function* () {
		// ##: Return empty service in SSR

		if (!browser) {
			return {
				processFile: () => Effect.dieMessage('Not supported in SSR')
			};
		}

		// ##: Import large libs dynamically to improve code splitting

		const { JSZip, SqliteClient } = yield* Effect.all(
			{
				JSZip: pipe(
					Effect.promise(() => import('jszip')),
					Effect.map((_) => _.default)
				),
				SqliteClient: pipe(
					Effect.promise(() => import('@effect/sql-sqlite-wasm')),
					Effect.map((_) => _.SqliteClient)
				)
			},
			{ concurrency: 'unbounded' }
		);

		// ##: processFile

		const processFile = ({ file }: { file: File }) =>
			Effect.gen(function* () {
				const sql = yield* SqliteClient.SqliteClient;

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

				// Query: countCardsCreated
				const countCardsCreated = yield* pipe(
					sql`
						SELECT
							COUNT(*) AS cards_created
						FROM
							cards
						WHERE
							id BETWEEN ${TS_START} AND ${TS_END}
					`,
					Effect.flatMap(
						Schema.decodeUnknown(Schema.Tuple(Schema.Struct({ cards_created: Schema.Number })))
					),
					Effect.map((rows) => rows[0].cards_created)
				);

				// Query: countReviews
				// NOTE: We filter out reviews with `revlog.type = 4`, ie. "manual".
				// The entries are created when rescheduling cards (for example when
				// switching to FSRS).
				// REFS: https://forums.ankiweb.net/t/edit-card-history-in-db-editor/38155
				const countReviews = yield* pipe(
					sql`
						SELECT
							COUNT(*) AS count_reviews
						FROM
							revlog
						WHERE
							id BETWEEN ${TS_START} AND ${TS_END}
							AND type != 4
					`,
					Effect.flatMap(
						Schema.decodeUnknown(Schema.Tuple(Schema.Struct({ count_reviews: Schema.Number })))
					),
					Effect.map((rows) => rows[0].count_reviews)
				);

				// Query: minutesSpentReviewing
				const minutesSpentReviewing = yield* pipe(
					sql`
						SELECT
							COALESCE(SUM(COALESCE(time, 0)), 0) / 60000.0 AS minutes_spent_reviewing
						FROM
							revlog
						WHERE
							revlog.id BETWEEN ${TS_START} AND ${TS_END}
							AND revlog.type != 4
					`,
					Effect.flatMap(
						Schema.decodeUnknown(
							Schema.Tuple(Schema.Struct({ minutes_spent_reviewing: Schema.Number }))
						)
					),
					Effect.map((rows) => Math.round(rows[0].minutes_spent_reviewing))
				);

				// Query: top5DecksByCountReviews
				const top5DecksByCountReviews = yield* pipe(
					sql`
						SELECT
							d.name AS name,
							COUNT(r.id) AS count_reviews
						FROM
							revlog r
							JOIN cards c ON r.cid = c.id
							JOIN decks d ON c.did = d.id
						WHERE
							r.id BETWEEN ${TS_START} AND ${TS_END}
							AND r.type != 4
						GROUP BY
							d.id
						ORDER BY
							count_reviews DESC
						LIMIT
							5
					`,
					Effect.flatMap(
						Schema.decodeUnknown(Schema.Array(Schema.Struct({ name: Schema.String })))
					),
					Effect.map(
						Array.map(({ name }) => ({
							name: pipe(name, String.split('\x1F'), Array.lastNonEmpty)
						}))
					)
				);

				// Query: heatmapReviews
				const heatmapReviews = yield* pipe(
					sql`
						SELECT
							strftime ('%Y-%m-%d', datetime (id / 1000, 'unixepoch')) AS date_iso,
							COUNT(*) AS count_reviews
						FROM
							revlog r
						WHERE
							r.id BETWEEN ${TS_START} AND ${TS_END}
							AND r.type != 4
						GROUP BY
							date_iso
						ORDER BY
							date_iso;
					`,
					Effect.flatMap(
						Schema.decodeUnknown(
							Schema.Array(Schema.Struct({ date_iso: Schema.String, count_reviews: Schema.Number }))
						)
					),
					Effect.map(
						Array.map(({ date_iso, count_reviews }) => ({
							dateIso: date_iso,
							countReviews: count_reviews
						}))
					)
				);

				// Decode as DataImage
				const dataImage = yield* Schema.decode(DataImage)({
					countCardsCreated,
					countReviews,
					minutesSpentReviewing,
					top5DecksByCountReviews,
					heatmapReviews
				});

				return dataImage;
			}).pipe(Effect.provide(SqliteClient.layerMemory({})));

		// ##:

		return {
			processFile
		};
	})
}) {}

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
