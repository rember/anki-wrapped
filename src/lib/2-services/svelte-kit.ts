import type * as Kit from '@sveltejs/kit';
import { Context } from 'effect';

// #:

export class LoadEvent extends Context.Tag('SvelteKit/LoadEvent')<LoadEvent, Kit.LoadEvent>() {}
