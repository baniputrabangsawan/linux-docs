export const platforms = ['linux', 'windows', 'macos', 'lintas-platform'] as const;
export type Platform = (typeof platforms)[number];

export const platformLabels: Record<Platform, string> = {
	linux: 'Linux',
	windows: 'Windows',
	macos: 'macOS',
	'lintas-platform': 'Lintas platform',
};

export const statuses = ['verified', 'unverified', 'investigating'] as const;
export type Status = (typeof statuses)[number];

export const statusLabels: Record<Status, string> = {
	verified: 'Teruji',
	unverified: 'Belum terverifikasi',
	investigating: 'Dalam diagnosis',
};

export const articleKinds = ['troubleshooting', 'configuration', 'command-reference'] as const;
export type ArticleKind = (typeof articleKinds)[number];

export const navKinds = ['overview', 'category'] as const;
export type NavKind = (typeof navKinds)[number];

export const kinds = [...navKinds, ...articleKinds] as const;
export type Kind = (typeof kinds)[number];

export function isArticleKind(value: string | undefined): value is ArticleKind {
	return articleKinds.includes(value as ArticleKind);
}

export function isPlatform(value: string): value is Platform {
	return platforms.includes(value as Platform);
}

export function isStatus(value: string): value is Status {
	return statuses.includes(value as Status);
}
