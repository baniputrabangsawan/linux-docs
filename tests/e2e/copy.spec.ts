import { expect, test, type Locator, type Page } from '@playwright/test';

async function box(locator: Locator) {
	const value = await locator.boundingBox();
	expect(value).not.toBeNull();
	return value!;
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function openPen(page: Page) {
	await page.goto('/desktop-tampilan/pen-appimage-panel/');
}

test.beforeEach(async ({ context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});

test('tombol salin ada di header, berukuran 32px, dan tidak menutupi kode', async ({ page }) => {
	await openPen(page);
	const frames = page.locator('.expressive-code .frame');
	const count = await frames.count();
	expect(count).toBeGreaterThan(1);

	for (const frame of await frames.all()) {
		await expect(frame.locator('button')).toHaveCount(1);
		const button = frame.locator('.header .copy button');
		await expect(button).toHaveCount(1);
		await expect(button).toHaveAttribute('type', 'button');
		await expect(button).toHaveAttribute('aria-label', 'Salin kode');
		await expect(button.locator('.copy-icon')).toBeVisible();
		await expect(button.locator('.check-icon')).toBeHidden();

		const header = frame.locator('.header');
		const headerStyle = await header.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				display: style.display,
				alignItems: style.alignItems,
				justifyContent: style.justifyContent,
				borderBottomWidth: style.borderBottomWidth,
			};
		});
		expect(headerStyle).toEqual({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			borderBottomWidth: '1px',
		});

		const buttonStyle = await button.evaluate((element) => getComputedStyle(element).position);
		const copyStyle = await frame.locator('.copy').evaluate((element) => getComputedStyle(element).position);
		expect(buttonStyle).not.toBe('absolute');
		expect(copyStyle).not.toBe('absolute');

		const frameBox = await box(frame);
		const headerBox = await box(header);
		const buttonBox = await box(button);
		const lineBox = await box(frame.locator('.ec-line').first());
		expect(buttonBox.width).toBe(32);
		expect(buttonBox.height).toBe(32);
		expect(buttonBox.x).toBeGreaterThanOrEqual(frameBox.x + 6);
		expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(frameBox.x + frameBox.width - 6);
		expect(buttonBox.y).toBeGreaterThanOrEqual(frameBox.y + 6);
		expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(headerBox.y + headerBox.height);
		expect(overlaps(buttonBox, lineBox)).toBe(false);

		const icon = await box(button.locator('.copy-icon'));
		expect(icon.width).toBeGreaterThanOrEqual(16);
		expect(icon.width).toBeLessThanOrEqual(18);
		expect(icon.height).toBe(icon.width);
	}

	await expect(page.locator('.frame.has-title .title')).toHaveText('pen.desktop');
	await expect(frames.first().locator('.title')).toHaveText('bash');

});

test('label panjang terpotong tanpa mendorong tombol keluar', async ({ page }) => {
	await page.setViewportSize({ width: 480, height: 800 });
	await openPen(page);
	const frame = page.locator('.frame.has-title');
	await frame.locator('.title').evaluate((element) => {
		element.textContent = 'nama-berkas-sangat-panjang-'.repeat(8) + 'pen.desktop';
	});
	const frameBox = await box(frame);
	const titleBox = await box(frame.locator('.title'));
	const buttonBox = await box(frame.locator('button'));
	expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(buttonBox.x + 1);
	expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(frameBox.x + frameBox.width - 6);
	const truncated = await frame.locator('.title').evaluate((element) => element.scrollWidth > element.clientWidth);
	expect(truncated).toBe(true);
});

test('scroll horizontal tidak menggeser header atau tombol', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await openPen(page);
	const frame = page.locator('.expressive-code').filter({ hasText: 'mkdir -p /home/pengguna/.local/share/applications' }).locator('.frame');
	const pre = frame.locator('pre');
	const overflow = await pre.evaluate((element) => element.scrollWidth - element.clientWidth);
	expect(overflow).toBeGreaterThan(8);
	const before = await box(frame.locator('button'));
	await pre.evaluate((element) => {
		element.scrollLeft = element.scrollWidth;
	});
	const after = await box(frame.locator('button'));
	const header = await box(frame.locator('.header'));
	expect(after.x).toBe(before.x);
	expect(after.y).toBe(before.y);
	expect(header.x).toBeLessThanOrEqual(before.x);
	const scrolled = await pre.evaluate((element) => element.scrollLeft);
	expect(scrolled).toBeGreaterThan(8);
});

