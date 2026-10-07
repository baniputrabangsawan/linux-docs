import { getCollection, type CollectionEntry } from 'astro:content';
import type { z } from 'astro/zod';
import { categories, getCategory, type CategorySlug } from '../config/categories';
import { isArticleKind, type ArticleKind } from '../config/labels';
import { docsSchemaExtension } from './schema';

export type DocsEntry = CollectionEntry<'docs'>;
export type ArticleFields = Extract<z.infer<typeof docsSchemaExtension>, { kind: ArticleKind }>;

export interface PublicArticle {
	id: string;
	data: ArticleFields;
}

export function entryHref(id: string): string {
	if (id === '' || id === 'index') return '/';
	return `/${id}/`;
}

export function isPublicArticle(entry: DocsEntry): entry is DocsEntry & { data: ArticleFields } {
	return entry.data.draft !== true && isArticleKind(entry.data.kind);
}

export async function getDocs(): Promise<DocsEntry[]> {
	return getCollection('docs', ({ data }) => data.draft !== true);
}

export async function getPublicArticles(): Promise<PublicArticle[]> {
	const docs = await getDocs();
	return docs.filter(isPublicArticle).sort((left, right) => {
		const byDate = right.data.updatedAt.localeCompare(left.data.updatedAt);
		if (byDate !== 0) return byDate;
		return left.id.localeCompare(right.id, 'id');
	});
}

export async function getArticlesInCategory(slug: CategorySlug): Promise<PublicArticle[]> {
	const articles = await getPublicArticles();
	return articles
		.filter((entry) => entry.data.category === slug)
		.sort((left, right) => left.data.title.localeCompare(right.data.title, 'id'));
}

export async function getSiteStats(): Promise<{
	articleCount: number;
	filledCategoryCount: number;
	recent: PublicArticle[];
	counts: Record<CategorySlug, number>;
}> {
	const articles = await getPublicArticles();
	const counts = Object.fromEntries(categories.map((category) => [category.slug, 0])) as Record<
		CategorySlug,
		number
	>;
	for (const article of articles) {
		const category = getCategory(article.data.category);
		if (category) counts[category.slug] += 1;
	}
	const filledCategoryCount = categories.filter((category) => counts[category.slug] > 0).length;
	return {
		articleCount: articles.length,
		filledCategoryCount,
		recent: articles.slice(0, 5),
		counts,
	};
}
