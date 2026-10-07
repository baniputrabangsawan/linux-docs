import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { isArticleKind } from '../config/labels';
import { contentIdFromPath } from './rules';
import { articleMatchesOs, type OsChoice } from './os-preference';

export interface PublicSearchHit {
	url: string;
	excerpt: string;
	meta: {
		title: string;
		category: string;
		kind: string;
		platform: string;
	};
}

interface PublicDoc {
	url: string;
	title: string;
	description: string;
	tags: string[];
	text: string;
	category: string;
	platforms: string[];
	kind: string;
}

const docsRoot = join(process.cwd(), 'src/content/docs');

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walk(path));
		else if (/\.(md|mdx)$/i.test(entry.name)) files.push(path);
	}
	return files;
}

function frontmatter(source: string): Record<string, unknown> | null {
	if (!source.startsWith('---')) return null;
	const end = source.indexOf('\n---', 3);
	if (end < 0) return null;
	const parsed = parse(source.slice(3, end));
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
	return parsed as Record<string, unknown>;
}

function plainBody(source: string): string {
	const end = source.startsWith('---') ? source.indexOf('\n---', 3) : -1;
	let body = end >= 0 ? source.slice(end + 4) : source;
	body = body.replace(/^import\s.+$/gm, ' ');
	body = body.replace(/```[a-z0-9-]*\n?/gi, ' ');
	body = body.replace(/```/g, ' ');
	body = body.replace(/<[^>]+>/g, ' ');
	body = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
	body = body.replace(/^#{1,6}\s+/gm, '');
	body = body.replace(/[*_`>]/g, ' ');
	return body.replace(/\s+/g, ' ').trim();
}

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string');
}

export function loadPublicDocs(root = docsRoot): PublicDoc[] {
	const docs: PublicDoc[] = [];
	for (const path of walk(root)) {
		const source = readFileSync(path, 'utf8');
		const data = frontmatter(source);
		if (!data || data.draft === true) continue;
		const kind = typeof data.kind === 'string' ? data.kind : '';
		if (!isArticleKind(kind)) continue;
		const id = contentIdFromPath(relative(root, path));
		const platforms = stringList(data.platforms);
		docs.push({
			url: `/${id}/`,
			title: typeof data.title === 'string' ? data.title : id,
			description: typeof data.description === 'string' ? data.description : '',
			tags: stringList(data.tags),
			text: plainBody(source),
			category: typeof data.category === 'string' ? data.category : '',
			platforms,
			kind,
		});
	}
	return docs;
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function excerpt(text: string, query: string): string {
	const haystack = text.toLowerCase();
	const needle = query.toLowerCase();
	const at = haystack.indexOf(needle);
	if (at < 0) return escapeHtml(text.slice(0, 140));
	const start = Math.max(0, at - 48);
	const end = Math.min(text.length, at + query.length + 80);
	const slice = text.slice(start, end);
	const offset = at - start;
	const marked = `${escapeHtml(slice.slice(0, offset))}<mark>${escapeHtml(slice.slice(offset, offset + query.length))}</mark>${escapeHtml(slice.slice(offset + query.length))}`;
	return `${start > 0 ? '…' : ''}${marked}${end < text.length ? '…' : ''}`;
}

function score(doc: PublicDoc, query: string): number {
	const needle = query.toLowerCase();
	let value = 0;
	if (doc.title.toLowerCase().includes(needle)) value += 8;
	if (doc.description.toLowerCase().includes(needle)) value += 4;
	if (doc.tags.some((tag) => tag.toLowerCase().includes(needle))) value += 3;
	if (doc.text.toLowerCase().includes(needle)) value += 1;
	return value;
}

export function searchPublicDocs(query: string, os: OsChoice | null, docs = loadPublicDocs()): PublicSearchHit[] {
	const normalized = query.trim();
	if (normalized.length === 0) return [];
	return docs
		.filter((doc) => !os || articleMatchesOs(doc.platforms, os))
		.map((doc) => ({ doc, rank: score(doc, normalized) }))
		.filter((item) => item.rank > 0)
		.sort((left, right) => right.rank - left.rank || left.doc.title.localeCompare(right.doc.title, 'id'))
		.slice(0, 8)
		.map(({ doc }) => ({
			url: doc.url,
			excerpt: excerpt(`${doc.description} ${doc.text}`, normalized),
			meta: {
				title: doc.title,
				category: doc.category,
				kind: doc.kind,
				platform: doc.platforms[0] ?? '',
			},
		}));
}
