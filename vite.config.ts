import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production'

    return {
        plugins: [
            react(),
            // Gzip 压缩
            viteCompression({
                verbose: true,
                disable: false,
                threshold: 10240,
                algorithm: 'gzip',
                ext: '.gz',
            }),
            // Brotli 压缩
            viteCompression({
                verbose: true,
                disable: false,
                threshold: 10240,
                algorithm: 'brotliCompress',
                ext: '.br',
            }),
            // 打包分析
            isProduction &&
                visualizer({
                    filename: 'dist/stats.html',
                    open: true,
                    gzipSize: true,
                    brotliSize: true,
                }),
        ].filter(Boolean),
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@/components': resolve(__dirname, 'src/components'),
                '@/pages': resolve(__dirname, 'src/pages'),
                '@/hooks': resolve(__dirname, 'src/hooks'),
                '@/utils': resolve(__dirname, 'src/utils'),
                '@/types': resolve(__dirname, 'src/types'),
                '@/assets': resolve(__dirname, 'src/assets'),
                '@/styles': resolve(__dirname, 'src/styles'),
            },
        },
        server: {
            port: 3000,
            open: true,
            host: true,
            cors: true,
            proxy: {
                '/api': {
                    target: 'http://192.168.110.34:8888',
                    changeOrigin: true,
                    rewrite: path => path.replace(/^\/api/, ''),
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            // eslint-disable-next-line no-console
                            console.log('proxy error', err)
                        })
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            // eslint-disable-next-line no-console
                            console.log('Sending Request to the Target:', req.method, req.url)
                        })
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            // eslint-disable-next-line no-console
                            console.log(
                                'Received Response from the Target:',
                                proxyRes.statusCode,
                                req.url
                            )
                        })
                    },
                },
            },
        },
        build: {
            target: 'es2015',
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: isProduction,
                    drop_debugger: isProduction,
                },
            },
            rollupOptions: {
                output: {
                    chunkFileNames: 'js/[name]-[hash].js',
                    entryFileNames: 'js/[name]-[hash].js',
                    assetFileNames: assetInfo => {
                        const info = assetInfo.name?.split('.') || []
                        let extType = info[info.length - 1]
                        if (
                            /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')
                        ) {
                            extType = 'media'
                        } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name || '')) {
                            extType = 'img'
                        } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
                            extType = 'fonts'
                        }
                        return `${extType}/[name]-[hash].[ext]`
                    },
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        utils: ['axios'],
                    },
                },
            },
            // 启用 CSS 代码分割
            cssCodeSplit: true,
            // 设置 chunk 大小警告限制
            chunkSizeWarningLimit: 1000,
        },
        // 优化依赖
        optimizeDeps: {
            include: ['react', 'react-dom'],
            exclude: ['@vitejs/plugin-react'],
        },
        // CSS 预处理器选项
        css: {
            devSourcemap: !isProduction,
            modules: {
                // CSS Modules 配置
                localsConvention: 'camelCaseOnly',
                generateScopedName: isProduction
                    ? '[hash:base64:8]'
                    : '[name]__[local]___[hash:base64:5]',
                hashPrefix: 'th-governance',
            },
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@/styles/variables.scss" as *; @use "@/styles/mixins.scss" as *;`,
                    charset: false,
                },
            },
            postcss: './postcss.config.js',
        },
    }
})
