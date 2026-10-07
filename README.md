# Catatan Solusi

Knowledge base statis untuk mencari dan membaca penyelesaian masalah teknologi. Bahasa antarmuka dan artikel adalah Indonesia. Nama produk diubah dari `src/config/site.ts`.

`/` meminta pilihan sistem operasi: Linux, Windows, macOS, atau Semua platform. Pilihan tersimpan di browser dan membuka `/dashboard/`. Artikel Linux, Windows, atau macOS juga menyertakan artikel lintas-platform. “Ganti sistem operasi” membuka `/?change=1` agar preferensi lama tidak langsung mengembalikan pengguna ke dashboard.

## Versi yang terpasang

Diukur pada mesin pengembangan ini, bukan angka perkiraan:

| Komponen | Versi |
|---|---|
| Node.js | 24.14.0 |
| npm | 11.9.0 |
| astro | 7.3.6 |
| @astrojs/starlight | 0.42.5 |
| pagefind (dependensi Starlight) | 1.5.2 |
| typescript | 5.9.3 |
| @playwright/test | 1.63.0 |
| tsx | 4.23.15 |
| yaml | 2.8.1 |

Node minimum dari Astro 7: `>=22.12.0`.

## Setup

```bash
npm ci
cp .env.example .env
# Isi PUBLIC_SITE_URL sebelum menerbitkan canonical dan sitemap.
npm run dev
```

`npm run dev` bisa mencari artikel publik meski Starlight belum menyalin `/pagefind/pagefind.js`. Server pengembangan menjawab `/__cs/dev-search` dari berkas Markdown, mengecualikan draf, dan tidak ikut build produksi. Pratinjau serta situs terbit tetap memakai indeks Pagefind.

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4321 --ignore-lock
```

`--ignore-lock` menahan pratinjau di latar depan. Tanpa flag itu, Astro 7.3.6 dapat memindahkan pratinjau ke proses latar bila mendeteksi agen.

## Perintah pemeriksaan

```bash
npm run check
npm run validate:content
npm run build
npm run check:links
npx playwright install chromium
npm run test:e2e
```

`test:e2e` memakai pratinjau produksi, bukan server pengembangan. Hasil yang dijalankan pada 7 Oktober 2026 setelah fallback pencarian development:

- `tsc --noEmit`: lulus.
- `tsx --test tests/public-search.test.ts`: 2 tes lulus. Draf dan token internal tidak masuk pencarian publik; filter platform dihormati.
- `astro build`: 21 halaman HTML. `dist/` tidak memuat `__cs/dev-search`, `TOKEN-DRAFT-7K2M`, atau slug draf.
- Playwright pratinjau: 35 tes lulus pada `http://127.0.0.1:4321`, termasuk tombol hapus kueri.
- Playwright development: 1 tes lulus pada `http://127.0.0.1:4331` lewat `npx playwright test --config playwright.dev.config.ts`. `/pagefind/pagefind.js` tetap 404, pencarian tetap menemukan artikel publik, dan draf tidak muncul.
- `astro check`, `validate:content`, dan `check:links` tidak diulang pada perubahan ini.

Tidak ada skor Lighthouse atau data lapangan Core Web Vitals. Target di PRD tetap target, bukan hasil pengukuran.

## Menulis artikel

Salin template dari `templates/`, lalu letakkan berkas di `src/content/docs/<kategori>/`. Jangan menaruh template di dalam `content/docs`.

Field wajib artikel: `title`, `description`, `category`, `kind`, `platforms`, `tags`, `status`, `updatedAt`. `sidebarLabel` opsional untuk label navigasi pendek; judul halaman, breadcrumb, SEO, dan pencarian tetap memakai `title`. `pagefind: false` wajib untuk beranda, indeks kategori, dan draf.

Status:

- `verified` hanya jika `testedAt` dan `testedEnvironment` konkret ada, tanggal tidak di masa depan, dan `testedAt` tidak lebih baru dari `updatedAt`.
- `unverified` untuk panduan yang belum dibuktikan.
- `investigating` bila penyelesaian final belum ada.

`related` memakai ID koleksi, misalnya `sistem-operasi/izin-berkas-ditolak`, bukan judul. Draf tidak masuk halaman publik, sidebar, statistik, atau indeks. Starlight 0.42.5 mengecualikan `draft: true` dari build produksi; validator juga menolak `pagefind` yang masih aktif pada draf.

