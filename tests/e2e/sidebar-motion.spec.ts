import { expect, test, type Page } from '@playwright/test';


async function clipState(page: Page, id: string) {
	return page.evaluate((panelId) => {
		const panel = document.getElementById(panelId);
		const clip = panel?.closest<HTMLElement>('[data-nav-clip]');
		const button = document.querySelector<HTMLButtonElement>(`[aria-controls="${panelId}"]`);
		const group = button?.closest('.nav-group');
		const next = group?.nextElementSibling;
		return {
			open: clip?.dataset.open ?? null,
			hidden: clip?.hidden ?? null,
			inert: panel?.inert ?? null,
			expanded: button?.getAttribute('aria-expanded') ?? null,
			height: clip?.getBoundingClientRect().height ?? 0,
			contentHeight: panel?.getBoundingClientRect().height ?? 0,
			maxHeight: clip ? getComputedStyle(clip).maxHeight : null,
			gapBelow: group && next ? next.getBoundingClientRect().top - group.getBoundingClientRect().bottom : null,
			running: clip?.getAnimations().filter((animation) => animation.playState === 'running').length ?? 0,
		};
	}, id);
}

test('kategori aktif terbuka tanpa animasi dan submenu tertutup tidak dapat difokuskan', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	const active = await clipState(page, 'nav-articles-desktop-tampilan');
	expect(active.open).toBe('true');
	expect(active.hidden).toBe(false);
	expect(active.inert).toBe(false);
	expect(active.running).toBe(0);
	expect(active.height).toBeGreaterThan(24);
	expect(active.maxHeight).toBe('none');

	const closed = await clipState(page, 'nav-articles-jaringan');
	expect(closed.open).toBe('false');
	expect(closed.hidden).toBe(true);
	expect(closed.inert).toBe(true);
	expect(closed.height).toBe(0);
	const focusedInside = await page.evaluate(() => {
		const link = document.querySelector<HTMLAnchorElement>('#nav-articles-jaringan a');
		link?.focus();
		return document.activeElement === link;
	});
	expect(focusedInside).toBe(false);
});

test('submenu mengikuti tinggi konten dan kategori di bawahnya bergerak', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/dashboard/?platform=all');
	const motion = await page.evaluate(async () => {
		const button = document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-jaringan"]');
		const panel = document.getElementById('nav-articles-jaringan');
		const clip = panel?.closest<HTMLElement>('[data-nav-clip]');
		const next = button?.closest('.nav-group')?.nextElementSibling;
		if (!button || !clip || !panel || !next) return null;
		button.click();
		const heightAnim = clip
			.getAnimations()
			.find((animation) => 'transitionProperty' in animation && animation.transitionProperty === 'grid-template-rows');
		const chevron = button.querySelector('svg')?.getAnimations().find((animation) => {
			return 'transitionProperty' in animation && animation.transitionProperty === 'transform';
		});
		const samples: Array<{ height: number; below: number }> = [];
		const start = performance.now();
		const { promise, resolve } = Promise.withResolvers<void>();
		const frame = () => {
			samples.push({
				height: clip.getBoundingClientRect().height,
				below: next.getBoundingClientRect().top,
			});
			if (performance.now() - start < 280) requestAnimationFrame(frame);
			else resolve();
		};
		requestAnimationFrame(frame);
		await promise;
		return {
			samples,
			contentHeight: panel.getBoundingClientRect().height,
			heightDuration: heightAnim?.effect?.getComputedTiming().duration ?? null,
			heightEasing: heightAnim?.effect?.getComputedTiming().easing ?? null,
			chevronDuration: chevron?.effect?.getComputedTiming().duration ?? null,
			chevronEasing: chevron?.effect?.getComputedTiming().easing ?? null,
		};
	});
	expect(motion).not.toBeNull();
	expect(motion!.heightDuration).toBe(220);
	expect(motion!.heightEasing).toBe('cubic-bezier(0.2, 0, 0, 1)');
	expect(motion!.chevronDuration).toBe(180);
	expect(motion!.chevronEasing).toBe('cubic-bezier(0.2, 0, 0, 1)');
	const heights = motion!.samples.map((sample) => sample.height);
	expect(heights[0]).toBeLessThan(8);
	expect(heights.at(-1)!).toBeGreaterThan(heights[0] + 16);
	expect(heights.some((height) => height > heights[0] + 4 && height < heights.at(-1)! - 2)).toBe(true);
	const belowDelta = motion!.samples.at(-1)!.below - motion!.samples[0].below;
	const heightDelta = heights.at(-1)! - heights[0];
	expect(Math.abs(belowDelta - heightDelta)).toBeLessThan(2);

	const shortHeight = (await clipState(page, 'nav-articles-jaringan')).height;
	await page.evaluate(() => {
		const panel = document.getElementById('nav-articles-jaringan');
		const item = panel?.querySelector('li');
		if (!panel || !item) return;
		for (let index = 0; index < 5; index += 1) {
			const clone = item.cloneNode(true) as HTMLElement;
			const link = clone.querySelector('a');
			if (link) {
				link.textContent = `Artikel tambahan ${index}`;
				link.removeAttribute('href');
			}
			panel.append(clone);
		}
		panel.style.fontSize = '22px';
	});
	const grown = await clipState(page, 'nav-articles-jaringan');
	expect(grown.height).toBeGreaterThan(shortHeight + 40);
	expect(grown.maxHeight).toBe('none');
	expect(Math.abs(grown.height - grown.contentHeight)).toBeLessThan(2);
});

