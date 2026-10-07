import assert from 'node:assert/strict';
import test from 'node:test';
import { collectContentErrors, type ContentRecord } from '../src/lib/rules';

function article(overrides: Record<string, unknown> = {}): ContentRecord {
	return {
		id: 'sistem-operasi/contoh',
		path: 'src/content/docs/sistem-operasi/contoh.md',
		data: {
			title: 'Contoh',
			description: 'Ringkasan contoh yang cukup jelas.',
			kind: 'troubleshooting',
			category: 'sistem-operasi',
			platforms: ['linux'],
			tags: ['izin'],
			status: 'unverified',
			updatedAt: '2026-10-06',
			pagefind: true,
			draft: false,
			...overrides,
		},
	};
}

test('status verified ditolak tanpa metadata pengujian', () => {
	const errors = collectContentErrors([
		article({ status: 'verified', testedAt: undefined, testedEnvironment: undefined }),
	]);
	assert.ok(errors.some((error) => error.includes('testedAt')));
	assert.ok(errors.some((error) => error.includes('testedEnvironment')));
});

test('status verified ditolak bila lingkungan terlalu umum', () => {
	const errors = collectContentErrors([
		article({
			status: 'verified',
			testedAt: '2026-10-01',
			testedEnvironment: 'linux',
		}),
	]);
	assert.ok(errors.some((error) => error.includes('tidak spesifik')));
});

test('related yang tidak ada ditolak', () => {
	const errors = collectContentErrors([article({ related: ['aplikasi/tidak-ada'] })]);
	assert.ok(errors.some((error) => error.includes('tidak ada')));
});
