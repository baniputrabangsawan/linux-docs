import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { assertDraftExcludedFromDist } from '../src/lib/validate';

const distRoot = join(process.cwd(), 'dist');

function walkHtml(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walkHtml(path));
		else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
	}
	return files;
}

function fileForHref(href: string): string | undefined {
	const url = new URL(href, 'http://localhost');
	if (url.origin !== 'http://localhost') return undefined;
	let pathname = decodeURIComponent(url.pathname);
	if (pathname.endsWith('/')) pathname += 'index.html';
	else if (!pathname.split('/').pop()?.includes('.')) pathname += '/index.html';
	return join(distRoot, pathname);
}

const errors: string[] = [];
const htmlFiles = walkHtml(distRoot);

for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8');
	const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);
	for (const href of hrefs) {
		if (!href || href.startsWith('mailto:') || href.startsWith('http:') || href.startsWith('https:')) continue;
		if (href.startsWith('#') ) {
			const id = href.slice(1);
			if (id && !html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
				errors.push(`${relative(distRoot, file)}: jangkar ${href} tidak ada`);
			}
			continue;
		}
		const [pathPart, hash] = href.split('#');
		const target = fileForHref(pathPart || '/');
		if (!target) continue;
		try {
			statSync(target);
		} catch {
			errors.push(`${relative(distRoot, file)}: tautan lokal ${href} tidak ada`);
			continue;
		}
		if (hash) {
			const targetHtml = readFileSync(target, 'utf8');
			if (!targetHtml.includes(`id="${hash}"`) && !targetHtml.includes(`id='${hash}'`)) {
				errors.push(`${relative(distRoot, file)}: jangkar #${hash} tidak ada di ${relative(distRoot, target)}`);
			}
		}
	}
}

errors.push(...assertDraftExcludedFromDist(distRoot));

if (errors.length > 0) {
	console.error(errors.map((error) => `- ${error}`).join('\n'));
	process.exit(1);
}

console.log(`Pemeriksaan tautan lulus pada ${htmlFiles.length} berkas HTML.`);
