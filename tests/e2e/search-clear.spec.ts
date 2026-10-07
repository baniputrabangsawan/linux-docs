import { expect, test } from '@playwright/test';

test('tombol hapus mengosongkan kueri tanpa menutup dialog', async ({ page }) => {
	await page.goto('/dashboard/?platform=all');
	await page.keyboard.press('Control+k');
	const dialog = page.getByRole('dialog', { name: 'Cari dokumentasi' });
	const input = page.locator('#site-search-input');
	const clear = dialog.getByRole('button', { name: 'Hapus pencarian' });
	await expect(clear).toBeHidden();
	await input.fill('AppImage');
	await expect(clear).toBeVisible();
	await expect(page.getByRole('option').filter({ hasText: 'Pen AppImage' })).toBeVisible();
	await clear.click();
	await expect(input).toHaveValue('');
	await expect(input).toBeFocused();
	await expect(dialog).toBeVisible();
	await expect(page.locator('#search-status')).toHaveText('Cari solusi berdasarkan judul atau pesan error');
	await expect(clear).toBeHidden();
	await expect(dialog.getByRole('button', { name: 'Tutup pencarian' })).toBeVisible();
});
