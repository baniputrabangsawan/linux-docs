import { getCategory, isCategorySlug } from '../config/categories';
import { isArticleKind, isPlatform, isStatus } from '../config/labels';
import { docsSchemaExtension } from './schema';

export interface ContentRecord {
	id: string;
	path: string;
	data: Record<string, unknown>;
}

const vagueEnvironment = /^(linux|windows|macos|tidak diuji|belum diuji|n\/a|na|-|test)$/i;

function isoDay(value: unknown): string | undefined {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	return undefined;
}

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string');
}

export function contentIdFromPath(relativePath: string): string {
	const normalized = relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
	if (normalized === 'index') return 'index';
	return normalized.replace(/\/index$/, '');
}

export function collectContentErrors(records: ContentRecord[]): string[] {
	const errors: string[] = [];
	const ids = new Set(records.map((record) => record.id));

	for (const record of records) {
		const { id, data } = record;
		const parsed = docsSchemaExtension.safeParse(data);
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const path = issue.path.length > 0 ? issue.path.join('.') : 'frontmatter';
				errors.push(`${id}: ${path} ${issue.message}`);
			}
		}

		const kind = typeof data.kind === 'string' ? data.kind : undefined;
		const status = typeof data.status === 'string' ? data.status : undefined;
		const category = typeof data.category === 'string' ? data.category : undefined;
		const updatedAt = isoDay(data.updatedAt);
		const testedAt = isoDay(data.testedAt);
		const testedEnvironment =
			typeof data.testedEnvironment === 'string' ? data.testedEnvironment.trim() : undefined;

		if (kind === 'category') {
			if (category !== id) {
				errors.push(`${id}: category index harus memakai slug direktori yang sama`);
			}
		}

		if (isArticleKind(kind)) {
			const directory = id.split('/')[0] ?? '';
			if (!isCategorySlug(directory) || category !== directory) {
				errors.push(`${id}: category harus sama dengan direktori artikel`);
			}
			if (!getCategory(category)) {
				errors.push(`${id}: category tidak ada di registry`);
			}
		}

		if (kind === 'overview' && id !== 'dashboard') {
			errors.push(`${id}: kind overview hanya untuk dashboard`);
		}

		if (data.draft === true && data.pagefind !== false) {
			errors.push(`${id}: draf harus pagefind: false agar tidak terindeks bila berkas ikut terbit`);
		}

		if (status === 'verified') {
			if (!testedAt) {
				errors.push(`${id}: status verified ditolak karena testedAt tidak ada`);
			}
			if (!testedEnvironment) {
				errors.push(`${id}: status verified ditolak karena testedEnvironment tidak ada`);
			} else if (testedEnvironment.length < 16 || vagueEnvironment.test(testedEnvironment)) {
				errors.push(`${id}: status verified ditolak karena testedEnvironment tidak spesifik`);
			}
			if (testedAt && updatedAt && testedAt > updatedAt) {
				errors.push(`${id}: testedAt tidak boleh lebih baru dari updatedAt`);
			}
		}

		if (status && !isStatus(status) && isArticleKind(kind)) {
			errors.push(`${id}: status tidak dikenal`);
		}

		const platforms = stringList(data.platforms);
		for (const platform of platforms) {
			if (!isPlatform(platform)) errors.push(`${id}: platform ${platform} tidak dikenal`);
		}

		const related = stringList(data.related);
		for (const relatedId of related) {
			if (relatedId === id) {
				errors.push(`${id}: related tidak boleh menunjuk ke artikel itu sendiri`);
				continue;
			}
			if (!ids.has(relatedId)) {
				errors.push(`${id}: related ${relatedId} tidak ada`);
				continue;
			}
			const target = records.find((item) => item.id === relatedId);
			if (!target) continue;
			if (target.data.draft === true) {
				errors.push(`${id}: related ${relatedId} mengarah ke draf`);
			}
			if (!isArticleKind(typeof target.data.kind === 'string' ? target.data.kind : undefined)) {
				errors.push(`${id}: related ${relatedId} harus artikel, bukan halaman navigasi`);
			}
		}
	}

	return errors;
}
