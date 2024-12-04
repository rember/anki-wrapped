import { browser } from '$app/environment';
import { initWasm as initWasmResvg, Resvg } from '@resvg/resvg-wasm';
import { Array, Effect, Option, pipe, Random, Record } from 'effect';
import type { SatoriOptions } from 'satori';
import { TS_END, TS_START, type DataImage } from './values';

// #:

export class Image extends Effect.Service<Image>()('Image', {
	effect: Effect.gen(function* () {
		// ##: Return empty service in SSR

		if (!browser) {
			return {
				generateSvg: () => Effect.dieMessage('Not supported in SSR'),
				renderPng: () => Effect.dieMessage('Not supported in SSR')
			};
		}

		// ##: Import large libs dynamically to improve code splitting
		// TODO: Load Resvg correctly instead of from a CDN.

		const satori = yield* pipe(
			Effect.promise(() => import('satori')),
			Effect.map((_) => _.default)
		);

		// ##: Init WASM libraries

		yield* Effect.promise(() => initWasmResvg('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));

		// ##: Load fonts

		const fonts = yield* Effect.all(
			Record.map(
				{
					inter400: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
					inter500: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf',
					inter700: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf'
				},
				(url) =>
					pipe(
						Effect.promise(() => fetch(url)),
						Effect.andThen((response) => response.arrayBuffer())
					)
			),
			{ concurrency: 'unbounded' }
		);

		// ##: generateSvg

		// Creating this object here should improve performance
		// REFS: https://github.com/vercel/satori/issues/590
		const optionsSatori: SatoriOptions = {
			width: 360,
			height: 640,
			fonts: [
				{ name: 'Inter', data: fonts.inter400, weight: 400, style: 'normal' },
				{ name: 'Inter', data: fonts.inter500, weight: 500, style: 'normal' },
				{ name: 'Inter', data: fonts.inter700, weight: 700, style: 'normal' }
			]
		};

		const generateSvg = (args: { dataImage: DataImage }) =>
			Effect.gen(function* () {
				const templateImage = yield* makeTemplateImage(args);
				return yield* Effect.promise(() => satori(templateImage, optionsSatori));
			});

		// ##: renderPng

		const renderPng = (args: { dataImage: DataImage; svg: string }) =>
			Effect.sync(() => {
				const renderer = new Resvg(args.svg, {
					fitTo: {
						mode: 'width',
						value: 1080
					},
					background: 'white',
					font: { loadSystemFonts: false },
					textRendering: 1
				});
				const bufferPng = renderer.render().asPng();
				return bufferPng;
			});

		// ##:

		return {
			generateSvg,
			renderPng
		};
	})
}) {}

// #:

const makeTemplateImage = ({ dataImage }: { dataImage: DataImage }) =>
	Effect.gen(function* () {
		// ##: Background starry night

		const stars = yield* pipe(
			Array.replicate(
				Effect.gen(function* () {
					const random = yield* Random.Random;
					return {
						x: (yield* random.next) * 100,
						y: (yield* random.next) * 100,
						size: (yield* random.next) * 2 + 1,
						opacity: (yield* random.next) * 0.8 + 0.2
					};
				}),
				150
			),
			Effect.all,
			Effect.provideService(Random.Random, Random.make('ankiwrapped'))
		);

		const templateBackgroundStarryNight = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					position: 'relative',
					width: '100%',
					height: '100%',
					backgroundImage:
						'radial-gradient(circle at 50% -150%, #000c3a, #000c3a 80%, #003d64 90%, #26b09a 100%)'
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								position: 'absolute',
								top: '0px',
								right: '0px',
								left: '0px',
								height: '70%'
							},
							children: Array.map(stars, (star) => ({
								type: 'div',
								props: {
									style: {
										display: 'flex',
										position: 'absolute',
										backgroundColor: 'white',
										borderRadius: '9999px',
										left: `${star.x}%`,
										top: `${star.y}%`,
										width: `${star.size}px`,
										height: `${star.size}px`,
										opacity: `${star.opacity}`
									}
								}
							}))
						}
					}
				]
			}
		};

		// ##: Heatmap

		const dateStart = new Date(TS_START);
		const dateEnd = new Date(TS_END);

		const arrayDateIso: string[] = [];
		const dateCurrent = new Date(dateStart);
		while (dateCurrent < dateEnd) {
			arrayDateIso.push(dateCurrent.toISOString().split('T')[0]);
			dateCurrent.setDate(dateCurrent.getDate() + 1);
		}

		const recordHeatmap = pipe(
			dataImage.heatmapReviews,
			Array.map(({ dateIso, countReviews }) => [dateIso, countReviews] as const),
			Record.fromEntries
		);
		const dateIsoToOpacityHeatmap = (dateIso: string) => {
			const optionCountReviews = Record.get(recordHeatmap, dateIso);
			if (Option.isNone(optionCountReviews)) return 0.2;
			const countReviews = optionCountReviews.value;
			if (countReviews === 0) return 0.2;
			if (countReviews < 25) return 0.6;
			if (countReviews < 50) return 0.7;
			if (countReviews < 75) return 0.8;
			if (countReviews < 100) return 0.9;
			return 1;
		};

		const templateHeatmap = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					width: '33.333333%',
					paddingLeft: '8px',
					alignItems: 'center'
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexWrap: 'wrap',
								width: '74px',
								gap: '3px'
							},
							children: [
								{
									type: 'div',
									props: {
										style: { display: 'flex', width: '8px', height: '8px' }
									}
								},
								{
									type: 'div',
									props: {
										style: { display: 'flex', width: '8px', height: '8px' }
									}
								},
								{
									type: 'div',
									props: {
										style: { display: 'flex', width: '8px', height: '8px' }
									}
								},
								{
									type: 'div',
									props: {
										style: { display: 'flex', width: '8px', height: '8px' }
									}
								},
								Array.map(arrayDateIso, (dateIso) => ({
									type: 'div',
									props: {
										style: {
											display: 'flex',
											width: '8px',
											height: '8px',
											backgroundColor: 'white',
											opacity: dateIsoToOpacityHeatmap(dateIso)
										}
									}
								}))
							]
						}
					}
				]
			}
		};

		// ##: Stats

		const stripEmojis = (str: string) =>
			str
				.replace(
					/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
					''
				)
				.replace(/\s+/g, ' ')
				.trim();

		const templateStats = {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					width: '66.666667%',
					gap: '20px',
					paddingTop: '4px',
					paddingBottom: '4px'
				},
				children: [
					// Reviews
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '16px'
										},
										children: ['Reviews']
									}
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '32px',
											fontWeight: '700',
											lineHeight: '40px'
										},
										children: [dataImage.countReviews.toLocaleString('en-US')]
									}
								}
							]
						}
					},
					// Minutes Reviewed
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '16px'
										},
										children: ['Minutes Reviewed']
									}
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '32px',
											fontWeight: '700',
											lineHeight: '40px'
										},
										children: [dataImage.minutesSpentReviewing.toLocaleString('en-US')]
									}
								}
							]
						}
					},
					// Cards Created
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '16px'
										},
										children: ['Cards Created']
									}
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '32px',
											fontWeight: '700',
											lineHeight: '40px'
										},
										children: [dataImage.countCardsCreated.toLocaleString('en-US')]
									}
								}
							]
						}
					},
					// Top Decks
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column',
								flexGrow: 1,
								flexBasis: '0%'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: 'white',
											fontSize: '16px',
											paddingBottom: '4px'
										},
										children: ['Top Decks']
									}
								},
								...Array.map(dataImage.top5DecksByCountReviews, ({ name }, ix) => ({
									type: 'div',
									props: {
										style: {
											display: 'flex',
											gap: '12px'
										},
										children: [
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														color: 'white',
														fontWeight: '700'
													},
													children: [(ix + 1).toLocaleString('en-US')]
												}
											},
											{
												type: 'div',
												props: {
													style: {
														display: 'flex',
														color: 'white',
														fontWeight: '700',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													},
													children: [stripEmojis(name)]
												}
											}
										]
									}
								}))
							]
						}
					},
					// URL
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								fontWeight: '500',
								color: 'white'
							},
							children: ['ANKIWRAPPED.COM']
						}
					}
				]
			}
		};

		// ##:

		return {
			type: 'div',
			props: {
				style: {
					display: 'flex',
					position: 'relative',
					width: '100%',
					height: '100%',
					lineHeight: '24px'
				},
				children: [
					// Background starry night
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								position: 'absolute',
								top: '0px',
								right: '0px',
								bottom: '0px',
								left: '0px',
								width: '100%',
								height: '100%'
							},
							children: [templateBackgroundStarryNight]
						}
					},
					// Heatmap & Stats
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								position: 'absolute',
								top: '0px',
								right: '0px',
								bottom: '0px',
								left: '0px',
								width: '100%',
								height: '100%',
								padding: '20px'
							},
							children: [templateHeatmap, templateStats]
						}
					}
				]
			}
		};
	});
