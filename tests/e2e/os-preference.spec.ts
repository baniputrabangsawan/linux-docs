import { expect, test } from '@playwright/test';

const storageKey = 'catatan-solusi:platform:v1';

test('kunjungan pertama menampilkan pemilihan tanpa memilih otomatis', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
		Object.defineProperty(navigator, 'userAgent', {
			get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
		});
	});
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Linux/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /Windows/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /macOS/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /Semua platform/ })).toBeVisible();
	await expect(page.locator('.site-sidebar')).toHaveCount(0);
	await expect(page).toHaveURL(/\/$/);
});

test('kartu memilih platform, kunjungan ulang masuk dashboard, dan Back tidak berputar', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: /Linux/ }).click();
	await expect(page).toHaveURL(/\/dashboard\/\?platform=linux/);
	await expect(page.getByText('Platform aktif:')).toBeVisible();
	await expect(page.locator('.os-name[data-os-name="linux"]')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Menambahkan Pen AppImage ke Panel Linux Mint' })).toBeVisible();
	await expect(page.locator('[data-os-count="linux"][data-article-count]')).toBeVisible();
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('linux');

	await page.goBack();
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();
	await page.waitForTimeout(250);
	await expect(page).toHaveURL(/\/$/);

	await page.goto('/');
	await expect(page).toHaveURL(/\/dashboard\//);
	await expect(page.locator('.os-name[data-os-name="linux"]')).toBeVisible();
});

test('ganti sistem operasi memperbarui preferensi tanpa redirect loop', async ({ page }) => {
	await page.goto('/dashboard/?platform=linux');
	await page.getByRole('link', { name: 'Ganti sistem operasi' }).click();
	await expect(page).toHaveURL(/change=1/);
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();
	await page.waitForTimeout(250);
	await expect(page).toHaveURL(/change=1/);

	await page.getByRole('link', { name: /Windows/ }).click();
	await expect(page).toHaveURL(/platform=windows/);
	await expect(page.locator('.os-name[data-os-name="windows"]')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Menambahkan Pen AppImage ke Panel Linux Mint' })).toHaveCount(0);
	await expect(page.getByRole('main').getByRole('link', { name: 'npm gagal dengan EACCES saat memasang paket global' })).toBeVisible();
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('windows');

	await page.goBack();
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();
});

test('query valid mengalahkan storage dan nilai tidak valid diabaikan', async ({ page }) => {
	await page.addInitScript((key) => {
		localStorage.setItem(key, 'android');
	}, storageKey);
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();

	await page.goto('/dashboard/?platform=macos');
	await expect(page.locator('.os-name[data-os-name="macos"]')).toBeVisible();
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('macos');
});

test('dashboard tanpa preferensi kembali ke pemilihan', async ({ page }) => {
	await page.goto('/dashboard/');
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('heading', { name: 'Pilih sistem operasi' })).toBeVisible();
});

test('storage diblokir tidak membuat halaman crash dan query tetap bekerja', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('blocked');
			},
		});
		Object.defineProperty(window, 'sessionStorage', {
			get() {
				throw new Error('blocked');
			},
		});
	});
	await page.goto('/');
	await page.getByRole('link', { name: /macOS/ }).click();
	await expect(page).toHaveURL(/\/dashboard\/\?platform=macos/);
	await expect(page.getByRole('heading', { name: 'Dokumentasi penyelesaian masalah' })).toBeVisible();
});

test('artikel langsung tetap terbuka dan pencarian Windows menyaring AppImage', async ({ page }) => {
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
	await expect(page.getByRole('heading', { name: 'Menambahkan Pen AppImage ke Panel Linux Mint' })).toBeVisible();
	await expect(page.getByText('Linux', { exact: true }).first()).toBeVisible();

	await page.goto('/dashboard/?platform=windows');
	await page.keyboard.press('Control+k');
	await page.locator('#site-search-input').fill('AppImage');
	await expect(page.locator('#search-status')).toHaveText('Tidak ditemukan hasil untuk ‘AppImage’');
	await page.locator('#site-search-input').fill('EACCES');
	await expect(page.getByRole('option').filter({ hasText: 'EACCES' })).toBeVisible();
});

test('kategori tanpa artikel untuk platform terpilih menampilkan keadaan kosong', async ({ page }) => {
	await page.goto('/sistem-operasi/?platform=windows');
	await expect(page.getByRole('heading', { name: 'Tidak ada artikel untuk filter ini' })).toBeVisible();
	await expect(page.locator('#nav-articles-sistem-operasi')).toBeHidden();
});

test('pemilihan dapat diaktifkan dengan keyboard dan muat di mobile', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/');
	const card = page.getByRole('link', { name: /Semua platform/ });
	await card.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/platform=all/);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(1);
});
