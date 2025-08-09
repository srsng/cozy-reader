import { goto } from '$app/navigation';

export type Pages = 'home' | 'settings';

export const RouteMap: Record<Pages, string> = {
	home: '/',
	settings: '/settings/'
};

export function goHome() {
	goto(RouteMap.home);
}

export function goSettings() {
	goto(RouteMap.settings);
}
