# Design System — Catatan Solusi

Versi: 1.0 · Tanggal: 7 Oktober 2026.
Nama file dipertahankan **DESIGN-SYTEM.MD** sesuai permintaan; gunakan ejaan ini dalam referensi proyek.

## 1. Arah visual

Dashboard dokumentasi dengan putih dominan, teks charcoal, border abu tipis, dan hijau sebagai aksen. Struktur sidebar/header mengambil inspirasi screenshot dashboard Cloudflare; bukan reproduksi merek. Palet hijau terinspirasi Linux Mint, bukan klaim nilai resmi logo.

Prioritaskan keterbacaan artikel, pemindaian kategori, dan pencarian. Hindari gradient dekoratif, glassmorphism, glow, ilustrasi besar, statistik fiktif, dan kartu berlebihan. Rilis awal hanya light mode.

## 2. Token warna

| Token | HEX | Penggunaan |
|---|---|---|
| --color-bg | #FFFFFF | Sidebar, header, permukaan utama |
| --color-canvas | #FAFAFA | Area dashboard di belakang kartu |
| --color-surface | #FFFFFF | Kartu, dialog, dropdown |
| --color-surface-muted | #F4F4F5 | Hover netral, background kode |
| --color-border | #E5E7EB | Pemisah dekoratif dan kartu |
| --color-border-control | #71717A | Batas input jika diperlukan untuk kontras |
| --color-text | #18181B | Judul dan teks utama |
| --color-text-secondary | #52525B | Deskripsi dan metadata |
| --color-text-muted | #71717A | Teks tersier dan ikon |
| --color-brand | #87CF3E | Identitas dan dekorasi kecil |
| --color-primary | #3F6212 | Tombol, tautan, ikon aktif |
| --color-primary-hover | #365314 | Hover aksi utama |
| --color-primary-soft | #F0F9E8 | Menu dan hasil pencarian terpilih |
| --color-on-primary | #FFFFFF | Teks tombol utama |
| --color-focus | #3F6212 | Outline fokus |
| --color-success | #166534 | Status Teruji |
| --color-success-bg | #F0FDF4 | Background badge Teruji |
| --color-warning | #92400E | Status Belum terverifikasi |
| --color-warning-bg | #FFFBEB | Background peringatan |
| --color-danger | #991B1B | Error dan dampak destruktif |
| --color-danger-bg | #FEF2F2 | Background error |
| --color-neutral-bg | #F4F4F5 | Status Dalam diagnosis |
| --color-overlay | rgba(24,24,27,0.35) | Backdrop dialog |

Hijau cerah tidak digunakan untuk teks kecil di atas putih atau background tombol bertulisan putih. Border dekoratif tidak wajib memiliki kontras kontrol; input yang membutuhkan batas terlihat memakai border-control. Jangan mengandalkan warna saja untuk membedakan status; sertakan label dan ikon.

## 3. Font dan typography

Gunakan system font untuk menghindari unduhan tambahan:

```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", monospace;
}
```

| Elemen | Ukuran desktop | Mobile | Weight | Line-height |
|---|---|---|---|---|
| Judul halaman / H1 | 32 px | 28 px | 650 atau 600 | 1.25 |
| H2 artikel | 24 px | 22 px | 600 | 1.35 |
| H3 artikel | 20 px | 18 px | 600 | 1.4 |
| H4 | 16 px | 16 px | 600 | 1.5 |
| Isi artikel | 16 px | 16 px | 400 | 1.75 |
| UI / tombol / sidebar | 14 px | 14 px | 400–600 | 1.5 |
| Ringkasan kartu | 14 px | 14 px | 400 | 1.6 |
| Metadata / caption | 12–13 px | 12–13 px | 400 | 1.5 |
| Kode | 13–14 px | 13 px | 400 | 1.7 |
| Badge / kbd | 12 px | 12 px | 500 | 1.4 |

Gunakan rem dengan root 16 px; jangan mengunci zoom pengguna. Ukuran px pada tabel adalah acuan desain. Jangan memuat font hanya untuk mengejar weight 650; gunakan 600 jika font lokal tidak mendukungnya. Satu H1 per halaman. Heading mengikuti urutan logis. Tautan dalam artikel digarisbawahi; weight normal, warna primary.

