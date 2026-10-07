# Architecture — Catatan Solusi

Versi: 1.0 · Tanggal: 7 Oktober 2026.
Dokumen terkait: PRD.MD dan DESIGN-SYTEM.MD.

## 1. Keputusan arsitektur

Situs statis dengan Astro dan Starlight. File Markdown/MDX adalah sumber konten; content collection memvalidasi metadata; build menghasilkan halaman serta indeks Pagefind. Browser menerima HTML/CSS dan JavaScript terbatas untuk pencarian, filter, navigasi mobile, dan clipboard.

Tidak ada database atau backend aplikasi pada rilis awal. Penulis mengubah file melalui Git, lalu menjalankan pemeriksaan dan build. Deployment hanya menyajikan output dist/. Artikel baru membutuhkan build ulang.

Starlight mengelola route dokumentasi. Jangan menambahkan router client-side atau route pages/ yang bertabrakan dengan route dari content/docs/. `/` adalah halaman pemilihan sistem operasi di `src/pages/index.astro`, di luar shell dashboard. Dashboard lama ada di `/dashboard/` lewat `src/content/docs/dashboard.mdx`. Index kategori tetap halaman dokumentasi MDX.

## 2. Struktur file dan folder

Tabel ini adalah struktur target. File opsional hanya dibuat jika digunakan; jangan membuat implementasi kosong sekadar memenuhi daftar.

| Path | Tanggung jawab |
|---|---|
| PRD.MD | Kebutuhan produk dan prompt implementasi |
| DESIGN-SYTEM.MD | Token visual, ukuran, typography, state |
| ARCHITECTURE.md | Struktur dan batas tanggung jawab |
| README.md | Setup, runtime aktual, scripts, penulisan, deployment |
| package.json | Dependency dan scripts |
| package-lock.json | Lockfile tunggal |
| astro.config.mjs | output statis, site URL, integrasi Starlight, custom CSS, override |
| tsconfig.json | TypeScript strict berbasis konfigurasi Astro |
| .gitignore | node_modules, dist, cache, laporan uji, local env |
| .env.example | Variabel publik yang diperlukan tanpa secret |
| public/favicon.svg | Favicon produk sendiri |
| public/robots.txt | Aturan crawl dan URL sitemap produksi |
| src/content.config.ts | Collection docs, docsLoader/docsSchema, extension metadata |
| src/config/site.ts | Nama produk, deskripsi, URL, bahasa |
| src/config/categories.ts | Satu registry slug/label/deskripsi/ikon kategori |
| src/config/navigation.ts | Urutan sidebar dan mapping kategori |
| src/types/content.ts | Tipe turunan skema; hindari tipe metadata ganda |
| src/lib/content.ts | Query koleksi, seleksi artikel publik, sort, statistik |
| src/lib/related.ts | Resolusi artikel terkait deterministik |
| src/lib/search-metadata.ts | Pemetaan field konten ke metadata/filter Pagefind |
| src/assets/brand/logo.svg | Logo orisinal; optional, gunakan wordmark jika belum tersedia |
| src/assets/screenshots/ | Screenshot yang diproses/dioptimalkan Astro |
| src/components/dashboard/DashboardHome.astro | Statistik nyata, kategori, artikel terbaru |
| src/components/dashboard/CategoryListing.astro | SSR daftar artikel dan kontrol filter |
| src/components/dashboard/CategoryCard.astro | Kartu kategori |
| src/components/dashboard/ArticleCard.astro | Kartu artikel |
| src/components/docs/ArticleMeta.astro | Status, tanggal, platform, lingkungan |
| src/components/docs/RelatedArticles.astro | Artikel terkait |
| src/components/docs/SearchMetadata.astro | Metadata Pagefind yang tidak mengotori area baca |
| src/components/ui/StatusBadge.astro | Label status aksesibel |
| src/components/ui/EmptyState.astro | State kosong yang dapat dipakai ulang |
| src/components/ui/Callout.astro | Wrapper callout bila fitur bawaan belum cukup |
| src/components/starlight/Header.astro | Header produk dan kontrol mobile |
| src/components/starlight/Sidebar.astro | Navigasi dan search trigger desktop |
| src/components/starlight/Search.astro | Satu UI pencarian dan pemicu/dialog bersama |
| src/components/starlight/PageTitle.astro | Judul ditambah metadata artikel |
| src/components/starlight/MarkdownContent.astro | Wrapper konten + metadata pencarian + artikel terkait |
| src/scripts/search.ts | Pengendalian dialog, platform key, navigasi hasil |
| src/scripts/filters.ts | Progressive enhancement filter dan sinkronisasi URL |
| src/scripts/clipboard.ts | Hanya jika tombol salin bawaan perlu dilengkapi |
| src/styles/tokens.css | Token semantik proyek |
| src/styles/starlight.css | Pemetaan token ke CSS variables Starlight |
| src/styles/global.css | Aturan umum, focus, reduced motion |
| src/styles/dashboard.css | Shell dan kartu dashboard |
| src/styles/article.css | Typography artikel, kode, tabel, gambar |
| src/styles/search.css | Dialog, hasil, kbd, state |
| src/content/docs/dashboard.mdx | Dashboard dokumentasi di `/dashboard/` |
| src/pages/index.astro | Pemilihan sistem operasi di `/` |
| src/lib/os-preference.ts | Validasi, penyimpanan, dan pencocokan preferensi platform |
| src/content/docs/sistem-operasi/index.mdx | Index kategori |
| src/content/docs/aplikasi/index.mdx | Index kategori |
| src/content/docs/desktop-tampilan/index.mdx | Index kategori |
| src/content/docs/desktop-tampilan/pen-appimage-panel.mdx | Contoh artikel; unverified |
| src/content/docs/jaringan/index.mdx | Index kategori |
| src/content/docs/perangkat-keras/index.mdx | Index kategori |
| src/content/docs/pengembangan/index.mdx | Index kategori |
| src/content/docs/server-hosting/index.mdx | Index kategori |
| src/content/docs/konfigurasi/index.mdx | Index kategori |
| src/content/docs/referensi-perintah/index.mdx | Index kategori |
| src/pages/404.astro | Halaman tidak ditemukan sesuai pola hosting |
| templates/troubleshooting.md | Template artikel, di luar collection publik |
| templates/configuration.md | Template konfigurasi |
| templates/command-reference.md | Template referensi perintah |
| scripts/validate-content.ts | Pemeriksaan metadata, related ID, tanggal, draft |
| scripts/check-links.ts | Pemeriksaan link lokal dan anchor output build |
| tests/e2e/search.spec.ts | Shortcut, fokus, hasil, empty/error search |
| tests/e2e/documentation.spec.ts | Artikel, copy, filter, mobile, draft exclusion |
| playwright.config.ts | Production preview sebagai web server pengujian |
| .github/workflows/checks.yml | Opsional jika repo GitHub; check/build/uji |
| dist/ | Output build; tidak diedit manual |

