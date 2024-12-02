import { sveltekit } from '@sveltejs/kit/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [topLevelAwait(), sveltekit()],

	optimizeDeps: {
		exclude: ['@effect/sql-sqlite-wasm']
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
