// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)

// import { getResources, initDatabase } from "$lib/database/database.js";
// import { AppManager } from "$lib/stores/AppManager";
import { Tauri } from '$lib/backend/tauri.js';
import { initializeDatabases } from '@cozy-reader/database';

import type { UserSettings } from '$lib/settings/index';
import { loadUserSettings } from '$lib/stores/userSettings';

import type { Writable } from 'svelte/store';
// import { loadFastLinks } from "$lib/stores/Links.js";
// import { Tauri } from "$lib/backend/tauri.js";

// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = false;
export const ssr = false;
export const csr = true;

export type pageMetaData = {
    title?: string;
    description?: string;
};

// export type RootData = {
// 	userSettings: Writable<UserSettings>;
// 	tauri: Tauri;
// 	metaData: pageMetaData;
// };

// eslint-disable-next-line
export async function load({ params }) {
    try {
        // 初始化数据库（包含一致性检查）
        await initializeDatabases();
        console.log('App initialized in +layout.ts');
    } catch (error) {
        console.error('Failed to init App:', error);
        throw error;
    }

    const tauri = new Tauri();
    const userSettings = await loadUserSettings();
    // const appData = {
    // 	resources: await getResources(),
    // 	 fastLinks: await loadFastLinks()
    // };

    // // Awaited and will block initial render, but it is necessary in order to respect the user
    // // settings on telemetry.
    // const posthog = new PostHogWrapper();
    // const appSettings = await loadAppSettings();
    // initAnalyticsIfEnabled(appSettings, posthog);

    // const commandService = new CommandService();

    // const tokenMemoryService = new TokenMemoryService();
    // const httpClient = new HttpClient(window.fetch, PUBLIC_API_BASE_URL, tokenMemoryService.token);
    // const updaterService = new UpdaterService(tauri, posthog);
    // const promptService = new PromptService();

    // const userService = new UserService(httpClient, tokenMemoryService, posthog);

    // const projectsService = new ProjectsService(defaultPath, httpClient);

    // const gitConfig = new GitConfigService(tauri);
    // const secretsService = new RustSecretService(gitConfig);
    // const aiService = new AIService(gitConfig, secretsService, httpClient, tokenMemoryService);
    // const remotesService = new RemotesService();
    // const aiPromptService = new AIPromptService();
    // const lineManagerFactory = new LineManagerFactory();
    // const stackingLineManagerFactory = new StackingLineManagerFactory();
    // const fileService = new FileService(tauri);
    // const hooksService = new HooksService(tauri);
    // const settingsService = new SettingsService(tauri);
    // const githubAuthenticationService = new GitHubAuthenticationService(tauri);
    const metaData: pageMetaData = {
        title: 'Cozy Reader',
        description: 'Cozy Reader is a reader that reads books in a cozy environment.'
    };
    return {
        tauri,
        // appData,
        userSettings,
        metaData
        // 	commandService,
        // 	tokenMemoryService,
        // 	appSettings,
        // 	cloud: httpClient,
        // 	projectsService,
        // 	updaterService,
        // 	promptService,
        // 	userService,
        // 	gitConfig,
        // 	aiService,
        // 	remotesService,
        // 	aiPromptService,
        // 	lineManagerFactory,
        // 	stackingLineManagerFactory,
        // 	secretsService,
        // 	posthog,
        // 	tauri,
        // 	fileService,
        // 	hooksService,
        // 	settingsService,
        // 	githubAuthenticationService
    };
}
