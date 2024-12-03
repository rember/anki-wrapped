import type * as Kit from '@sveltejs/kit';
import { Context, Data } from 'effect';

// #:

export class Redirect extends Data.TaggedError('SvelteKit/Redirect')<{
	readonly location: string | URL;
	readonly error?: { _tag: string; message: string };
}> {
	get message() {
		return `Redirect location=${this.location.toString()}`;
	}
}

// #:

export class LoadEvent extends Context.Tag('SvelteKit/LoadEvent')<LoadEvent, Kit.LoadEvent>() {}
