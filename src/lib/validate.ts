import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { collectContentErrors, contentIdFromPath, type ContentRecord } from './rules';

const docsRoot = join(process.cwd(), 'src/content/docs');
const draftToken = 'TOKEN-DRAFT-7K2M';
const draftSlug = 'sistem-operasi/catatan-internal-draf';

function walkFiles(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walkFiles(path));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

function readFrontmatter(source: string, path: string): Record<string, unknown> {
	if (!source.startsWith('---')) {
		throw new Error(`${path}: frontmatter tidak ditemukan`);
	}
	const end = source.indexOf('\n---', 3);
	if (end < 0) throw new Error(`${path}: frontmatter tidak ditutup`);
	const parsed = parse(source.slice(3, end));
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`${path}: frontmatter harus berupa objek`);
	}
	return parsed as Record<string, unknown>;
}

export function loadContentRecords(): ContentRecord[] {
	return walkFiles(docsRoot)
		.filter((path) => /\.(md|mdx)$/i.test(path))
		.map((path) => {
			const source = readFileSync(path, 'utf8');
			return {
				id: contentIdFromPath(relative(docsRoot, path)),
				path,
				data: readFrontmatter(source, path),
			};
		});
}

export function validateRepository(): string[] {
	return collectContentErrors(loadContentRecords());
}

export function assertDraftExcludedFromDist(distRoot = join(process.cwd(), 'dist')): string[] {
	const errors: string[] = [];
	const draftHtml = join(distRoot, draftSlug, 'index.html');
	try {
		if (statSync(draftHtml).isFile()) errors.push(`Draf terbit di ${draftHtml}`);
	} catch {
		// Tidak ada berkas draf. Itu hasil yang diharapkan.
	}

	const pagefindRoot = join(distRoot, 'pagefind');
	let pagefindFiles: string[] = [];
	try {
		pagefindFiles = walkFiles(pagefindRoot);
	} catch {
		errors.push('Indeks Pagefind tidak ditemukan di dist/pagefind');
		return errors;
	}

	for (const file of pagefindFiles) {
		let text = '';
		try {
			text = readFileSync(file, 'utf8');
		} catch {
			continue;
		}
		if (text.includes(draftToken) || text.includes(draftSlug)) {
			errors.push(`Indeks pencarian memuat draf pada ${relative(distRoot, file)}`);
			break;
		}
	}

	return errors;
}
