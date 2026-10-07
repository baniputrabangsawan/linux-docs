import type { PublicArticle } from './content';

const relatedLimit = 3;

export function resolveRelated(entry: PublicArticle, articles: PublicArticle[]): PublicArticle[] {
	const byId = new Map(articles.map((article) => [article.id, article]));
	const explicit = entry.data.related ?? [];
	if (explicit.length > 0) {
		return explicit
			.map((id) => byId.get(id))
			.filter((article): article is PublicArticle => article !== undefined && article.id !== entry.id)
			.slice(0, relatedLimit);
	}

	const tags = new Set(entry.data.tags ?? []);
	return articles
		.filter((article) => article.id !== entry.id)
		.map((article) => ({
			article,
			score: (article.data.tags ?? []).filter((tag) => tags.has(tag)).length,
		}))
		.filter((item) => item.score > 0)
		.sort((left, right) => {
			if (right.score !== left.score) return right.score - left.score;
			const byDate = right.article.data.updatedAt.localeCompare(left.article.data.updatedAt);
			if (byDate !== 0) return byDate;
			return left.article.id.localeCompare(right.article.id, 'id');
		})
		.slice(0, relatedLimit)
		.map((item) => item.article);
}