Konfigurasi collection menggunakan API Astro/Starlight yang berlaku pada versi terpasang. Lokasi src/content.config.ts mengikuti struktur Starlight yang diperiksa pada 7 Oktober 2026. Jangan menyalin setup content/config.ts lama tanpa memeriksa dokumentasi versi proyek.

## 3. Kepemilikan route

| URL | Sumber | Jenis |
|---|---|---|
| / | src/pages/index.astro | Pemilihan sistem operasi |
| /dashboard/ | content/docs/dashboard.mdx | Dashboard dokumentasi |
| /sistem-operasi/ | content/docs/sistem-operasi/index.mdx | Kategori |
| /aplikasi/ | content/docs/aplikasi/index.mdx | Kategori |
| /desktop-tampilan/ | content/docs/desktop-tampilan/index.mdx | Kategori |
| /desktop-tampilan/pen-appimage-panel/ | File artikel pada kategori | Artikel |
| /jaringan/, /perangkat-keras/, /pengembangan/ | Index MDX kategori masing-masing | Kategori |
| /server-hosting/, /konfigurasi/, /referensi-perintah/ | Index MDX kategori masing-masing | Kategori |
| /404.html | src/pages/404.astro | Fallback hosting |
| /pagefind/ | Dibuat integrasi Pagefind | Asset pencarian, bukan halaman editorial |

Normalisasikan trailing slash dalam konfigurasi. Verifikasi mapping index MDX dan base path pada versi yang dipasang. Slug artikel memakai kebab-case, tidak memasukkan tanggal. Slug tidak berubah saat judul diperbarui; gunakan redirect statis/hosting jika perubahan URL diperlukan.

## 4. Skema konten

Perluas docsSchema resmi; jangan menggantinya dengan skema custom yang menghilangkan frontmatter Starlight. Gunakan validator yang kompatibel dengan Zod/API content collection versi terpasang. Tipe diturunkan dari skema atau CollectionEntry, bukan ditulis ulang.

Contoh frontmatter artikel:

