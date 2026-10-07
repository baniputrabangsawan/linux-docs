import { isOsChoice, pagefindFilters, type OsChoice } from '../lib/os-preference';

interface PagefindResult {
	url: string;
	excerpt: string;
	meta: Record<string, string | string[]>;
}

interface PagefindSearch {
	results: Array<{ data: () => Promise<PagefindResult> }>;
}

interface PagefindModule {
	options: (options: { bundlePath: string }) => Promise<void>;
	init: () => Promise<void>;
	debouncedSearch: (
		query: string,
		options: { filters?: { platform: { any: string[] } } },
		debounce: number,
	) => Promise<PagefindSearch | null>;
}

interface SearchLabels {
	categories: Record<string, string>;
	platforms: Record<string, string>;
	statuses: Record<string, string>;
}

interface IndexProbe {
	state: 'ready' | 'missing' | 'invalid' | 'network';
	status: number;
	url: string;
}

const debounceMs = 120;
const emptyMessage = 'Cari solusi berdasarkan judul atau pesan error';
const loadingMessage = 'Mencari…';
const failureMessage = 'Pencarian belum dapat dimuat';
let pagefindPromise: Promise<PagefindModule> | null = null;
let pagefindAttempt = 0;
let requestId = 0;
let indexProbe: IndexProbe | null = null;
let loggedFallback = false;
let lastTrigger: HTMLElement | null = null;

function isApplePlatform(): boolean {
	const platform = navigator.platform || '';
	const agent = navigator.userAgent || '';
	return /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS|iPhone|iPad/i.test(agent);
}

function bundlePath(): string {
	const base = import.meta.env.BASE_URL;
	return `${base.endsWith('/') ? base : `${base}/`}pagefind/`;
}

function pagefindUrl(): string {
	const suffix = pagefindAttempt === 0 ? '' : `?retry=${pagefindAttempt}`;
	return new URL(`${bundlePath()}pagefind.js${suffix}`, window.location.href).href;
}

function asPagefind(module: unknown): PagefindModule {
	const record = module as Partial<PagefindModule> & { default?: Partial<PagefindModule> };
	const candidate = typeof record.init === 'function' ? record : record.default;
	if (!candidate || typeof candidate.init !== 'function' || typeof candidate.debouncedSearch !== 'function') {
		throw new Error('Modul Pagefind tidak valid');
	}
	return candidate as PagefindModule;
}
function logSearchIssue(probe: IndexProbe, error?: unknown): void {
	if (!import.meta.env.DEV) return;
	const detail = error instanceof Error ? error.message : undefined;
	console.error('[catatan-solusi] pencarian gagal', {
		state: probe.state,
		status: probe.status,
		url: probe.url,
		detail,
	});
}

async function probePagefind(force = false): Promise<IndexProbe> {
	if (indexProbe?.state === 'ready' && !force) return indexProbe;
	const url = pagefindUrl();
	try {
		const response = await fetch(url, { cache: 'no-store' });
		const type = response.headers.get('content-type') ?? '';
		const javascript = type.length === 0 || type.includes('javascript') || type.includes('ecmascript');
		let state: IndexProbe['state'] = 'ready';
		if (response.status === 404 || type.includes('text/html')) state = 'missing';
		else if (!response.ok || !javascript) state = 'invalid';
		indexProbe = { state, status: response.status, url };
	} catch {
		indexProbe = { state: 'network', status: 0, url };
	}
	return indexProbe;
}

function loadPagefind(): Promise<PagefindModule> {
	if (!pagefindPromise) {
		const url = pagefindUrl();
		pagefindPromise = import(/* @vite-ignore */ url)
			.then(async (module) => {
				const pagefind = asPagefind(module);
				await pagefind.options({ bundlePath: bundlePath() });
				await pagefind.init();
				return pagefind;
			})
			.catch((error: unknown) => {
				pagefindPromise = null;
				pagefindAttempt += 1;
				indexProbe = null;
				throw error;
			});
	}
	return pagefindPromise;
}

async function searchDevFallback(query: string, os: OsChoice | null): Promise<PagefindResult[]> {
	if (!import.meta.env.DEV) throw new Error('Fallback development tidak dipakai di produksi');
	const params = new URLSearchParams({ q: query });
	if (os) params.set('os', os);
	const response = await fetch(`/__cs/dev-search?${params.toString()}`);
	if (!response.ok) throw new Error(`dev-search ${response.status}`);
	const payload: unknown = await response.json();
	if (!Array.isArray(payload)) throw new Error('dev-search bentuk tidak valid');
	return payload as PagefindResult[];
}

