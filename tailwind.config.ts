import { addDynamicIconSelectors } from '@iconify/tailwind';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme.js';

// #:

const pluginIconify = addDynamicIconSelectors();

// #:

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter Variable"', '"Inter"', ...defaultTheme.fontFamily.sans]
			}
		}
	},
	plugins: [pluginIconify]
} satisfies Config;
