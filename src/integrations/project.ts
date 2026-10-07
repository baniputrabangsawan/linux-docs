import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { siteUrl, siteUrlConfigured } from '../config/site';
import { devSearchPlugin } from './dev-search';
import { validateRepository } from '../lib/validate';

export function catatanSolusi(): AstroIntegration {
	return {
		name: 'catatan-solusi',
		hooks: {
			'astro:config:setup': ({ command, updateConfig }) => {
				if (!siteUrlConfigured) {
					console.warn(
						'[catatan-solusi] PUBLIC_SITE_URL tidak diatur. Canonical dan sitemap memakai http://localhost:4321. Jangan terbitkan build ini.',
					);
				}
				if (command === 'dev') {
					updateConfig({ vite: { plugins: [devSearchPlugin()] } });
				}
				const errors = validateRepository();
				if (errors.length > 0) {
					throw new Error(`Validasi konten gagal:\n${errors.map((error) => `- ${error}`).join('\n')}`);
				}
			},
			'astro:build:done': ({ dir }) => {
				const names = readdirSync(fileURLToPath(dir));
				const sitemap = names.find((name) => name.startsWith('sitemap') && name.endsWith('.xml'));
				const lines = ['User-agent: *', 'Allow: /', ''];
				if (sitemap) lines.push(`Sitemap: ${siteUrl}/${sitemap}`, '');
				writeFileSync(new URL('robots.txt', dir), `${lines.join('\n')}\n`);
			},
		},
	};
}
