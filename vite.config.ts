import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasmModuleWorkers from './vite-plugin-wasm-module-workers';

export default defineConfig({
	plugins: [wasmModuleWorkers(), sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
