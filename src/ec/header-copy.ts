import { addClassName, h, s, setProperty, type Element, type ElementContent } from '@expressive-code/core/hast';
import type { ExpressiveCodePlugin } from '@expressive-code/core';

const copyLabel = 'Salin kode';

function isElement(node: ElementContent | undefined): node is Element {
	return node?.type === 'element';
}

function classNames(node: Element): string[] {
	const value = node.properties?.className;
	if (!value) return [];
	return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
}

function hasClass(node: Element, name: string): boolean {
	return classNames(node).includes(name);
}

function findChild(node: Element, name: string): Element | undefined {
	return node.children.find((child): child is Element => isElement(child) && hasClass(child, name));
}

function textValue(node: ElementContent): string {
	if (node.type === 'text') return node.value;
	if (node.type === 'element') return node.children.map(textValue).join('');
	return '';
}

function icon(name: 'copy' | 'check'): Element {
	const paths =
		name === 'copy'
			? [
					s('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }),
					s('path', { d: 'M5 15V5a2 2 0 0 1 2-2h10' }),
				]
			: [s('path', { d: 'm5 12.5 4.2 4.2L19 7.5' })];
	return s(
		'svg',
		{
			class: name === 'copy' ? 'copy-icon' : 'check-icon',
			xmlns: 'http://www.w3.org/2000/svg',
			width: 16,
			height: 16,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': 1.75,
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'aria-hidden': 'true',
		},
		paths,
	);
}

/**
 * Memindahkan tombol salin bawaan Frames ke header, tanpa menambah tombol kedua.
 * Skrip bawaan tetap ada; listener proyek menghentikannya di fase capture.
 */
export function headerCopyPlugin(): ExpressiveCodePlugin {
	return {
		name: 'Header copy button',
		hooks: {
			postprocessRenderedBlock({ renderData, codeBlock }) {
				const root = renderData.blockAst;

				let header = findChild(root, 'header');
				const copy = findChild(root, 'copy') ?? (header ? findChild(header, 'copy') : undefined);
				if (!copy) return;

				if (!header) {
					header = h('figcaption', { class: 'header' });
					root.children.unshift(header);
				}
				if (!header.children.includes(copy)) {
					root.children = root.children.filter((child) => child !== copy);
					header.children.push(copy);
				}
				addClassName(root, 'has-copy-header');

				const title = findChild(header, 'title');
				const label = title ? textValue(title).replaceAll('\u00a0', ' ').trim() : '';
				if (!label) {
					const language = codeBlock.language.trim() || 'kode';
					if (title) {
						title.children = [{ type: 'text', value: language }];
					} else {
						header.children.unshift(h('span', { class: 'title' }, language));
					}
				}

				const button = copy.children.find(
					(child): child is Element => isElement(child) && child.tagName === 'button',
				);
				if (!button) return;
				addClassName(button, 'copy-code');
				setProperty(button, 'type', 'button');
				setProperty(button, 'ariaLabel', copyLabel);
				setProperty(button, 'title', null);
				button.children = [
					h('span', { class: 'copy-visual', 'aria-hidden': 'true' }, [icon('copy'), icon('check')]),
					h('span', { class: 'copy-tooltip', 'aria-hidden': 'true' }, copyLabel),
				];
			},
		},
	};
}
