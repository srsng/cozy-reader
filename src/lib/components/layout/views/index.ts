import Error from './error.svelte';
import Info from './info.svelte';
import Loading from './loading.svelte';

export const View = {
	Error,
	Info,
	Loading
};

export type ViewType = keyof typeof View;
