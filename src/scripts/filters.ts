import { articleMatchesOs, isOsChoice } from '../lib/os-preference';
const platforms = new Set(['linux', 'windows', 'macos', 'lintas-platform']);
const statuses = new Set(['verified', 'unverified', 'investigating']);

function readParam(params: URLSearchParams, key: string, allowed: Set<string>): { value: string; invalid: boolean } {
	const value = params.get(key) ?? '';
	if (value.length === 0) return { value: '', invalid: false };
	if (!allowed.has(value)) return { value: '', invalid: true };
	return { value, invalid: false };
}

function matches(card: HTMLElement, platform: string, status: string): boolean {
	const cardStatus = card.dataset.status ?? '';
	const cardPlatforms = (card.dataset.platforms ?? '').split(/\s+/).filter(Boolean);
	const statusOk = status.length === 0 || cardStatus === status;
	const platformOk =
		platform.length === 0 ||
		cardPlatforms.includes(platform) ||
		cardPlatforms.includes('lintas-platform');
	const selected = document.documentElement.dataset.os;
	const osOk = !isOsChoice(selected) || articleMatchesOs(cardPlatforms, selected);
	return statusOk && platformOk && osOk;
}

export function initFilters(): void {
	const root = document.querySelector<HTMLElement>('[data-article-filters]');
	if (!root || root.dataset.filtersReady === 'true') return;
	root.dataset.filtersReady = 'true';

	const platformSelect = root.querySelector<HTMLSelectElement>('[data-filter="platform"]');
	const statusSelect = root.querySelector<HTMLSelectElement>('[data-filter="status"]');
	const categorySelect = root.querySelector<HTMLSelectElement>('[data-filter="category"]');
	const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
	const live = root.querySelector<HTMLElement>('[data-filter-status]');
	if (!platformSelect || !statusSelect || !categorySelect || !empty || !live) return;

	const apply = (mode: 'push' | 'replace') => {
		const params = new URLSearchParams(window.location.search);
		const platform = readParam(params, 'platform', platforms);
		const status = readParam(params, 'status', statuses);
		if (platform.invalid) params.delete('platform');
		if (status.invalid) params.delete('status');
		platformSelect.value = platform.value;
		statusSelect.value = status.value;
		const cards = [...root.querySelectorAll<HTMLElement>('[data-article-card]')];
		let visible = 0;
		for (const card of cards) {
			const shown = matches(card, platform.value, status.value);
			card.hidden = !shown;
			const host = card.closest('li');
			if (host) host.hidden = !shown;
			if (shown) visible += 1;
		}
		empty.hidden = visible > 0 || cards.length === 0;
		live.textContent = cards.length === 0 ? '' : `${visible} artikel ditampilkan`;

		if (platform.invalid || status.invalid || mode === 'push') {
			const query = params.toString();
			const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
			if (mode === 'push' && !platform.invalid && !status.invalid) history.pushState(null, '', next);
			else history.replaceState(null, '', next);
		}
	};

	apply('replace');

	platformSelect.addEventListener('change', () => {
		const params = new URLSearchParams(window.location.search);
		if (platformSelect.value) params.set('platform', platformSelect.value);
		else params.delete('platform');
		const query = params.toString();
		history.pushState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
		apply('replace');
	});

	statusSelect.addEventListener('change', () => {
		const params = new URLSearchParams(window.location.search);
		if (statusSelect.value) params.set('status', statusSelect.value);
		else params.delete('status');
		const query = params.toString();
		history.pushState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
		apply('replace');
	});

	categorySelect.addEventListener('change', () => {
		const params = new URLSearchParams();
		if (platformSelect.value) params.set('platform', platformSelect.value);
		if (statusSelect.value) params.set('status', statusSelect.value);
		const query = params.toString();
		window.location.assign(`/${categorySelect.value}/${query ? `?${query}` : ''}`);
	});

	window.addEventListener('popstate', () => apply('replace'));
}