## 4. Spacing dan ukuran

Skala spacing berbasis 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Token | Nilai |
|---|---|
| --space-1 sampai --space-6 | 4, 8, 12, 16, 20, 24 px |
| --space-8 / --space-10 / --space-12 / --space-16 | 32 / 40 / 48 / 64 px |
| --header-height | 64 px |
| --sidebar-width | 256 px |
| --toc-width | 216 px |
| --content-max | 1200 px |
| --article-max | 72ch |
| --radius-sm / --radius-md / --radius-lg | 4 / 8 / 12 px |
| --control-height | 40 px |
| --touch-target | Minimal 44 × 44 px |

Padding dashboard desktop 32 px, tablet 24 px, mobile 16 px. Gap kartu 16–24 px. Padding kartu 20 px; mobile 16 px. Paragraf memiliki jarak bawah 16 px. Heading bagian berjarak atas 32 px dan bawah 12 px. Hindari mengubah semua ukuran menjadi kelipatan besar yang membuat dashboard terlalu renggang.

## 5. Layout responsif

| Lebar | Perilaku |
|---|---|
| <768 px | Sidebar drawer, header dengan menu dan search, satu kolom, TOC disclosure |
| 768–1199 px | Sidebar kiri 240–256 px; tanpa TOC kanan; kartu maksimal dua kolom |
| ≥1200 px | Sidebar 256 px; artikel dengan TOC kanan jika ruang cukup; kartu 2–3 kolom |

Header tetap di atas. Sidebar dapat sticky di bawah header dan scroll mandiri. Main menggunakan min-width: 0. Jangan memberi tinggi viewport tetap pada area baca. Anchor heading memiliki scroll-margin agar tidak tertutup header. Konten artikel tidak dipaksa menjadi kartu besar; gunakan permukaan putih dan hierarki typography.

Z-index terpusat: konten 0, sidebar/header 20, overlay drawer 40, drawer 50, dialog modal 100. Gunakan native dialog/top layer bila sesuai dan jangan mengandalkan z-index untuk mengatasi top layer.

## 6. Komponen

### Sidebar

Identitas di atas, pemicu pencarian, Beranda, lalu kategori. Label kategori dapat dikelompokkan dengan heading kecil. Ikon 18 px, stroke sekitar 1.5–2. Menu aktif memakai primary-soft dengan teks primary dan aria-current. Hover memakai surface-muted. Jaga indentasi submenu 16 px.

### Pemilihan sistem operasi

Halaman `/` tidak memakai sidebar. Konten maksimal 720 px, satu kolom di mobile dan dua kolom di desktop. Empat kartu putih, border `#E5E7EB`, teks `#18181B`, ikon outline, dan aksen `#3F6212`. Hover serta fokus memakai background `#F0F9E8` dan border hijau. Seluruh kartu adalah tautan. Tidak ada animasi besar.

### Search trigger dan dialog

Trigger terlihat seperti input tetapi secara semantik button. Isi: ikon search, label Cari dokumentasi…, dan kbd platform. Kbd berborder, background putih, padding 2 × 6 px, radius 4 px. Pada SSR tampilkan fallback netral tanpa akses navigator; sesuaikan simbol platform di client.

Dialog desktop lebar maksimal 640 px, margin atas sekitar 12vh, padding 16 px, radius 12 px, shadow modal. Dialog mobile menggunakan margin 12 px dan tinggi maksimal berdasarkan dynamic viewport. Input 44 px atau lebih, font 16 px agar nyaman di perangkat mobile.

Hasil berisi judul, kategori/platform, dan snippet maksimal dua baris. Hasil dipilih memakai primary-soft serta outline/indikator jelas. Footer menjelaskan panah, Enter, Esc; jangan bergantung pada hover. Loading berupa indikator kecil dengan teks, tanpa layout bergeser. Highlight query tetap terbaca.

### Kartu artikel/kategori

Background putih, border 1 px, radius 8 px. Judul 16 px semibold. Hover boleh menguatkan border dan shadow tipis; tanpa gerakan naik besar. Tautan kartu harus memiliki nama aksesibel. Jangan menaruh button di dalam anchor yang membungkus seluruh kartu.

