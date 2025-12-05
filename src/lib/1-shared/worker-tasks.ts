import { Schema } from 'effect';
import { DataImage, DataYear } from './values';

// #:

export class TaskProcessCollectionAnki extends Schema.TaggedRequest<TaskProcessCollectionAnki>()(
	'TaskProcessCollectionAnki',
	{
		failure: Schema.Struct({ message: Schema.String }),
		success: Schema.Struct({ dataImage: DataImage }),
		payload: {
			file: Schema.instanceOf(File),
			dataYear: DataYear
		}
	}
) {}

// #:

export class TaskGenerateSvg extends Schema.TaggedRequest<TaskGenerateSvg>()('TaskGenerateSvg', {
	failure: Schema.Never,
	success: Schema.Struct({ svg: Schema.String }),
	payload: {
		dataYear: DataYear,
		dataImage: DataImage
	}
}) {}

// #:

export class TaskRenderPng extends Schema.TaggedRequest<TaskRenderPng>()('TaskRenderPng', {
	failure: Schema.Never,
	success: Schema.Struct({ bytesPng: Schema.Uint8Array }),
	payload: {
		dataImage: DataImage,
		svg: Schema.String
	}
}) {}
