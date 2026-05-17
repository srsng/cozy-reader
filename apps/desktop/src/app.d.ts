// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
type SettingsTab = 'base' | 'theme' | 'reader';
type BgSettingsTab = 'golbal' | 'overlay' | 'custom';

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        interface PageState {
            routeHistoryId?: number;
            tab?: SettingsTab | BgSettingsTab;
            paths?: string[];
        }
        // interface Platform {}
    }
}

export {};
