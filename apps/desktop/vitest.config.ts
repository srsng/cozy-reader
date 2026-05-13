import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.{test,spec}.{ts,js}']
    },
    resolve: {
        alias: {
            $lib: new URL('./src/lib', import.meta.url).pathname
        }
    }
});
