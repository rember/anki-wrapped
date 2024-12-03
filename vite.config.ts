import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		topLevelAwait(),
		enhancedImages(),
		sveltekit()
		// Uncomment to generate bundle stats with `rollup-plugin-visualizer`. The
		// stats are saved in `./.svelte-kit/output/client/stats.html` and
		// `./.svelte-kit/output/server/stats.html`.
		// visualizer({ emitFile: true, filename: 'stats.html' })
	],

	optimizeDeps: {
		exclude: ['@effect/sql-sqlite-wasm']
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
