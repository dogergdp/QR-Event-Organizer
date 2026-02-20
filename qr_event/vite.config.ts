import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const isPlaceholder = (value?: string) =>
        !!value && (value.includes('<') || value.includes('>'));

    const hmrHost = !isPlaceholder(env.VITE_HMR_HOST) ? env.VITE_HMR_HOST : undefined;
    const devServerUrl = !isPlaceholder(env.VITE_DEV_SERVER_URL) ? env.VITE_DEV_SERVER_URL : undefined;
    const isTunnel = Boolean(hmrHost || devServerUrl);

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        server: {
            host: isTunnel ? true : '127.0.0.1',
            origin: devServerUrl || 'http://127.0.0.1:5173',
            cors: {
                origin: ['http://127.0.0.1:8000', 'http://localhost:8000'],
            },
            hmr: hmrHost
                ? {
                      host: hmrHost,
                      protocol: 'wss',
                  }
                : {
                      host: '127.0.0.1',
                      protocol: 'ws',
                  },
        },
        esbuild: {
            jsx: 'automatic',
        },
    };
});
