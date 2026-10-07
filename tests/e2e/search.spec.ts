import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});

test('Ctrl+K dan Meta+K membuka satu dialog lalu Esc mengembalikan fokus', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	const trigger = page.locator('.search-trigger');
	await trigger.focus();
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	await expect(dialog).toBeVisible();
	await expect(page.getByRole('dialog')).toHaveCount(1);
	await expect(page.locator('#site-search-input')).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();

	await page.keyboard.press('Meta+k');
	await expect(dialog).toBeVisible();
	await expect(page.getByRole('dialog')).toHaveCount(1);
});

test('menemukan artikel dari pesan error dan menavigasi dengan keyboard', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	const input = page.locator('#site-search-input');
	await input.fill('AppImage tidak muncul di panel');
	const result = page.getByRole('option').filter({ hasText: 'Pen AppImage' });
	await expect(result).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/desktop-tampilan\/pen-appimage-panel\/?/);
});

test('input kosong menampilkan kategori tanpa tombol coba lagi', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	await expect(dialog.getByRole('heading', { name: 'Cari dokumentasi' })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Tutup pencarian' })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Tutup', exact: true })).toHaveCount(0);
	await expect(page.locator('#search-status')).toHaveText('Cari solusi berdasarkan judul atau pesan error');
	await expect(dialog.getByRole('link', { name: 'Sistem Operasi' })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Coba lagi' })).toBeHidden();
});

test('menampilkan keadaan gagal lalu memuat ulang indeks', async ({ page }) => {
	let fail = true;
	await page.route('**/pagefind/**', (route) => (fail ? route.abort() : route.continue()));
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	await page.locator('#site-search-input').fill('AppImage');
	await expect(page.locator('#search-status')).toHaveText('Pencarian belum dapat dimuat');
	await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Jelajahi kategori' })).toBeVisible();
	fail = false;
	await page.getByRole('button', { name: 'Coba lagi' }).click();
	await expect(page.getByRole('option').filter({ hasText: 'Pen AppImage' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeHidden();
});

test('menampilkan keadaan kosong', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	await page.locator('#site-search-input').fill('zzzz-tidak-ada-hasil-9f');
	await expect(page.locator('#search-status')).toHaveText('Tidak ditemukan hasil untuk ‘zzzz-tidak-ada-hasil-9f’');
	await expect(page.getByRole('dialog').getByRole('link', { name: 'Jaringan' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeHidden();
});

test('badge macOS memakai ⌘ dan pengetikan biasa tidak membuka dialog', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
	});
	await page.goto('/dashboard/?platform=all');
	await expect(page.locator('.search-trigger [data-search-mod]')).toHaveText('⌘');
	await page.keyboard.press('k');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('dialog tetap terstruktur dan kueri cepat tidak menampilkan hasil basi', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	const title = dialog.getByRole('heading', { name: 'Cari dokumentasi' });
	const close = dialog.getByRole('button', { name: 'Tutup pencarian' });
	const titleBox = await title.boundingBox();
	const closeBox = await close.boundingBox();
	const dialogBox = await dialog.boundingBox();
	expect(titleBox).not.toBeNull();
	expect(closeBox).not.toBeNull();
	expect(dialogBox).not.toBeNull();
	expect(closeBox!.x).toBeGreaterThan(titleBox!.x);
	expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width);
	expect(dialogBox!.width).toBeLessThanOrEqual(640);
	const visual = await close.locator('.dialog-close-visual').boundingBox();
	expect(visual?.width).toBe(32);
	expect(visual?.height).toBe(32);
	expect(closeBox!.width).toBeGreaterThanOrEqual(44);

	const input = page.locator('#site-search-input');
	await input.fill('zzzz-tidak-ada-hasil-9f');
	await input.fill('AppImage tidak muncul di panel');
	await expect(page.getByRole('option').filter({ hasText: 'Pen AppImage' })).toBeVisible();
	await expect(page.locator('#search-status')).not.toContainText('Tidak ditemukan');
	const headerBox = await dialog.locator('.search-dialog-head').boundingBox();
	const inputBox = await input.boundingBox();
	expect(headerBox!.y).toBeLessThan(inputBox!.y);
});

test('dialog mobile tetap di dalam viewport', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 700 });
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	await expect(dialog.getByRole('button', { name: 'Coba lagi' })).toBeHidden();
	const box = await dialog.boundingBox();
	expect(box).not.toBeNull();
	expect(box!.x).toBeGreaterThanOrEqual(12);
	expect(box!.x + box!.width).toBeLessThanOrEqual(348);
	expect(box!.y + box!.height).toBeLessThanOrEqual(700);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(1);
});