test('penutupan, klik cepat, dan beberapa kategori tetap sinkron', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/dashboard/?platform=all');
	await page.evaluate(() => {
		document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-jaringan"]')?.click();
		document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-aplikasi"]')?.click();
	});
	await expect.poll(() => clipState(page, 'nav-articles-jaringan').then((state) => state.open)).toBe('true');
	await expect.poll(() => clipState(page, 'nav-articles-aplikasi').then((state) => state.height)).toBeGreaterThan(20);

	const closing = await page.evaluate(async () => {
		const button = document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-jaringan"]');
		const clip = document.getElementById('nav-articles-jaringan')?.closest<HTMLElement>('[data-nav-clip]');
		if (!button || !clip) return null;
		const before = clip.getBoundingClientRect().height;
		button.click();
		const samples: number[] = [];
		const start = performance.now();
		const { promise, resolve } = Promise.withResolvers<void>();
		const frame = () => {
			samples.push(clip.getBoundingClientRect().height);
			if (performance.now() - start < 180) requestAnimationFrame(frame);
			else resolve();
		};
		requestAnimationFrame(frame);
		await promise;
		return {
			before,
			samples,
			expanded: button.getAttribute('aria-expanded'),
			inert: document.getElementById('nav-articles-jaringan')?.inert ?? null,
			hiddenDuring: clip.hidden,
		};
	});
	expect(closing).not.toBeNull();
	expect(closing!.expanded).toBe('false');
	expect(closing!.inert).toBe(true);
	expect(closing!.hiddenDuring).toBe(false);
	expect(closing!.samples[0]).toBeGreaterThan(8);
	expect(closing!.samples.at(-1)!).toBeLessThan(closing!.before - 4);
	expect((await clipState(page, 'nav-articles-aplikasi')).open).toBe('true');
	await expect.poll(() => clipState(page, 'nav-articles-jaringan').then((state) => state.hidden)).toBe(true);
	const settled = await clipState(page, 'nav-articles-jaringan');
	expect(settled.height).toBe(0);
	expect(settled.hidden).toBe(true);
	const gap = await page.evaluate(() => {
		const group = document.querySelector('[aria-controls="nav-articles-jaringan"]')?.closest('.nav-group');
		const parent = group?.parentElement;
		const next = group?.nextElementSibling;
		if (!group || !parent || !next) return null;
		return {
			actual: next.getBoundingClientRect().top - group.getBoundingClientRect().bottom,
			expected: Number.parseFloat(getComputedStyle(parent).rowGap),
		};
	});
	expect(gap).not.toBeNull();
	expect(Math.abs(gap!.actual - gap!.expected)).toBeLessThan(1);

	const rapid = await page.evaluate(async () => {
		const button = document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-perangkat-keras"]');
		const clip = document.getElementById('nav-articles-perangkat-keras')?.closest<HTMLElement>('[data-nav-clip]');
		if (!button || !clip) return null;
		for (let index = 0; index < 6; index += 1) {
			button.click();
			const { promise, resolve } = Promise.withResolvers<void>();
			setTimeout(resolve, 35);
			await promise;
		}
		return {
			expanded: button.getAttribute('aria-expanded'),
			open: clip.dataset.open ?? null,
		};
	});
	expect(rapid?.expanded).toBe('false');
	expect(rapid?.open).toBe('false');
	await expect.poll(() => clipState(page, 'nav-articles-perangkat-keras').then((state) => state.hidden)).toBe(true);
	const afterRapid = await clipState(page, 'nav-articles-perangkat-keras');
	expect(afterRapid.height).toBe(0);
	expect(afterRapid.inert).toBe(true);
	expect((await clipState(page, 'nav-articles-aplikasi')).open).toBe('true');
});