function renderExcerpt(excerpt: string): string {
	const marks: string[] = [];
	const slotted = excerpt
		.replace(/<mark>/g, () => {
			marks.push('<mark>');
			return `\u0000${marks.length - 1}\u0000`;
		})
		.replace(/<\/mark>/g, () => {
			marks.push('</mark>');
			return `\u0000${marks.length - 1}\u0000`;
		});
	const escaped = slotted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return escaped.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => marks[Number(index)] ?? '');
}

function metaValue(meta: PagefindResult['meta'], key: string): string {
	const value = meta[key];
	if (Array.isArray(value)) return value[0] ?? '';
	return value ?? '';
}

export function initSearch(): void {
	const root = document.documentElement;
	if (root.dataset.searchReady === 'true') return;
	const dialog = document.querySelector<HTMLDialogElement>('#site-search-dialog');
	const input = document.querySelector<HTMLInputElement>('#site-search-input');
	const status = document.querySelector<HTMLElement>('#search-status');
	const results = document.querySelector<HTMLElement>('#search-results');
	const errorBox = document.querySelector<HTMLElement>('[data-search-error]');
	const categoryBox = document.querySelector<HTMLElement>('[data-search-categories]');
	const form = document.querySelector<HTMLFormElement>('[data-search-form]');
	const clearButton = document.querySelector<HTMLButtonElement>('[data-search-clear]');
	if (!dialog || !input || !status || !results || !errorBox || !categoryBox || !form) return;
	root.dataset.searchReady = 'true';

	const labels = JSON.parse(dialog.dataset.labels || '{}') as SearchLabels;
	if (isApplePlatform()) {
		document.querySelectorAll('[data-search-mod]').forEach((node) => {
			node.textContent = '⌘';
		});
	}

	const setStatus = (state: string, message: string) => {
		status.dataset.state = state;
		status.textContent = message;
	};

	const syncClear = () => {
		if (clearButton) clearButton.hidden = input.value.length === 0;
	};

	const syncExpanded = () => {
		input.setAttribute('aria-expanded', results.querySelector('[role="option"]') ? 'true' : 'false');
	};

	const selectedResult = () => results.querySelector<HTMLElement>('[aria-selected="true"]');

	const selectResult = (next: HTMLElement | null) => {
		results.querySelectorAll<HTMLElement>('[role="option"]').forEach((option) => {
			option.setAttribute('aria-selected', option === next ? 'true' : 'false');
		});
		input.setAttribute('aria-activedescendant', next?.id ?? '');
		next?.scrollIntoView({ block: 'nearest' });
	};

	const openSelected = () => {
		const link = selectedResult()?.querySelector('a');
		if (link instanceof HTMLAnchorElement) window.location.assign(link.href);
	};

	const showEmpty = () => {
		results.replaceChildren();
		errorBox.hidden = true;
		categoryBox.hidden = false;
		setStatus('initial', emptyMessage);
		syncExpanded();
		syncClear();
	};

	const renderResults = (items: PagefindResult[], query: string) => {
		results.replaceChildren();
		errorBox.hidden = true;
		if (items.length === 0) {
			categoryBox.hidden = false;
			setStatus('empty', `Tidak ditemukan hasil untuk ‘${query}’`);
			syncExpanded();
			return;
		}
		categoryBox.hidden = true;
		setStatus('results', items.length === 1 ? '1 hasil' : `${items.length} hasil`);
		items.forEach((item, index) => {
			const option = document.createElement('li');
			option.className = 'search-result';
			option.role = 'option';
			option.id = `search-result-${index}`;
			option.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
			const link = document.createElement('a');
			link.href = item.url;
			const title = document.createElement('span');
			title.className = 'search-result-title';
			title.textContent = metaValue(item.meta, 'title') || item.url;
			link.append(title);
			const categorySlug = metaValue(item.meta, 'category');
			const category = labels.categories[categorySlug] ?? categorySlug;
			if (category) {
				const meta = document.createElement('span');
				meta.className = 'search-result-meta';
				meta.textContent = category;
				link.append(meta);
			}
			const excerpt = document.createElement('span');
			excerpt.className = 'search-result-excerpt';
			excerpt.innerHTML = renderExcerpt(item.excerpt);
			link.append(excerpt);
			option.append(link);
			results.append(option);
		});
		input.setAttribute('aria-activedescendant', 'search-result-0');
		syncExpanded();
	};

	const showFailure = (probe: IndexProbe, error?: unknown) => {
		logSearchIssue(probe, error);
		results.replaceChildren();
		errorBox.hidden = false;
		categoryBox.hidden = true;
		setStatus('error', failureMessage);
		syncExpanded();
	};

	const selectedOs = (): OsChoice | null => {
		const value = document.documentElement.dataset.os;
		return isOsChoice(value) ? value : null;
	};

	const runQuery = async (query: string) => {
		const token = ++requestId;
		const normalized = query.trim();
		syncClear();
		if (normalized.length === 0) {
			showEmpty();
			return;
		}
		errorBox.hidden = true;
		categoryBox.hidden = true;
		setStatus('loading', loadingMessage);
		syncExpanded();
		const os = selectedOs();
		try {
			const probe = await probePagefind();
			if (token !== requestId) return;
			if (probe.state === 'missing' && import.meta.env.DEV) {
				if (!loggedFallback) {
					console.info('[catatan-solusi] Indeks Pagefind belum ada', probe);
					loggedFallback = true;
				}
				renderResults(await searchDevFallback(normalized, os), normalized);
				return;
			}
			if (probe.state !== 'ready') {
				showFailure(probe);
				return;
			}
			const pagefind = await loadPagefind();
			if (token !== requestId) return;
			const filters = pagefindFilters(os);
			const search = await pagefind.debouncedSearch(normalized, filters ? { filters } : {}, debounceMs);
			if (search === null || token !== requestId) return;
			const data = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));
			if (token !== requestId) return;
			renderResults(
				data.filter((item) => metaValue(item.meta, 'kind') !== 'overview' && metaValue(item.meta, 'kind') !== 'category'),
				normalized,
			);
		} catch (error) {
			if (token !== requestId) return;
			showFailure(indexProbe ?? { state: 'network', status: 0, url: pagefindUrl() }, error);
		}
	};

	const clearQuery = () => {
		requestId += 1;
		input.value = '';
		showEmpty();
		input.focus();
	};

	const openDialog = (trigger: HTMLElement | null) => {
		if (dialog.open) return;
		lastTrigger = trigger;
		dialog.showModal();
		input.focus();
		syncClear();
		if (input.value.trim().length > 0) void runQuery(input.value);
		else showEmpty();
	};

	const closeDialog = () => {
		if (!dialog.open) return;
		dialog.close();
	};

	dialog.addEventListener('close', () => {
		input.setAttribute('aria-expanded', 'false');
		const trigger = lastTrigger;
		if (trigger && trigger.isConnected) trigger.focus();
	});

	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) closeDialog();
	});

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('[data-search-open]')) {
			event.preventDefault();
			openDialog(target.closest<HTMLElement>('[data-search-open]'));
			return;
		}
		if (target.closest('[data-search-close]')) closeDialog();
		if (target.closest('[data-search-clear]')) {
			event.preventDefault();
			clearQuery();
			return;
		}
		if (target.closest('[data-search-retry]')) {
			event.preventDefault();
			pagefindPromise = null;
			indexProbe = null;
			void runQuery(input.value);
		}
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		openSelected();
	});

	input.addEventListener('input', () => {
		void runQuery(input.value);
	});

	window.addEventListener('keydown', (event) => {
		if (event.isComposing || event.key === 'Process') return;
		if (event.repeat) return;
		const key = event.key.toLowerCase();
		if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && key === 'k') {
			event.preventDefault();
			if (dialog.open) closeDialog();
			else openDialog(document.activeElement instanceof HTMLElement ? document.activeElement : null);
			return;
		}
		if (!dialog.open) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			const options = [...results.querySelectorAll<HTMLElement>('[role="option"]')];
			if (options.length === 0) return;
			event.preventDefault();
			const current = selectedResult();
			const index = current ? options.indexOf(current) : -1;
			const next = event.key === 'ArrowDown' ? Math.min(index + 1, options.length - 1) : Math.max(index - 1, 0);
			selectResult(options[next] ?? options[0]);
		}
	});
}
