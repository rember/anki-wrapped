import { sveltekit } from '@sveltejs/kit/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
// import wasmEsm from 'vite-plugin-wasm-esm';
import { defineConfig } from 'vitest/config';

// #:
// REFS: https://github.com/patdx/pmil.me/blob/f21bb110fae51fb0679e4b83d4d2e2571d09b7f6/vite.config.ts#L121

function makeWasmLoader(wasmPath: string) {
	const code = /* js */ `import fs from "fs";

const wasmModule = new WebAssembly.Module(fs.readFileSync(${JSON.stringify(wasmPath)}));
export default wasmModule;
`;
	return code;
}

const cloudflareStyleWasmLoader = () => {
	let isDev = false;

	return {
		name: 'cloudflare-style-wasm-loader',
		enforce: 'pre',
		config(config, env) {
			return {
				build: { rollupOptions: { external: [/.+\.wasm$/i] } }
			};
		},
		configResolved(config) {
			isDev = config.command === 'serve';
		},
		resolveId(id) {
			if (isDev) return;
			// prod only

			if (id.endsWith('.wasm?module')) {
				console.log('Resolving WASM file:', id);
				return {
					id: id.slice(0, -1 * '?module'.length),
					external: true
				};
			}
		},
		load(id) {
			if (!isDev) return;
			// dev only

			if (id.endsWith('.wasm?module')) {
				const actualId = id.slice(0, -1 * '?module'.length);
				console.log('Loading WASM file:', id);
				return makeWasmLoader(actualId);
			}
		}
	} satisfies Plugin;
};

// #:

export default defineConfig({
	plugins: [topLevelAwait(), cloudflareStyleWasmLoader(), sveltekit()],
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
	optimizeDeps: {
		exclude: ['@resvg/resvg-wasm/index_bg.wasm']
	},
	ssr: {
		external: ['@resvg/resvg-wasm/index_bg.wasm']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
