const idleLabel = 'Salin kode';
const copiedLabel = 'Kode berhasil disalin';
const copiedTooltip = 'Disalin';
const failureMessage = 'Gagal menyalin. Pilih dan salin kode secara manual.';
const resetMs = 2000;

const timers = new WeakMap<HTMLButtonElement, number>();

function liveRegion(): HTMLElement {
	let region = document.getElementById('copy-status');
	if (!region) {
		region = document.createElement('div');
		region.id = 'copy-status';
		region.className = 'visually-hidden';
		region.setAttribute('role', 'status');
		region.setAttribute('aria-live', 'polite');
		document.body.append(region);
	}
	return region;
}

function announce(message: string): void {
	const region = liveRegion();
	region.textContent = '';
	window.setTimeout(() => {
		region.textContent = message;
	}, 30);
}

export function decodeCopiedCode(raw: string): string {
	return raw.replaceAll('\u007f', '\n');
}

async function writeClipboard(value: string): Promise<boolean> {
	try {
		if (!navigator.clipboard?.writeText) throw new Error('Clipboard tidak tersedia');
		await navigator.clipboard.writeText(value);
		return true;
	} catch {
		const previous = document.activeElement;
		const holder = document.createElement('textarea');
		holder.value = value;
		holder.setAttribute('readonly', '');
		holder.setAttribute('aria-hidden', 'true');
		holder.tabIndex = -1;
		holder.style.position = 'fixed';
		holder.style.top = '0';
		holder.style.left = '0';
		holder.style.width = '1px';
		holder.style.height = '1px';
		holder.style.opacity = '0';
		document.body.append(holder);
		holder.focus({ preventScroll: true });
		holder.select();
		let copied = false;
		try {
			copied = document.execCommand('copy');
		} catch {
			copied = false;
		}
		holder.remove();
		if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
		return copied;
	}
}

function setTooltip(button: HTMLButtonElement, text: string): void {
	button.dataset.tooltip = text;
	const tooltip = button.querySelector('.copy-tooltip');
	if (tooltip) tooltip.textContent = text;
}

function setIdle(button: HTMLButtonElement): void {
	button.classList.remove('is-copied', 'is-failed');
	button.setAttribute('aria-label', idleLabel);
	setTooltip(button, idleLabel);
}

function scheduleReset(button: HTMLButtonElement): void {
	const existing = timers.get(button);
	if (existing !== undefined) window.clearTimeout(existing);
	timers.set(
		button,
		window.setTimeout(() => {
			timers.delete(button);
			setIdle(button);
		}, resetMs),
	);
}

async function copyFromButton(button: HTMLButtonElement): Promise<void> {
	const generation = Number(button.dataset.copyGeneration ?? '0') + 1;
	button.dataset.copyGeneration = String(generation);
	const code = decodeCopiedCode(button.dataset.code ?? button.getAttribute('data-code') ?? '');
	if (code.length === 0) {
		setIdle(button);
		setTooltip(button, failureMessage);
		button.classList.add('is-failed');
		scheduleReset(button);
		announce(failureMessage);
		return;
	}
	const copied = await writeClipboard(code);
	if (button.dataset.copyGeneration !== String(generation)) return;
	if (!copied) {
		setIdle(button);
		setTooltip(button, failureMessage);
		button.classList.add('is-failed');
		scheduleReset(button);
		announce(failureMessage);
		return;
	}
	button.classList.remove('is-failed');
	button.classList.add('is-copied');
	button.setAttribute('aria-label', copiedLabel);
	setTooltip(button, copiedTooltip);
	scheduleReset(button);
	announce(copiedLabel);
}

export function initClipboard(): void {
	if (document.documentElement.dataset.clipboardReady === 'true') return;
	document.documentElement.dataset.clipboardReady = 'true';
	document.addEventListener(
		'click',
		(event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const button = target.closest<HTMLButtonElement>('.expressive-code .copy button');
			if (!button) return;
			event.preventDefault();
			event.stopPropagation();
			void copyFromButton(button);
		},
		true,
	);
}