test('drawer mobile dan reduced motion tidak menyisakan ruang', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/dashboard/?platform=all');
	await page.getByRole('button', { name: 'Menu' }).click();
	await page.evaluate(() => {
		document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-jaringan"]')?.click();
	});
	await expect.poll(() => clipState(page, 'nav-articles-jaringan').then((state) => state.height)).toBeGreaterThan(20);
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/dashboard/?platform=all');
	const reduced = await page.evaluate(() => {
		const button = document.querySelector<HTMLButtonElement>('[aria-controls="nav-articles-aplikasi"]');
		const clip = document.getElementById('nav-articles-aplikasi')?.closest<HTMLElement>('[data-nav-clip]');
		const panel = document.getElementById('nav-articles-aplikasi');
		const svg = button?.querySelector('svg');
		if (!button || !clip || !panel || !svg) return null;
		const started = performance.now();
		button.click();
		return {
			elapsed: performance.now() - started,
			height: clip.getBoundingClientRect().height,
			contentHeight: panel.getBoundingClientRect().height,
			running: clip.getAnimations().filter((animation) => animation.playState === 'running').length,
			shift: getComputedStyle(panel).transform,
			chevron: getComputedStyle(svg).transform,
		};
	});
	expect(reduced).not.toBeNull();
	expect(reduced!.elapsed).toBeLessThan(50);
	expect(reduced!.running).toBe(0);
	expect(reduced!.height).toBeGreaterThan(20);
	expect(Math.abs(reduced!.height - reduced!.contentHeight)).toBeLessThan(2);
	expect(reduced!.shift === 'none' || reduced!.shift === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
	expect(reduced!.chevron === 'none' || reduced!.chevron === 'matrix(0, 1, -1, 0, 0, 0)').toBe(true);
});

test('kategori pemicu tidak naik saat submenu membuka ke bawah', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 620 });
	await page.goto('/dashboard/?platform=all');
	const result = await page.evaluate(async () => {
		const scroller = document.getElementById('starlight__sidebar');
		if (!scroller) return null;
		const sample = async (id: string) => {
			const button = document.querySelector<HTMLButtonElement>(`[aria-controls="${id}"]`);
			const panel = document.getElementById(id);
			const clip = panel?.closest<HTMLElement>('[data-nav-clip]');
			const head = button?.closest('.nav-group-head');
			const next = button?.closest('.nav-group')?.nextElementSibling;
			if (!button || !clip || !head || !panel) return null;
			const triggerBefore = button.getBoundingClientRect().top;
			const scrollBefore = scroller.scrollTop;
			const headBottom = head.getBoundingClientRect().bottom;
			button.click();
			const samples: Array<{ trigger: number; scroll: number; clipTop: number; clipHeight: number; nextTop: number | null }> = [];
			const start = performance.now();
			const { promise, resolve } = Promise.withResolvers<void>();
			const frame = () => {
				samples.push({
					trigger: button.getBoundingClientRect().top,
					scroll: scroller.scrollTop,
					clipTop: clip.getBoundingClientRect().top,
					clipHeight: clip.getBoundingClientRect().height,
					nextTop: next instanceof HTMLElement ? next.getBoundingClientRect().top : null,
				});
				if (performance.now() - start < 260) requestAnimationFrame(frame);
				else resolve();
			};
			requestAnimationFrame(frame);
			await promise;
			return {
				triggerBefore,
				scrollBefore,
				headBottom,
				samples,
				transform: getComputedStyle(panel).transform,
			};
		};
		const top = await sample('nav-articles-sistem-operasi');
		scroller.scrollTop = 90;
		const middle = await sample('nav-articles-jaringan');
		scroller.scrollTop = scroller.scrollHeight;
		const bottom = await sample('nav-articles-referensi-perintah');
		return {
			top,
			middle,
			bottom,
			canScroll: scroller.scrollHeight > scroller.clientHeight + 8,
		};
	});
	expect(result).not.toBeNull();
	expect(result!.canScroll).toBe(true);
	for (const run of [result!.top, result!.middle, result!.bottom]) {
		expect(run).not.toBeNull();
		expect(run!.transform).toBe('none');
		expect(run!.samples.length).toBeGreaterThan(3);
		for (const sample of run!.samples) {
			expect(Math.abs(sample.trigger - run!.triggerBefore)).toBeLessThan(1.5);
			expect(Math.abs(sample.scroll - run!.scrollBefore)).toBeLessThan(1.5);
			expect(Math.abs(sample.clipTop - run!.headBottom)).toBeLessThan(2);
		}
		expect(run!.samples.at(-1)!.clipHeight).toBeGreaterThan(run!.samples[0].clipHeight + 8);
		const nextTops = run!.samples.map((sample) => sample.nextTop).filter((value): value is number => value !== null);
		if (nextTops.length > 1) expect(nextTops.at(-1)!).toBeGreaterThan(nextTops[0] + 8);
	}
});