```yaml
---
title: Menambahkan Pen AppImage ke Panel Linux Mint
description: Panduan membuat launcher dan memakai ikon bawaan AppImage.
category: desktop-tampilan
kind: troubleshooting
platforms: [linux]
tags: [linux-mint, cinnamon, appimage, launcher, ikon]
status: unverified
updatedAt: "2026-10-07"
sources:
  - label: Integrasi desktop AppImage
    url: https://docs.appimage.org/reference/desktop-integration.html
related: []
draft: false
---
```

| Field | Aturan |
|---|---|
| kind | overview, category, troubleshooting, configuration, command-reference |
| category | Slug registry; wajib untuk artikel dan index kategori |
| platforms | Array dari linux/windows/macos/lintas-platform; wajib artikel |
| status | verified/unverified/investigating; wajib artikel |
| updatedAt | Tanggal ISO valid; wajib artikel |
| testedAt | Wajib jika verified; tidak lebih baru dari updatedAt |
| testedEnvironment | Wajib dan spesifik jika verified |
| sources | Array label+URL HTTPS/HTTP yang valid |
| related | ID artikel collection; bukan judul bebas |
| draft | Boolean; pengecualian produksi harus diuji eksplisit |
| tags | Array string normalisasi lowercase/kebab-case |

kind overview/category adalah halaman navigasi, bukan artikel: dikecualikan dari statistik artikel dan hasil search utama. metadata yang tidak relevan tidak dipaksakan. Contoh verified harus menyertakan testedEnvironment seperti distro, release, desktop, arsitektur, dan versi aplikasi yang benar-benar diuji. Field version/range aplikasi boleh diperluas kemudian; jangan mengarang nilai.

## 5. Pipeline konten dan draft

1. Penulis membuat Markdown/MDX dari template.
2. Loader membaca konten dan mempertahankan frontmatter Starlight.
3. Validator memeriksa kategori, field bersyarat, tanggal, dan related ID.
4. Query konten memisahkan artikel publik dari overview/category/draft.
5. Starlight menghasilkan halaman; halaman draft benar-benar dikecualikan pada build produksi.
6. Pagefind mengindeks hanya artikel publik dan konten yang relevan.
7. Pemeriksa output memastikan draft tidak memiliki file route atau hasil indeks.

Filtering statistik saja tidak cukup untuk menyembunyikan draft. Pilih mekanisme exclusion yang didukung versi Starlight terpasang; jika tidak tersedia, buat preprocessing/loader exclusion yang terintegrasi dan fail-safe. Template tetap berada di luar content/docs sehingga tidak menjadi halaman tanpa sengaja. Produksi tidak boleh menampilkan draft walaupun URL ditebak.

## 6. Strategi custom Starlight

Gunakan customCss untuk warna, ukuran, dan typography lebih dulu. Override Header/Sidebar/Search hanya untuk kebutuhan layout yang tidak tercapai lewat konfigurasi. PageTitle dan MarkdownContent dapat membungkus komponen default untuk menambahkan metadata dan artikel terkait; pertahankan slot dan atribut yang diperlukan.

`/` adalah halaman pemilihan tanpa sidebar. Dashboard di `/dashboard/` mempertahankan sidebar. Preferensi platform disimpan di browser lewat `src/lib/os-preference.ts` dan diterapkan sebagai enhancement; build tidak membaca localStorage. Pencarian Pagefind memakai filter `platform` sesuai pilihan. Jika artikel berbeda dari preferensi, halaman artikel tetap ditampilkan.

Seluruh ID DOM dan dialog search dimiliki satu komponen Search. Sidebar/header hanya menjadi pemicu; tidak merender dialog masing-masing. Hindari ketergantungan pada selector internal Starlight yang tidak stabil. Setiap custom behavior memiliki pemilik listener dan mekanisme cleanup.

## 7. Pencarian dan interaksi browser

Pagefind menjadi satu sumber pencarian. Biarkan integrasi Starlight membangun indeks. Jika UI default memenuhi kriteria, gunakan kembali dan hanya sesuaikan tampilan. Jika navigasi panah/metadata belum memenuhi kebutuhan, gunakan UI custom berbasis Pagefind API melalui override Search.

Lazy import dilakukan saat dialog pertama dibuka. Pemetaan base path tidak hardcoded bila aplikasi dipasang dalam subpath. Query async memakai request token agar hasil query lama tidak menimpa hasil baru. Input dapat diberi debounce pendek sekitar 100–150 ms. Snippet/mark harus disanitasi atau dirender menggunakan output aman; jangan menyisipkan HTML arbitrer dari query pengguna.

Gunakan native dialog atau komponen bawaan yang sudah aksesibel. Identifikasi platform hanya untuk badge keyboard, bukan membatasi shortcut; dukung metaKey+k dan ctrlKey+k. Jangan memanggil navigator pada build/server. Hindari listener shortcut saat komposisi IME. Uji shortcut dengan editor/input yang aktif agar tidak merusak pengetikan.

