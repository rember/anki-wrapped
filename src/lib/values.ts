import { Schema } from 'effect';

// #: Constants
// 01 Dec 2023, 1am CEST
export const TS_START = 1701388800000;

// 01 Dec 2024, 1am CEST
export const TS_END = 1733011200000;

// #: DataImage

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

// #: DataImageFromBase64

export const DataImageFromBase64 = Schema.compose(
	Schema.StringFromBase64,
	Schema.parseJson(DataImage)
);

// #: Email

export const Email = Schema.Trim.pipe(
	Schema.pattern(/^[^@]+@[^.@]+(?:\.[^.@]+)+$/),
	Schema.brand('Email')
).annotations({ identifier: 'Email', message: () => 'Invalid email.' });

export type Email = Schema.Schema.Type<typeof Email>;

// #: TaskWorkerGenerateSvg

export class TaskWorkerGenerateSvg extends Schema.TaggedRequest<TaskWorkerGenerateSvg>()(
	'TaskWorkerGenerateSvg',
	{
		failure: Schema.Never,
		success: Schema.Struct({ svg: Schema.String }),
		payload: {
			dataImage: DataImage
		}
	}
) {}

// #: TaskWorkerRenderPng

export class TaskWorkerRenderPng extends Schema.TaggedRequest<TaskWorkerRenderPng>()(
	'TaskWorkerRenderPng',
	{
		failure: Schema.Never,
		success: Schema.Struct({ bytesPng: Schema.Uint8Array }),
		payload: {
			dataImage: DataImage,
			svg: Schema.String
		}
	}
) {}

// #: TaskWorkerProcessCollectionAnki

export class TaskWorkerProcessCollectionAnki extends Schema.TaggedRequest<TaskWorkerProcessCollectionAnki>()(
	'TaskWorkerProcessCollectionAnki',
	{
		failure: Schema.Struct({ message: Schema.String }),
		success: Schema.Struct({ dataImage: DataImage }),
		payload: {
			file: Schema.instanceOf(File)
		}
	}
) {}
