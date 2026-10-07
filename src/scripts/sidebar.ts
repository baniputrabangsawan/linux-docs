function panelFor(button: HTMLButtonElement): HTMLElement | null {
	const id = button.getAttribute('aria-controls');
	return id ? document.getElementById(id) : null;
}

const closeGuards = new WeakMap<HTMLElement, () => void>();

function motionReduced(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearClose(clip: HTMLElement): void {
	closeGuards.get(clip)?.();
	closeGuards.delete(clip);
}

function finishClose(clip: HTMLElement): void {
	if (clip.dataset.open === 'false') clip.hidden = true;
}

function scheduleClose(clip: HTMLElement): void {
	clearClose(clip);
	const onEnd = (event: TransitionEvent) => {
		if (event.target !== clip || event.propertyName !== 'grid-template-rows') return;
		cleanup();
		finishClose(clip);
	};
	const timer = window.setTimeout(() => {
		cleanup();
		finishClose(clip);
	}, 400);
	const cleanup = () => {
		clip.removeEventListener('transitionend', onEnd);
		window.clearTimeout(timer);
		closeGuards.delete(clip);
	};
	closeGuards.set(clip, cleanup);
	clip.addEventListener('transitionend', onEnd);
}

function setExpanded(button: HTMLButtonElement, open: boolean): void {
	button.setAttribute('aria-expanded', open ? 'true' : 'false');
	const panel = panelFor(button);
	const clip = panel?.closest<HTMLElement>('[data-nav-clip]') ?? null;
	const label = button.dataset.categoryLabel ?? 'kategori';
	button.setAttribute('aria-label', open ? `Tutup artikel ${label}` : `Buka artikel ${label}`);
	if (!panel || !clip) return;
	clearClose(clip);
	if (open) {
		panel.inert = false;
		const wasHidden = clip.hidden;
		clip.hidden = false;
		if (motionReduced()) {
			clip.dataset.open = 'true';
			return;
		}
		if (wasHidden) {
			clip.dataset.open = 'false';
			void clip.offsetHeight;
		}
		clip.dataset.open = 'true';
		return;
	}
	panel.inert = true;
	clip.dataset.open = 'false';
	if (motionReduced() || clip.hidden) {
		clip.hidden = true;
		return;
	}
	scheduleClose(clip);
}

function toggles(): HTMLButtonElement[] {
	return [...document.querySelectorAll<HTMLButtonElement>('[data-nav-toggle]')];
}

function ensureTooltip(): HTMLElement {
	let tooltip = document.getElementById('nav-tooltip');
	if (!tooltip) {
		tooltip = document.createElement('div');
		tooltip.id = 'nav-tooltip';
		tooltip.className = 'nav-tooltip';
		tooltip.setAttribute('role', 'tooltip');
		tooltip.hidden = true;
		document.body.append(tooltip);
	}
	return tooltip;
}

function hideTooltip(tooltip: HTMLElement): void {
	tooltip.hidden = true;
	tooltip.textContent = '';
	document.querySelectorAll<HTMLAnchorElement>('.nav-article[aria-describedby="nav-tooltip"]').forEach((link) => {
		link.removeAttribute('aria-describedby');
	});
}

function showTooltip(link: HTMLAnchorElement, tooltip: HTMLElement): void {
	const full = link.dataset.fullTitle ?? link.textContent?.trim() ?? '';
	const label = link.querySelector<HTMLElement>('.nav-article-label');
	const visible = label?.textContent?.trim() ?? '';
	const truncated = label
		? label.scrollHeight > label.clientHeight + 1 || label.scrollWidth > label.clientWidth + 1
		: false;
	if (!truncated && visible === full) {
		hideTooltip(tooltip);
		return;
	}
	tooltip.textContent = full;
	tooltip.hidden = false;
	link.setAttribute('aria-describedby', 'nav-tooltip');
	const rect = link.getBoundingClientRect();
	const tipRect = tooltip.getBoundingClientRect();
	let top = rect.bottom + 6;
	const left = Math.min(Math.max(8, rect.left), window.innerWidth - tipRect.width - 8);
	if (top + tipRect.height > window.innerHeight - 8) top = Math.max(8, rect.top - tipRect.height - 6);
	tooltip.style.top = `${top}px`;
	tooltip.style.left = `${left}px`;
}

function initDrawerFocus(): void {
	const pane = document.getElementById('starlight__sidebar');
	const menuButton = document.querySelector<HTMLButtonElement>('.sl-menu-button');
	if (!pane || !menuButton || pane.dataset.drawerFocusReady === 'true') return;
	pane.dataset.drawerFocusReady = 'true';
	pane.addEventListener('toggle', (event) => {
		if (!window.matchMedia('(max-width: 49.99rem)').matches) return;
		if ((event as ToggleEvent).newState !== 'closed') return;
		const active = document.activeElement;
		if (active === menuButton) return;
		if (active === document.body || active === null || pane.contains(active)) menuButton.focus();
	});
}

export function initSidebar(): void {
	const root = document.querySelector<HTMLElement>('[data-site-sidebar]');
	if (!root || root.dataset.sidebarReady === 'true') return;
	root.dataset.sidebarReady = 'true';
	const tooltip = ensureTooltip();

	root.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const button = target.closest<HTMLButtonElement>('[data-nav-toggle]');
		if (!button || !root.contains(button)) return;
		setExpanded(button, button.getAttribute('aria-expanded') !== 'true');
	});

	root.addEventListener('keydown', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLButtonElement) || !target.matches('[data-nav-toggle]')) return;
		const list = toggles();
		const index = list.indexOf(target);
		if (index < 0) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const next =
				event.key === 'ArrowDown'
					? list[(index + 1) % list.length]
					: list[(index - 1 + list.length) % list.length];
			next?.focus();
		}
		if (event.key === 'Home') {
			event.preventDefault();
			list[0]?.focus();
		}
		if (event.key === 'End') {
			event.preventDefault();
			list[list.length - 1]?.focus();
		}
	});

	root.addEventListener('mouseover', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const link = target.closest<HTMLAnchorElement>('.nav-article');
		if (link) showTooltip(link, tooltip);
	});
	root.addEventListener('mouseout', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const link = target.closest('.nav-article');
		const next = event.relatedTarget;
		if (link && (!(next instanceof Node) || !link.contains(next))) hideTooltip(tooltip);
	});
	root.addEventListener('focusin', (event) => {
		const target = event.target;
		if (target instanceof HTMLAnchorElement && target.classList.contains('nav-article')) {
			target.removeAttribute('title');
			showTooltip(target, tooltip);
		}
	});
	root.addEventListener('focusout', (event) => {
		const target = event.target;
		if (target instanceof HTMLAnchorElement && target.classList.contains('nav-article')) hideTooltip(tooltip);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') hideTooltip(tooltip);
	});
	document.getElementById('starlight__sidebar')?.addEventListener('scroll', () => hideTooltip(tooltip), {
		passive: true,
	});
	initDrawerFocus();
}
