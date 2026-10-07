import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPublicDocs, searchPublicDocs } from '../src/lib/public-search.ts';

test('pencarian publik tidak memuat draf atau token internal', () => {
	const docs = loadPublicDocs();
	assert.equal(
		docs.some((doc) => doc.url.includes('catatan-internal-draf') || doc.text.includes('TOKEN-DRAFT-7K2M')),
		false,
	);
	assert.equal(searchPublicDocs('TOKEN-DRAFT-7K2M', null, docs).length, 0);
});

test('fallback menemukan judul dan menghormati platform', () => {
	const docs = loadPublicDocs();
	const linux = searchPublicDocs('AppImage tidak muncul', 'linux', docs);
	assert.equal(linux.some((hit) => hit.url.includes('pen-appimage-panel')), true);
	const windows = searchPublicDocs('AppImage tidak muncul', 'windows', docs);
	assert.equal(windows.some((hit) => hit.url.includes('pen-appimage-panel')), false);
	const cross = searchPublicDocs('EACCES', 'windows', docs);
	assert.equal(cross.some((hit) => hit.url.includes('npm-eacces')), true);
});
