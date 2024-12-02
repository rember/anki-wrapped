import { sveltekit } from '@sveltejs/kit/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
// import wasmEsm from 'vite-plugin-wasm-esm';
import wasmModuleWorkers from 'vite-plugin-wasm-module-workers';
import { defineConfig } from 'vitest/config';

// #:

export default defineConfig({
	plugins: [topLevelAwait(), wasmModuleWorkers(), sveltekit()],
	// assetsInclude: ['**/*.wasm'],
	// optimizeDeps: {
	// 	exclude: ['@cf-wasm/resvg']
	// },
	// ssr: {
	// 	external: ['@cf-wasm/resvg']
	// },
	// build: {
	// 	rollupOptions: {
	// 		external: ['@cf-wasm/resvg']
	// 	}
	// },
	// optimizeDeps: {
	// 	exclude: ['@resvg/resvg-wasm/index_bg.wasm']
	// },
	// ssr: {
	// 	external: ['@resvg/resvg-wasm/index_bg.wasm']
	// },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
