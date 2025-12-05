import { DateTime, Schema } from 'effect';

// #:

export const DataYear = Schema.Struct({
	name: Schema.String,
	tsStart: Schema.DateTimeUtc,
	tsEnd: Schema.DateTimeUtc
});

export interface DataYear extends Schema.Schema.Type<typeof DataYear> {}
export interface DataYearJSON extends Schema.Schema.Encoded<typeof DataYear> {}

export const dataYear2024 = DataYear.make({
	name: '2024',
	tsStart: DateTime.unsafeMake(1701388800000), // 01 Dec 2023, 1am CET
	tsEnd: DateTime.unsafeMake(1733011200000) // 01 Dec 2024, 1am CEST
});

export const dataYear2025 = DataYear.make({
	name: '2025',
	tsStart: DateTime.unsafeMake(1733011200000), // 01 Dec 2024, 1am CEST
	tsEnd: DateTime.unsafeMake(1764547200000) // 01 Dec 2025, 1am CEST
});

// #:

export const DataImage = Schema.Struct({
	countCardsCreated: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	countReviews: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	minutesSpentReviewing: Schema.Number.pipe(Schema.nonNegative(), Schema.int()),
	top5DecksByCountReviews: Schema.Array(
		Schema.Struct({
			name: Schema.String
		})
	),
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

// #:

export const DataImageFromBase64 = Schema.compose(
	Schema.StringFromBase64,
	Schema.parseJson(DataImage)
);

// #:

export const Email = Schema.Trim.pipe(
	Schema.pattern(/^[^@]+@[^.@]+(?:\.[^.@]+)+$/),
	Schema.brand('Email')
).annotations({ identifier: 'Email', message: () => 'Invalid email.' });

export type Email = Schema.Schema.Type<typeof Email>;
