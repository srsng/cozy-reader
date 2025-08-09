// from gitbutler app

import { InjectionToken } from '$lib/utils/context';
import type { Tauri } from '$lib/backend/tauri';
// import { emit, listen as tListen } from '@tauri-apps/api/event';

export const SHORTCUT_SERVICE = new InjectionToken<ShortcutService>('ShortcutService');
export const SHORTCUT_ENENT = '//shortcut//';
/**
 * Service class for listening to shortcut events from the back end.
 */
export class ShortcutService {
	private listeners: [string, CallableFunction][] = [];
	constructor(private tauri: Tauri) {}

	listen() {
		return this.tauri.listen<string>(SHORTCUT_ENENT, (e) => {
			for (const listener of this.listeners) {
				if (listener[0] === e.payload) {
					listener[1]();
				}
			}
		});
	}

	on(shortcut: string, callback: () => void) {
		const value = [shortcut, callback] as [string, CallableFunction];
		this.listeners.push(value);
		return () => {
			this.listeners.splice(
				this.listeners.findIndex((listener) => listener === value),
				1
			);
		};
	}
}
