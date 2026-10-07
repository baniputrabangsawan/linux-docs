import type { Plugin } from 'vite';
import { isOsChoice } from '../lib/os-preference';
import { searchPublicDocs } from '../lib/public-search';

export function devSearchPlugin(): Plugin {
	return {
		name: 'catatan-solusi-dev-search',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = new URL(req.url ?? '/', 'http://localhost');
				if (url.pathname !== '/__cs/dev-search') {
					next();
					return;
				}
				const os = url.searchParams.get('os');
				const hits = searchPublicDocs(url.searchParams.get('q') ?? '', isOsChoice(os) ? os : null);
				res.setHeader('content-type', 'application/json; charset=utf-8');
				res.setHeader('cache-control', 'no-store');
				res.end(JSON.stringify(hits));
			});
		},
	};
}
