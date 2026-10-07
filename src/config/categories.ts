export const categorySlugs = [
	'sistem-operasi',
	'aplikasi',
	'desktop-tampilan',
	'jaringan',
	'perangkat-keras',
	'pengembangan',
	'server-hosting',
	'konfigurasi',
	'referensi-perintah',
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export type CategoryIcon =
	| 'os'
	| 'apps'
	| 'desktop'
	| 'network'
	| 'hardware'
	| 'code'
	| 'server'
	| 'config'
	| 'terminal';

export interface Category {
	slug: CategorySlug;
	label: string;
	description: string;
	icon: CategoryIcon;
}

export const categories: readonly Category[] = [
	{
		slug: 'sistem-operasi',
		label: 'Sistem Operasi',
		description: 'Boot, pembaruan, izin berkas, dan konfigurasi sistem.',
		icon: 'os',
	},
	{
		slug: 'aplikasi',
		label: 'Aplikasi',
		description: 'Instalasi, crash, dependensi, AppImage, dan Flatpak.',
		icon: 'apps',
	},
	{
		slug: 'desktop-tampilan',
		label: 'Desktop & Tampilan',
		description: 'Ikon, peluncur, panel, tema, dan pintasan desktop.',
		icon: 'desktop',
	},
	{
		slug: 'jaringan',
		label: 'Jaringan',
		description: 'LAN, Wi-Fi, router, DNS, dan koneksi yang gagal.',
		icon: 'network',
	},
	{
		slug: 'perangkat-keras',
		label: 'Perangkat Keras',
		description: 'Audio, Bluetooth, monitor, baterai, dan penyimpanan.',
		icon: 'hardware',
	},
	{
		slug: 'pengembangan',
		label: 'Pengembangan',
		description: 'Kode, build, paket, API, dan alat pengembangan.',
		icon: 'code',
	},
	{
		slug: 'server-hosting',
		label: 'Server & Hosting',
		description: 'VPS, Docker, domain, sertifikat, dan reverse proxy.',
		icon: 'server',
	},
	{
		slug: 'konfigurasi',
		label: 'Panduan Konfigurasi',
		description: 'Penyiapan perangkat dan layanan tanpa memaksa kolom diagnosis.',
		icon: 'config',
	},
	{
		slug: 'referensi-perintah',
		label: 'Referensi Perintah',
		description: 'Fungsi perintah, parameter, dan contoh yang harus disesuaikan.',
		icon: 'terminal',
	},
];

const categoryBySlug: Record<string, Category> = Object.fromEntries(
	categories.map((category) => [category.slug, category]),
);

export function getCategory(slug: string | undefined): Category | undefined {
	if (!slug) return undefined;
	return categoryBySlug[slug];
}

export function isCategorySlug(value: string): value is CategorySlug {
	return Object.hasOwn(categoryBySlug, value);
}
