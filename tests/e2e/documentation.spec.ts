import { expect, test } from '@playwright/test';

test('beranda menghitung artikel publik dan menyembunyikan draf', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	const count = page.locator('[data-os-count="all"][data-article-count]');
	await expect(count).toBeVisible();
	const value = await count.getAttribute('data-article-count');
	await expect(count).toHaveText(value ?? '');
	await expect(page.getByText('TOKEN-DRAFT-7K2M')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Catatan internal yang belum siap' })).toHaveCount(0);
	await expect(page.locator('[data-os-count="all"][data-category-count]')).not.toHaveText('0');
});

test('filter platform dan status bertahan setelah reload', async ({ page }) => {
	await page.goto('/sistem-operasi/?platform=linux&status=unverified');
	await expect(page.locator('[data-filter="platform"]')).toHaveValue('linux');
	await expect(page.locator('[data-filter="status"]')).toHaveValue('unverified');
	await expect(page.locator('.article-list').getByRole('link', { name: 'Mengatasi pesan Permission denied pada berkas milik pengguna' })).toBeVisible();
	await page.reload();
	await expect(page.locator('[data-filter="platform"]')).toHaveValue('linux');
	await expect(page.locator('.article-list').getByRole('link', { name: 'Mengatasi pesan Permission denied pada berkas milik pengguna' })).toBeVisible();

	await page.locator('[data-filter="platform"]').selectOption('windows');
	await expect(page).toHaveURL(/platform=windows/);
	await expect(page.getByRole('heading', { name: 'Tidak ada artikel untuk filter ini' })).toBeVisible();
	await page.reload();
	await expect(page.locator('[data-filter="platform"]')).toHaveValue('windows');
});

test('menyalin kode persis dan melaporkan kegagalan clipboard', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	const frame = page.locator('.expressive-code').filter({ hasText: 'Exec=/home/pengguna/Applications/Pen.AppImage' });
	await frame.getByRole('button', { name: 'Salin kode' }).click();
	await expect(page.locator('#copy-status')).toHaveText('Kode berhasil disalin');
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain('Exec=/home/pengguna/Applications/Pen.AppImage');
	expect(copied).not.toMatch(/^\s*\d+\s*\|/m);

	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: () => Promise.reject(new Error('ditolak')) },
		});
		document.execCommand = () => false;
	});
	await page.reload();
	await page.getByRole('button', { name: 'Salin kode' }).first().click();
	await expect(page.locator('#copy-status')).toHaveText('Gagal menyalin. Pilih dan salin kode secara manual.');
});

test('draf tidak tersedia lewat URL publik', async ({ page }) => {
	const response = await page.goto('/sistem-operasi/catatan-internal-draf/');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeVisible();
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	await page.locator('#site-search-input').fill('TOKEN-DRAFT-7K2M');
	await expect(page.locator('#search-results a[href*="catatan-internal-draf"]')).toHaveCount(0);
	await expect(page.getByRole('option', { name: /Catatan internal/ })).toHaveCount(0);
});

test('mobile 360 px tidak menggeser halaman dan dialog pencarian muat', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(1);
	await page.getByRole('button', { name: 'Menu' }).click();
	await expect(page.getByRole('link', { name: 'Beranda' })).toBeVisible();
	await page.locator('.search-icon-button').click();
	await expect(page.getByRole('dialog', { name: 'Cari dokumentasi' })).toBeVisible();
	const dialogOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(dialogOverflow).toBeLessThanOrEqual(1);
});
