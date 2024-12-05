import { addDynamicIconSelectors } from '@iconify/tailwind';
import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme.js';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter Variable"', '"Inter"', ...defaultTheme.fontFamily.sans]
			}
		}
	},

	plugins: [typography, forms, containerQueries, aspectRatio, addDynamicIconSelectors()]
} satisfies Config;