test('salin menyalin payload asli, menukar ikon, lalu kembali sendiri', async ({ page }) => {
	await page.clock.install();
	await openPen(page);
	const frame = page.locator('.expressive-code').filter({ hasText: '--appimage-extract' });
	const button = frame.locator('.copy button');
	await button.scrollIntoViewIfNeeded();
	await button.evaluate((element) => {
		element.setAttribute('data-code', 'baris\u007f  indent');
	});
	const header = frame.locator('.header');
	const before = await box(button);
	const beforeHeader = await box(header);
	await button.click();
	await page.clock.fastForward(40);
	await expect(button).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await expect(button.locator('.check-icon')).toBeVisible();
	await expect(button.locator('.copy-icon')).toBeHidden();
	await expect(button.locator('.copy-tooltip')).toHaveText('Disalin');
	await expect(button.locator('.copy-tooltip')).toBeVisible();
	await expect(page.locator('#copy-status')).toHaveText('Kode berhasil disalin');
	const color = await button.evaluate((element) => getComputedStyle(element).color);
	expect(color).toBe('rgb(63, 98, 18)');
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toBe('baris\n  indent');
	expect(copied).not.toContain('bash');
	const after = await box(button);
	const afterHeader = await box(header);
	expect(after.width).toBe(before.width);
	expect(after.height).toBe(before.height);
	expect(Math.abs(after.x - afterHeader.x - (before.x - beforeHeader.x))).toBeLessThan(1);
	expect(Math.abs(after.y - afterHeader.y - (before.y - beforeHeader.y))).toBeLessThan(1);
	await expect(button).toBeFocused();

	await page.clock.fastForward(1500);
	await button.click();
	await page.clock.fastForward(1500);
	await expect(button).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await page.clock.fastForward(600);
	await expect(button).toHaveAttribute('aria-label', 'Salin kode');
	await expect(button.locator('.check-icon')).toBeHidden();
	await expect(button.locator('.copy-icon')).toBeVisible();
});

test('beberapa blok punya timer sendiri', async ({ page }) => {
	await page.clock.install();
	await openPen(page);
	const buttons = page.locator('.expressive-code .copy button');
	await expect(buttons).toHaveCount(5);
	await buttons.nth(0).click();
	await expect(buttons.nth(0)).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await page.clock.fastForward(1500);
	await buttons.nth(1).click();
	await expect(buttons.nth(1)).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await page.clock.fastForward(600);
	await expect(buttons.nth(0)).toHaveAttribute('aria-label', 'Salin kode');
	await expect(buttons.nth(1)).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await expect(buttons.nth(2)).toHaveAttribute('aria-label', 'Salin kode');
});

test('keyboard mengaktifkan tombol tanpa memindahkan fokus', async ({ page }) => {
	await openPen(page);
	const copied = page.locator('.expressive-code .copy button').nth(1);
	const other = page.locator('.expressive-code .copy button').nth(2);
	await copied.focus();
	await page.keyboard.press('Enter');
	await expect(copied).toBeFocused();
	await expect(copied).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await other.focus();
	await page.keyboard.press('Space');
	await expect(other).toBeFocused();
	await expect(other).toHaveAttribute('aria-label', 'Kode berhasil disalin');
	await expect(copied).toHaveAttribute('aria-label', 'Kode berhasil disalin');
});

test('kegagalan clipboard tidak menampilkan centang', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: () => Promise.reject(new Error('ditolak')) },
		});
		document.execCommand = () => false;
	});
	await openPen(page);
	const button = page.locator('.expressive-code .copy button').first();
	await button.click();
	await expect(page.locator('#copy-status')).toHaveText('Gagal menyalin. Pilih dan salin kode secara manual.');
	await expect(button).toHaveAttribute('aria-label', 'Salin kode');
	await expect(button.locator('.check-icon')).toBeHidden();
	await expect(button.locator('.copy-icon')).toBeVisible();
	await expect(button.locator('.copy-tooltip')).toHaveText('Gagal menyalin. Pilih dan salin kode secara manual.');
	await expect(button).toBeFocused();
});

test('tombol tetap terlihat dan di dalam blok pada mobile', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await openPen(page);
	const frame = page.locator('.expressive-code .frame').first();
	const button = frame.locator('.header .copy button');
	await button.scrollIntoViewIfNeeded();
	await expect(button).toBeVisible();
	const opacity = await button.evaluate((element) => getComputedStyle(element).opacity);
	expect(opacity).toBe('1');
	const frameBox = await box(frame);
	const visual = await box(button.locator('.copy-visual'));
	const buttonBox = await box(button);
	expect(visual.width).toBe(32);
	expect(visual.height).toBe(32);
	expect(buttonBox.width).toBeGreaterThanOrEqual(44);
	expect(buttonBox.height).toBeGreaterThanOrEqual(44);
	expect(buttonBox.x).toBeGreaterThanOrEqual(frameBox.x);
	expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(frameBox.x + frameBox.width);
	const hit = await button.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const probe = document.elementFromPoint(rect.left + 2, rect.top + rect.height / 2);
		return probe === element || element.contains(probe);
	});
	expect(hit).toBe(true);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(1);
});
