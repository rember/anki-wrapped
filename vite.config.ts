import { sveltekit } from '@sveltejs/kit/vite';
import wasmModuleWorkers from 'vite-plugin-wasm-module-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [wasmModuleWorkers(), sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
