import { Schema } from 'effect';
import { DataImage } from './values';

// #:

export class TaskProcessCollectionAnki extends Schema.TaggedRequest<TaskProcessCollectionAnki>()(
	'TaskProcessCollectionAnki',
	{
		failure: Schema.Struct({ message: Schema.String }),
		success: Schema.Struct({ dataImage: DataImage }),
		payload: {
			file: Schema.instanceOf(File)
		}
	}
) {}

// #:

export class TaskGenerateSvg extends Schema.TaggedRequest<TaskGenerateSvg>()('TaskGenerateSvg', {
	failure: Schema.Never,
	success: Schema.Struct({ svg: Schema.String }),
	payload: {
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
