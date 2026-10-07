export const OS_STORAGE_KEY = 'catatan-solusi:platform:v1';

export const osChoices = ['linux', 'windows', 'macos', 'all'] as const;

export type OsChoice = (typeof osChoices)[number];

export const osLabels: Record<OsChoice, string> = {
	linux: 'Linux',
	windows: 'Windows',
	macos: 'macOS',
	all: 'Semua platform',
};

const crossPlatform = 'lintas-platform';

export function isOsChoice(value: string | null | undefined): value is OsChoice {
	return value === 'linux' || value === 'windows' || value === 'macos' || value === 'all';
}

export function articleMatchesOs(platforms: readonly string[], choice: OsChoice): boolean {
	if (choice === 'all') return true;
	return platforms.includes(choice) || platforms.includes(crossPlatform);
}

export function pagefindFilters(choice: OsChoice | null): { platform: { any: string[] } } | undefined {
	if (!choice || choice === 'all') return undefined;
	return { platform: { any: [choice, crossPlatform] } };
}

function readStore(store: Storage): string | null {
	try {
		return store.getItem(OS_STORAGE_KEY);
	} catch {
		return null;
	}
}

function writeStore(store: Storage, value: OsChoice): boolean {
	try {
		store.setItem(OS_STORAGE_KEY, value);
		return true;
	} catch {
		return false;
	}
}

export function readStoredOs(): OsChoice | null {
	if (typeof window === 'undefined') return null;
	const local = readStore(window.localStorage);
	if (isOsChoice(local)) return local;
	const session = readStore(window.sessionStorage);
	return isOsChoice(session) ? session : null;
}

export function writeStoredOs(value: OsChoice): boolean {
	if (typeof window === 'undefined') return false;
	return writeStore(window.localStorage, value) || writeStore(window.sessionStorage, value);
}

export function osFromSearch(search: string): OsChoice | null {
	const value = new URLSearchParams(search).get('platform');
	return isOsChoice(value) ? value : null;
}

export function resolveOs(search: string): OsChoice | null {
	return osFromSearch(search) ?? readStoredOs();
}

export function countByOs(articles: readonly { platforms: readonly string[] }[]): Record<OsChoice, number> {
	const counts: Record<OsChoice, number> = { linux: 0, windows: 0, macos: 0, all: articles.length };
	for (const article of articles) {
		for (const choice of ['linux', 'windows', 'macos'] as const) {
			if (articleMatchesOs(article.platforms, choice)) counts[choice] += 1;
		}
	}
	return counts;
}
