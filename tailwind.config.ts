import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#FFFFFF', // White background
				foreground: '#1A1A1A', // Near-black text
				primary: {
					DEFAULT: '#FF6A00', // Vibrant orange
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#FF2D55', // Strong red
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#FF8800', // Accent orange
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: '#FF2D55',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#FFF3E0', // Light orange
					foreground: '#FF6A00',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#1A1A1A',
				},
				sidebar: {
					DEFAULT: '#FFF3E0',
					foreground: '#FF6A00',
					primary: '#FF6A00',
					'primary-foreground': '#FFFFFF',
					accent: '#FF2D55',
					'accent-foreground': '#FFFFFF',
					border: '#FFD1C0',
					ring: '#FF8A66',
				},
				'pickngo-orange': {
					50: '#FFF5F2',
					100: '#FFE8E0',
					200: '#FFD1C0',
					300: '#FFB399',
					400: '#FF8A66',
					500: '#FE5D26',
					600: '#F54D1A',
					700: '#ED3500',
					800: '#C42D00',
					900: '#9B2400',
					950: '#5A1500',
				},
				'pickngo-red': {
					50: '#FFF2F3',
					100: '#FFE0E3',
					200: '#FFC1C7',
					300: '#FF8A99',
					400: '#FF5A6A',
					500: '#FF2D55',
					600: '#E62648',
					700: '#C41F3B',
					800: '#A1192F',
					900: '#7A1121',
					950: '#4D0812',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
