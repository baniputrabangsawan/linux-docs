import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { site, siteUrl } from './src/config/site.ts';
import { sidebar } from './src/config/navigation.ts';
import { catatanSolusi } from './src/integrations/project.ts';
import { headerCopyPlugin } from './src/ec/header-copy.ts';
export default defineConfig({
	site: siteUrl,
	output: 'static',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: site.name,
			description: site.description,
			favicon: '/favicon.svg',
			logo: {
				src: './src/assets/brand/logo.svg',
				alt: site.name,
			},
			locales: {
				root: {
					label: 'Indonesia',
					lang: 'id',
				},
			},
			defaultLocale: 'root',
			lastUpdated: false,
			pagination: false,
			credits: false,
			disable404Route: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar,
			customCss: [
				'./src/styles/tokens.css',
				'./src/styles/starlight.css',
				'./src/styles/global.css',
				'./src/styles/dashboard.css',
				'./src/styles/article.css',
				'./src/styles/code.css',
				'./src/styles/search.css',
				'./src/styles/search-dialog.css',
				'./src/styles/os-filter.css',
			],
			components: {
				ThemeProvider: './src/components/starlight/ThemeProvider.astro',
				ThemeSelect: './src/components/starlight/ThemeSelect.astro',
				Header: './src/components/starlight/Header.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				Search: './src/components/starlight/Search.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
				MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro',
				Footer: './src/components/starlight/Footer.astro',
			},
			expressiveCode: {
				themes: ['github-light'],
				useDarkModeMediaQuery: false,
				useStarlightUiThemeColors: false,
				useStarlightDarkModeSwitch: false,
				themeCssSelector: () => "[data-theme='light'], [data-theme='dark']",
				minSyntaxHighlightingColorContrast: 5.5,
				styleOverrides: {
					borderRadius: '8px',
					borderWidth: '1px',
					codeFontFamily: 'var(--font-mono)',
					frames: {
						frameBoxShadowCssValue: 'none',
						editorBackground: '#F4F4F5',
						terminalBackground: '#F4F4F5',
						inlineButtonForeground: '#18181B',
					},
				},
				plugins: [headerCopyPlugin()],
			},
			markdown: {
				headingLinks: true,
			},
		}),
		catatanSolusi(),
	],
});
