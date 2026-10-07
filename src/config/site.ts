/**
 * Identitas produk. Ganti `name` di sini; sidebar, header, dan judul situs ikut berubah.
 * Jangan menyalin nama ini ke artikel sebagai angka atau merek pihak ketiga.
 */
export const site = {
	name: 'Catatan Solusi',
	description:
		'Dokumentasi publik untuk mencari, membaca, dan memeriksa penyelesaian masalah teknologi serta panduan konfigurasi.',
	lang: 'id',
	locale: 'id-ID',
} as const;

const configuredSiteUrl = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '');

export const siteUrlConfigured = Boolean(configuredSiteUrl);

/** Fallback lokal hanya untuk build pengembangan. Jangan terbitkan canonical ini. */
export const siteUrl = configuredSiteUrl || 'http://localhost:4321';
