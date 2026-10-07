import { expect, test } from '@playwright/test';

test('pencarian development memakai konten publik tanpa indeks Pagefind', async ({ page }) => {
	const missing = await page.request.get('/pagefind/pagefind.js');
	expect(missing.status(), 'astro dev tidak menyalin indeks Pagefind').toBe(404);

	await page.goto('/dashboard/?platform=all');
	await page.waitForFunction(() => document.documentElement.dataset.searchReady === 'true');
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	await expect(dialog).toBeVisible();
	const input = page.locator('#site-search-input');
	await input.fill('AppImage tidak muncul di panel');
	await expect(page.getByRole('option').filter({ hasText: 'Pen AppImage' })).toBeVisible();
	await expect(dialog).not.toContainText('build produksi');
	await expect(dialog.getByRole('button', { name: 'Coba lagi' })).toBeHidden();

	await input.fill('TOKEN-DRAFT-7K2M');
	await expect(page.locator('#search-status')).toContainText('Tidak ditemukan hasil');
	await expect(page.getByRole('option')).toHaveCount(0);
	await expect(dialog).not.toContainText('catatan-internal-draf');
});
