import type { StdTDName } from '$lib/settings/Theme';

export function updateName(name: StdTDName) {
	document.documentElement.setAttribute('data_theme_std_name', name);
}
