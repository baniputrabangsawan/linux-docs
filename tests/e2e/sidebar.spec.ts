import { expect, test } from '@playwright/test';

test('sidebar memakai label pendek dan membedakan artikel aktif', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Menambahkan Pen AppImage ke Panel Linux Mint',
	);
	const article = page.locator('.nav-article[aria-current="page"]');
	await expect(article).toHaveText('Pen AppImage di panel');
	await expect(article).toHaveAttribute('data-full-title', 'Menambahkan Pen AppImage ke Panel Linux Mint');
	const category = page.locator('.nav-category', { hasText: 'Desktop & Tampilan' });
	await expect(category).not.toHaveAttribute('aria-current', 'page');
	await expect(page.locator('#nav-articles-desktop-tampilan')).toBeVisible();
	await expect(page.locator('#nav-articles-jaringan')).toBeHidden();
	await expect(page.locator('.search-label-full')).toBeVisible();
	await expect(page.locator('.search-label-full')).toHaveText('Cari dokumentasi');
	await expect(page.locator('.search-label-short')).toBeHidden();

	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
	const sidebarWidth = await page.locator('#starlight__sidebar').evaluate((element) => element.getBoundingClientRect().width);
	expect(sidebarWidth).toBeGreaterThanOrEqual(270);
	expect(sidebarWidth).toBeLessThanOrEqual(290);
});

test('kategori dapat dibuka dengan keyboard tanpa menutup kategori lain', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	const desktopToggle = page.locator('[aria-controls="nav-articles-desktop-tampilan"]');
	const networkToggle = page.locator('[aria-controls="nav-articles-jaringan"]');
	await networkToggle.focus();
	await page.keyboard.press('Enter');
	await expect(networkToggle).toHaveAttribute('aria-expanded', 'true');
	await expect(page.locator('#nav-articles-jaringan')).toBeVisible();
	await expect(desktopToggle).toHaveAttribute('aria-expanded', 'true');
	await page.keyboard.press('ArrowUp');
	await expect(desktopToggle).toBeFocused();
	await page.keyboard.press('Space');
	await expect(desktopToggle).toHaveAttribute('aria-expanded', 'false');
	await expect(networkToggle).toHaveAttribute('aria-expanded', 'true');
});

test('tooltip judul lengkap muncul saat fokus keyboard', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/sistem-operasi/izin-berkas-ditolak/');
	const link = page.locator('.nav-article[aria-current="page"]');
	await link.focus();
	const tooltip = page.locator('#nav-tooltip');
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toHaveText('Mengatasi pesan Permission denied pada berkas milik pengguna');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Mengatasi pesan Permission denied pada berkas milik pengguna',
	);
});

test('drawer mobile menutup dengan Esc dan mengembalikan fokus', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/dashboard/?platform=all');
	const menu = page.getByRole('button', { name: 'Menu' });
	await menu.click();
	await expect(page.getByRole('button', { name: 'Buka artikel Jaringan' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).toBeFocused();
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
});
