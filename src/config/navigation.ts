import { categories } from './categories';

/**
 * Sidebar Starlight tetap dikonfigurasi agar shell dan autogenerate tetap ada.
 * Tampilan sidebar di-override dan memakai registry kategori yang sama.
 */
export const sidebar = [
	{ label: 'Beranda', link: '/dashboard/' },
	{
		label: 'Kategori',
		items: categories.map((category) => ({
			label: category.label,
			collapsed: true,
			items: [
				{ label: 'Ikhtisar', link: `/${category.slug}/` },
				{ autogenerate: { directory: category.slug } },
			],
		})),
	},
];
