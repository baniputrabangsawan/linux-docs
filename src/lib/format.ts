/** Format tanggal ISO tanpa geser hari akibat zona waktu lokal. */
export function formatIsoDate(iso: string): string {
	const [year, month, day] = iso.split('-').map(Number);
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(year, month - 1, day)));
}
