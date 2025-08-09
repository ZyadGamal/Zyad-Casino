import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/scss/main.scss',
                'resources/js/main.js',
                'resources/js/admin.js'
            ],
            refresh: true,
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    let extType = assetInfo.name.split('.').at(1);
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = 'images';
                    }
                    return `assets/compiled/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/compiled/js/[name]-[hash].js',
                entryFileNames: 'assets/compiled/js/[name]-[hash].js',
            },
        },
    },
});