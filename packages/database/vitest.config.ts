import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/**',
                'src/**/*.d.ts',
                '**/*.config.ts',
                '**/index.ts',
                'src/core/types/generated/**'
            ]
        }
    }
});

