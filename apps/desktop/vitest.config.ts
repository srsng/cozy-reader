import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        environment: 'node',
        include: ['src/**/*.{test,spec}.{ts,js}']
    },
    ssr: {
        resolve: {
            conditions: ['svelte', 'module', 'node']
        }
    },
    resolve: {
        alias: {
            $lib: new URL('./src/lib', import.meta.url).pathname
        }
    }
});
