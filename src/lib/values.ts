import { Schema } from 'effect';

// #: DataImage

export const DataImage = Schema.Struct({
	countCardsCreated: Schema.NumberFromString
});
export interface DataImage extends Schema.Schema.Type<typeof DataImage> {}
export interface DataImageJSON extends Schema.Schema.Encoded<typeof DataImage> {}
