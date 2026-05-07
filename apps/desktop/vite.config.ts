import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    server: {
        port: 13210,
        strictPort: true
    },
    plugins: [
        tailwindcss(),
        sveltekit(),
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/lib/paraglide'
        })
    ],
    resolve: {
        alias: {
            '@pdfjs/pdf.mjs': path.resolve(
                __dirname,
                '../../packages/foliate-js/vendor/pdfjs/pdf.mjs'
            )
        }
    }
});