Filter kategori membaca query string lalu menyaring artikel yang sudah dirender. Gunakan URLSearchParams; query tidak valid dinormalisasi, bukan menyebabkan crash. Konten lengkap tetap tersedia tanpa script. Salin kode memakai mekanisme bawaan bila mencukupi, dengan fallback pesan jika clipboard tidak tersedia.

## 8. Batas dependency

- Komponen presentasi tidak mengakses filesystem atau fetch API aplikasi.
- Query artikel dilakukan pada build melalui src/lib/content.ts.
- Script browser tidak mengimpor seluruh collection atau dependency build ke bundle client.
- Frontmatter tidak memuat secrets; semua konten statis dianggap publik.
- Pilih Astro components untuk UI statis; tidak ada hydration framework kecuali kebutuhan baru membuktikannya.
- Jangan melakukan dua indexing Pagefind melalui integrasi sekaligus perintah manual.
- Pisahkan data navigasi dari tampilan, namun kategori memiliki satu registry otoritatif.

## 9. Scripts dan quality gates

| Script package.json | Hasil |
|---|---|
| dev | astro dev |
| check | astro check |
| validate:content | Validator konten proyek |
| build | astro build beserta Pagefind integrasi |
| preview | astro preview |
| check:links | Pemeriksaan output dist setelah build |
| test:e2e | Playwright terhadap production preview |

Validator TypeScript dapat dijalankan dengan runner dev dependency yang ringan seperti tsx bila diperlukan; versi dan command harus benar-benar diatur, bukan hanya dicantumkan. CI: install terkunci → check → validasi konten → build → cek tautan → uji alur penting. Jangan menilai search melalui dev saja karena indeks dibuat saat build.

Pemeriksaan manual: desktop 1440 px, tablet 1024 px, mobile 360/390 px, zoom 200%, system dark dengan UI light yang konsisten, keyboard saja, dan kondisi indeks search gagal dimuat. Catat hasil aktual, jangan mengklaim target performance telah tercapai tanpa pengukuran.

## 10. Hosting dan pemeliharaan

Output dist dapat dipublikasikan pada hosting statis. Set site URL produksi sebelum sitemap/canonical. Pastikan output pagefind ikut terunggah, asset path sesuai base, MIME WebAssembly benar bila digunakan, dan 404 benar-benar menerima status 404 pada penyedia hosting.

Asset bernama hash dapat memakai cache panjang immutable. HTML dan manifest/index pencarian memerlukan kebijakan update yang mencegah mismatch antarversi. Deploy output satu build secara utuh/atomik bila hosting mendukungnya. Jangan menambahkan SPA catch-all ke index.html karena route sudah memiliki halaman statis sendiri.

Artikel, registry kategori, config, dan design tokens disimpan dalam Git. Update dependency dilakukan terkendali dengan pemeriksaan ulang override Starlight dan search. Tambahkan CMS/auth/database hanya lewat keputusan arsitektur baru; fitur ini bukan dependency tersembunyi rilis awal.

## 11. Prompt arsitektur

```text
Implementasikan arsitektur statis pada ARCHITECTURE.md menggunakan Astro/Starlight versi stabil kompatibel. Gunakan src/content.config.ts, skema docs resmi yang diperluas, satu registry kategori, dan query konten pada build. Route dokumentasi dimiliki Starlight; jangan menduplikasi di src/pages. Homepage dan category index memakai MDX dengan komponen dashboard di shell yang mempertahankan sidebar.
Gunakan customCss dan override resmi seperlunya. Satu komponen memiliki dialog dan listener search; pemicu desktop/mobile merujuk ke instance yang sama. Pagefind dihasilkan hanya sekali oleh integrasi. JavaScript client tidak membawa seluruh collection/dependency build. Draft benar-benar dikecualikan dari output produksi dan indeks, bukan hanya disembunyikan dari kartu. Implementasikan validator dan scripts yang benar-benar bisa dijalankan, lalu uji pada production preview. Catat setiap adaptasi terhadap API framework aktual di README.
```

## 12. Referensi

- https://starlight.astro.build/guides/project-structure/
- https://starlight.astro.build/guides/overriding-components/
- https://starlight.astro.build/guides/site-search/
- https://docs.astro.build/en/guides/content-collections/
- https://pagefind.app/docs/api/

Struktur ini merupakan rancangan proyek. Folder dan komponen custom tidak diklaim sebagai bagian bawaan framework.
