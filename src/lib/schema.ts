import { z } from 'astro/zod';
import { categorySlugs } from '../config/categories';
import { articleKinds, kinds, platforms } from '../config/labels';

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan tanggal ISO YYYY-MM-DD')
	.refine((value) => {
		const [year, month, day] = value.split('-').map(Number);
		const date = new Date(Date.UTC(year, month - 1, day));
		return (
			date.getUTCFullYear() === year &&
			date.getUTCMonth() === month - 1 &&
			date.getUTCDate() === day &&
			value <= new Date().toISOString().slice(0, 10)
		);
	}, 'Tanggal tidak valid atau berada di masa depan');

const tag = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Tag harus huruf kecil dan kebab-case');

const httpUrl = z.string().refine((value) => {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}, 'URL sumber harus HTTP atau HTTPS');

const sourceSchema = z.object({
	label: z.string().min(1),
	url: httpUrl,
});

const relatedId = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/, 'ID terkait harus slug artikel');

const title = z.string().min(1);
const description = z.string().min(1);
const sidebarLabel = z.string().min(1).max(80).optional();

const navPage = z.object({
	title,
	description,
	kind: z.enum(['overview', 'category']),
	pagefind: z.literal(false),
	category: z.enum(categorySlugs).optional(),
});

const verifiedArticle = z.object({
	title,
	description,
	kind: z.enum(articleKinds),
	category: z.enum(categorySlugs),
	sidebarLabel,
	platforms: z.array(z.enum(platforms)).min(1),
	tags: z.array(tag).min(1),
	status: z.literal('verified'),
	updatedAt: isoDate,
	testedAt: isoDate,
	testedEnvironment: z.string().min(16, 'Lingkungan pengujian harus spesifik'),
	sources: z.array(sourceSchema).optional(),
	related: z.array(relatedId).optional(),
});

const openArticle = z.object({
	title,
	description,
	kind: z.enum(articleKinds),
	category: z.enum(categorySlugs),
	sidebarLabel,
	platforms: z.array(z.enum(platforms)).min(1),
	tags: z.array(tag).min(1),
	status: z.enum(['unverified', 'investigating']),
	updatedAt: isoDate,
	testedAt: isoDate.optional(),
	testedEnvironment: z.string().min(1).optional(),
	sources: z.array(sourceSchema).optional(),
	related: z.array(relatedId).optional(),
});

/**
 * Perluasan docsSchema. Union menjaga syarat status teruji tanpa mengganti field Starlight.
 * Field Starlight yang tidak disebut di sini tetap digabung oleh docsSchema().
 */
export const docsSchemaExtension = z.union([navPage, verifiedArticle, openArticle]);

export const kindValues = kinds;
