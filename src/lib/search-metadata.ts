import { getCategory } from '../config/categories';
import { platformLabels, statusLabels, type Platform } from '../config/labels';
import type { PublicArticle } from './content';

export interface SearchMetaItem {
	filter: string;
	meta?: string;
	text?: string;
}

/** Proyeksi field artikel ke atribut Pagefind. Nilai berasal dari frontmatter, bukan teks bebas. */
export function searchMetadata(entry: PublicArticle): SearchMetaItem[] {
	const data = entry.data;
	const category = getCategory(data.category);
	const items: SearchMetaItem[] = [
		{ filter: `kind:${data.kind}`, meta: `kind:${data.kind}` },
		{
			filter: `category:${data.category}`,
			meta: `category:${data.category}`,
			text: category?.label,
		},
		{
			filter: `status:${data.status}`,
			meta: `status:${data.status}`,
			text: statusLabels[data.status],
		},
	];
	for (const platform of data.platforms) {
		items.push({
			filter: `platform:${platform}`,
			meta: platform === data.platforms[0] ? `platform:${platform}` : undefined,
			text: platformLabels[platform as Platform],
		});
	}
	for (const tag of data.tags) {
		items.push({ filter: `tag:${tag}` });
	}
	return items;
}

