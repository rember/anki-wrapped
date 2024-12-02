import type { ManagedRuntime } from 'effect';
import { getContext, setContext } from 'svelte';
import type * as Image from './image';

// #: Types

export type Services = Image.Image;

// #: Context

const KEY = 'anki-wrapper-services';

export const hasCtxRuntime = () =>
	getContext<ManagedRuntime.ManagedRuntime<Services, never>>(KEY) != undefined;

export const getCtxRuntime = () => getContext<ManagedRuntime.ManagedRuntime<Services, never>>(KEY);

export const setCtxRuntime = (ctx: ManagedRuntime.ManagedRuntime<Services, never>) =>
	setContext(KEY, ctx);
