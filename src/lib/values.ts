import { pipe, Schema } from 'effect';
import pako from 'pako';

// #: DataImage

export const DataImage = Schema.Struct({
	countCardsCreated: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	countReviews: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	minutesSpentReviewing: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	top5DecksByCountReviews: Schema.Array(
		Schema.Struct({
			name: Schema.String
		})
	).pipe(Schema.maxLength(5)),
	heatmapReviews: Schema.Array(
		Schema.Struct({
			// String representing a calendar date in the ISO format with day precision,
			// ie. `YYYY-MM-DD`.
			dateIso: Schema.String.pipe(
				Schema.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
			),
			countReviews: Schema.Number.pipe(Schema.nonNegative(), Schema.int())
		})
	)
});
export interface DataImage extends Schema.Schema.Type<typeof DataImage> {}
export interface DataImageJSON extends Schema.Schema.Encoded<typeof DataImage> {}

// #: DataImageFromBase64

export const DataImageFromBase64 = pipe(
	Schema.Uint8ArrayFromBase64,
	Schema.compose(
		Schema.transform(Schema.Uint8ArrayFromSelf, Schema.String, {
			strict: true,
			decode: (bytes) => {
				return pako.inflate(bytes, { to: 'string' });
			},
			encode: (str) => {
				return pako.deflate(str);
			}
		})
	),
	Schema.compose(Schema.parseJson(DataImage))
);