Contoh pertama: `src/content/docs/desktop-tampilan/pen-appimage-panel.mdx`. Path dan lingkungan harus disesuaikan. Proyek ini belum menguji langkah itu.

## Deployment

Hasil `dist/` statis. Set `PUBLIC_SITE_URL` sebelum menerbitkan. Jika variabel itu kosong, canonical dan sitemap memakai `http://localhost:4321` dan build itu tidak boleh dipublikasikan. Unggah seluruh `dist/` termasuk `pagefind/`. Jangan memasang fallback SPA ke `index.html`.

`robots.txt` ditulis ulang saat build dan menunjuk sitemap bila berkas sitemap ada. Pada build ini sitemap adalah `/sitemap-index.xml`.

## Adaptasi terhadap API terpasang

- Koleksi memakai `src/content.config.ts`, `docsLoader()`, dan `docsSchema({ extend })` dari Starlight 0.42.5. Zod berasal dari `astro/zod`.
- `/` adalah halaman pemilihan sistem operasi di `src/pages/index.astro`, bukan route Starlight. Dashboard ada di `/dashboard/`. Preferensi `catatan-solusi:platform:v1` hanya dibaca di browser. Query `platform` yang valid mengalahkan storage. Pagefind 1.5 memakai filter `{ platform: { any: [...] } }` agar artikel lintas-platform ikut hasil.
- `ThemeProvider` dipaksa `light`. `Page.astro` Starlight menulis `data-theme="dark"` sebelum skrip berjalan, jadi token light juga dipasang pada kedua nilai `data-theme`.
- `disable404Route: true` karena Starlight ikut mendaftarkan `/404`. Halaman proyek ada di `src/pages/404.astro`.
- Breakpoint bawaan Starlight tetap 50rem dan 72rem, bukan 768px dan 1200px. Sidebar desktop memakai 280px. Kolom daftar isi tetap mengikuti layout Starlight, bukan 216px.
- Tombol salin tetap satu per blok, yaitu tombol bawaan Expressive Code. Plugin `src/ec/header-copy.ts` memindahkannya ke header. `src/scripts/clipboard.ts` menyalin `data-code`, menukar ikon menjadi centang `#3F6212`, dan mengumumkan `Kode berhasil disalin` atau kegagalan. Klik ditangkap lebih dulu agar skrip salin bawaan tidak berjalan ganda.
- Pagefind dapat mencocokkan istilah mirip. Kueri yang tidak ada di korpus bisa tetap menampilkan halaman lain. Pengecualian draf diuji lewat ketiadaan URL dan judul draf, bukan lewat nol hasil untuk setiap string acak.
- Starlight 0.42.5 tidak menyalin `pagefind.js` saat `astro dev`. Dialog tetap memakai Pagefind bila berkas itu ada. Jika responsnya 404 atau HTML, hanya mode development yang meminta `/__cs/dev-search`. Plugin Vite `apply: 'serve'` membaca artikel publik di server; draf, beranda, dan indeks kategori tidak ikut. Build produksi tidak memuat endpoint atau korpus itu. Indeks rusak atau gagal jaringan tetap menampilkan gagal dan tombol Coba lagi, tanpa menyuruh pengguna menjalankan build.
- Submenu kategori memakai grid `0fr` ke `1fr` selama 220 ms dengan `--ease-standard`. Isi bergeser 4 px dan chevron berputar 90 derajat selama 180 ms. Kategori aktif terbuka saat HTML dirender, tanpa animasi pembukaan. `prefers-reduced-motion` meniadakan tinggi, pergeseran, dan rotasi. Preferensi tetap: kategori rute aktif terbuka, kategori lain independen, dan tidak ada penyimpanan baru.

## Batas yang diketahui

- Mobbin tidak terhubung saat implementasi. Tata letak mengikuti `DESIGN-SYTEM.MD`.
- Keyboard virtual, pembaca layar nyata, dan zoom 200% tidak diuji di perangkat fisik.
- IME dicegah lewat `event.isComposing`, tetapi tidak diuji dengan editor IME sungguhan.
- Kontras token teks dihitung terhadap latar yang ditentukan: pasangan teks lulus 4.5:1. `#87CF3E` hanya dekorasi (kontras 1.90:1 terhadap putih).
- Tidak ada mode gelap, login, analitik, atau grafik. Jumlah beranda dihitung dari artikel publik saat build.
