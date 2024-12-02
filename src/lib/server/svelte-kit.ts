import type * as Kit from '@sveltejs/kit';
import { Context, Data } from 'effect';

// #:

export class Error extends Data.TaggedError('SvelteKit/Error')<{
	readonly status: number;
	readonly message: string;
	readonly error?: { _tag: string; message: string };
}> {
	get messageLog() {
		if (this.error == undefined) {
			return `Error status=${this.status} response message="${this.message}"`;
		}
		return `Error status=${this.status} response message="${this.message}" tag=${this.error._tag} ${this.error.message}`;
	}
}

export class Redirect extends Data.TaggedError('SvelteKit/Redirect')<{
	readonly status: number;
	readonly location: string | URL;
	readonly error?: { _tag: string; message: string };
}> {
	get messageLog() {
		if (this.error == undefined) {
			return `Redirect status=${this.status} location=${this.location.toString()}`;
		}
		return `Redirect status=${this.status} location=${this.location.toString()} tag=${this.error._tag} ${this.error.message}`;
	}
}

// #:

export class ServerLoadEvent extends Context.Tag('SvelteKit/ServerLoadEvent')<
	ServerLoadEvent,
	Kit.ServerLoadEvent
>() {}