### Tombol

Primary: primary + on-primary. Secondary: putih + teks utama + border-control bila batas kontrol diperlukan. Ghost: transparan, hover surface-muted. Height 40 px, padding horizontal 16 px; area sentuh mobile minimum 44 px. Disabled memakai label/state semantik, bukan hanya opacity. Tombol ikon wajib aria-label.

### Badge dan callout

Teruji: success/success-bg. Belum terverifikasi: warning/warning-bg. Dalam diagnosis: text-secondary/neutral-bg. Badge memiliki teks eksplisit. Callout memiliki judul, ikon, dan isi; hindari teks panjang berwarna terang. Dampak destruktif memakai danger dan menjelaskan akibat konkret.

### Blok kode

Background surface-muted, border tipis, radius 8 px. Header bahasa dan tombol salin di atas. Kode scroll horizontal di dalam blok, bukan seluruh halaman. Syntax highlighting light theme harus memenuhi keterbacaan. Jika token syntax kurang kontras, override warna token. Kode inline memakai monospace, padding 2 × 4 px, radius 4 px.

### Tabel dan gambar

Tabel berheader semibold, divider halus, padding sel 12 px; wrapper scroll mobile diberi nama aksesibel. Gambar tidak melebihi area baca, memiliki alt/ukuran, caption opsional, dan tidak memuat informasi sensitif. Screenshot tidak dipakai sebagai pengganti instruksi teks.

## 7. Shadow dan motion

```css
:root {
  --shadow-card: 0 1px 2px rgb(24 24 27 / 0.04);
  --shadow-modal: 0 16px 48px rgb(24 24 27 / 0.16);
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

Transition hanya pada background-color, border-color, opacity, dan transform yang diperlukan. Jangan memakai transition: all. Drawer boleh bergerak 8–16 px; dialog fade ringan. Tidak ada animasi entrance pada seluruh artikel. prefers-reduced-motion menonaktifkan transform/scroll animasi dan memendekkan transisi.

## 8. Aksesibilitas dan state

Outline focus-visible 2 px primary dengan offset 3 px; jangan dihapus. Sediakan skip link. Elemen interaktif memakai button/link asli. Dialog dan drawer mengunci fokus bila modal, menutup dengan Esc, dan mengembalikan fokus. Form memiliki label. Pengumuman salin/loading memakai aria-live secara terbatas. Status tidak disampaikan hanya dengan warna.

Semua komponen memiliki default, hover, focus, active/selected, disabled bila relevan, loading, empty, dan error bila relevan. Uji kontras aktual, keyboard, zoom 200%, 360 px mobile, serta pembaca layar pada alur pencarian.

## 9. Integrasi styling Starlight

Simpan token semantik proyek di tokens.css. Petakan token ke custom properties Starlight yang tersedia pada versi terpasang; jangan menebak nama atau mengubah source node_modules. Gunakan customCss resmi dan selector scoped untuk dashboard/artikel. Nonaktifkan kontrol theme melalui konfigurasi/override resmi dan pertahankan light theme konsisten pada system dark. Uji komponen search, kode, dan badge setelah pemetaan.

## 10. Prompt penerapan visual

```text
Terapkan DESIGN-SYTEM.MD secara konsisten pada seluruh halaman knowledge base. Putih adalah warna dominan; hijau Linux Mint-inspired hanya aksen. Gunakan #3F6212 untuk tombol/tautan dan #87CF3E hanya sebagai dekorasi. Tidak ada aksen utama biru atau oranye. Gunakan system fonts, skala spacing 4 px, sidebar 256 px, header 64 px, kartu radius 8 px, border tipis, serta area artikel 72ch.
Bangun sidebar/header seperti pola dashboard pada referensi Cloudflare dengan identitas mandiri. Implementasikan seluruh state, responsive layout, fokus keyboard, dialog pencarian ⌘ K/Ctrl K, dan reduced motion. Jangan menghasilkan dashboard analitik fiktif. Verifikasi contrast dan overflow pada komponen nyata, jangan sekadar mencantumkan kepatuhan dalam README.
```
