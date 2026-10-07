# PRD — Knowledge Base Troubleshooting Teknologi

Versi: 1.0 · Tanggal: 7 Oktober 2026 · Bahasa produk: Indonesia.
Nama kerja: **Catatan Solusi**. Nama ini placeholder yang dapat diganti melalui konfigurasi terpusat.

## 1. Tujuan produk

Bangun website dokumentasi publik untuk menyimpan, mencari, dan membaca penyelesaian masalah teknologi serta panduan konfigurasi. Cakupan meliputi sistem operasi, aplikasi, jaringan, perangkat keras, pengembangan website, server, dan tampilan desktop.

Tampilan mengikuti pola dashboard Cloudflare pada screenshot referensi: sidebar kiri, header horizontal, area konten terstruktur, kartu putih, border tipis, dan kepadatan informasi yang nyaman. Gunakan identitas sendiri dengan putih dominan dan aksen hijau terinspirasi Linux Mint. Jangan menggunakan logo, merek, atau elemen promosi Cloudflare/Linux Mint sebagai identitas produk.

Dokumentasi harus menjelaskan kondisi penerapan solusi. Jangan menyatakan suatu solusi teruji tanpa bukti pengujian.

## 2. Pengguna dan skenario

| Pengguna | Kebutuhan |
|---|---|
| Pembaca | Mencari pesan error, memahami konteks, mengikuti solusi, memeriksa hasil |
| Pemilik dokumentasi | Menulis dan memperbarui artikel melalui Markdown dan Git |
| Pengembang | Memelihara tampilan, skema konten, pencarian, dan build |

Skenario inti: pengguna membuka situs, menekan Ctrl K atau ⌘ K, memasukkan pesan error, membuka hasil yang cocok, memeriksa lingkungan artikel, mengikuti langkah, lalu menjalankan verifikasi.

## 3. Batas rilis awal

### Wajib

- Halaman pemilihan sistem operasi di `/`, lalu dashboard dokumentasi di `/dashboard/`.
- Daftar kategori, daftar artikel, halaman artikel, dan halaman 404.
- Sidebar kategori, breadcrumb, daftar isi artikel, dan navigasi mobile.
- Pencarian teks penuh menggunakan Pagefind; shortcut Ctrl K/⌘ K.
- Filter kategori, platform, dan status pada daftar artikel.
- Metadata artikel, badge status, sumber, tanggal pembaruan, artikel terkait.
- Blok kode dengan tombol salin, gambar dengan caption, dan callout.
- SEO dasar, aksesibilitas keyboard, layout responsif, serta build statis.

### Di luar rilis awal

Login, editor admin berbasis browser, database, komentar, chatbot, sinkronisasi akun, analitik eksternal, PWA, dan dark mode. Preferensi sistem operasi hanya lokal di peramban, bukan akun. Dashboard berisi ringkasan dokumentasi, bukan grafik analitik dengan angka buatan.

## 4. Tech stack

| Lapisan | Pilihan | Ketentuan |
|---|---|---|
| Framework | Astro | Output statis; rendering konten pada build |
| Dokumentasi | @astrojs/starlight | Gunakan fitur bawaan dan override resmi seperlunya |
| Bahasa | TypeScript | Konfigurasi strict; hindari any tanpa alasan |
| Konten | Markdown; MDX selektif | MDX hanya ketika membutuhkan komponen |
| Pencarian | Pagefind bawaan Starlight | Satu proses indexing; jangan membuat indeks ganda |
| Styling | CSS biasa + custom properties | Token dari DESIGN-SYTEM.MD; tanpa runtime styling |
| Font | System sans-serif + system monospace | Tidak mengunduh font pada rilis awal |
| Ikon | SVG inline / ikon bawaan Starlight | Gaya outline konsisten, tanpa icon font |
| Kontrol versi | Git | Konten dan konfigurasi memiliki riwayat perubahan |
| Package manager | npm | Commit package-lock.json; CI memakai npm ci |
| Kualitas | astro check, TypeScript, pemeriksa tautan | Jalankan sebelum publikasi |
| Uji alur penting | Playwright sebagai dev dependency | Pencarian, shortcut, dialog, filter, salin, mobile |
| Hosting | Penyedia hosting statis/CDN | Hasil dist/ bisa disajikan tanpa server aplikasi |

Gunakan versi stabil yang kompatibel pada waktu implementasi. Verifikasi persyaratan Node dan API dari dokumentasi resmi. Catat versi yang benar-benar terpasang dalam README; jangan mengarang nomor versi atau memakai versi prerelease tanpa kebutuhan.

Tidak perlu React, Next.js, TanStack Router, TanStack Query, Redux, atau backend untuk rilis awal. Routing berasal dari Astro/Starlight; interaksi kecil memakai script TypeScript. Evaluasi ulang hanya jika kebutuhan berubah.

## 5. Taksonomi konten

| Slug kategori | Label | Contoh cakupan |
|---|---|---|
| sistem-operasi | Sistem Operasi | Boot, update, permission, konfigurasi |
| aplikasi | Aplikasi | Instalasi, crash, dependensi, AppImage, Flatpak |
| desktop-tampilan | Desktop & Tampilan | Ikon, launcher, panel, tema, shortcut |
| jaringan | Jaringan | LAN, Wi-Fi, router, DNS, VPN |
| perangkat-keras | Perangkat Keras | Audio, Bluetooth, monitor, baterai, storage |
| pengembangan | Pengembangan | Kode, build, package, API, database, deployment |
| server-hosting | Server & Hosting | VPS, Docker, domain, SSL, reverse proxy |
| konfigurasi | Panduan Konfigurasi | Setup perangkat dan layanan |
| referensi-perintah | Referensi Perintah | Fungsi perintah, parameter, contoh |

Setiap artikel memiliki satu kategori utama dan beberapa tag lintas topik. Platform adalah dimensi terpisah: linux, windows, macos, lintas-platform. Nama distro dan versi dicatat dalam lingkungan pengujian, bukan dianggap berlaku untuk seluruh Linux.

## 6. Halaman dan perilaku

### Pemilihan sistem operasi

`/` menampilkan halaman “Pilih sistem operasi” tanpa sidebar dashboard. Empat pilihan: Linux, Windows, macOS, dan Semua platform. Klik kartu menyimpan preferensi lokal dan membuka `/dashboard/`. Preferensi valid pada kunjungan berikutnya langsung masuk dashboard, kecuali mode ganti (`/?change=1`) atau navigasi Back. Query `platform` yang valid mengalahkan nilai tersimpan. Tidak ada login dan tidak ada deteksi otomatis dari perangkat.

### Dashboard

`/dashboard/` memakai shell sidebar dan header. Area utama memuat platform aktif, kontrol “Ganti sistem operasi”, jumlah artikel yang sesuai pilihan, jumlah kategori yang berisi artikel tersebut, artikel terbaru berdasarkan updatedAt, dan kartu kategori yang relevan. Jumlah dihitung dari konten publik dan metadata `platforms`, bukan angka hardcoded. Linux, Windows, dan macOS juga menampilkan artikel lintas-platform. “Semua platform” menampilkan seluruh artikel publik. `/dashboard/` tanpa preferensi atau query valid kembali ke pemilihan.

### Daftar kategori

Judul kategori, deskripsi, jumlah artikel, filter platform/status, dan daftar artikel. Kartu menampilkan judul, ringkasan, platform, status, dan tanggal pembaruan. Filter tercermin dalam query string dan bertahan setelah reload. Halaman tetap menyediakan seluruh daftar tanpa JavaScript; script hanya memperbaiki pengalaman penyaringan.

### Artikel

Breadcrumb, judul, ringkasan, metadata, status, lingkungan, daftar isi, isi solusi, sumber, dan artikel terkait. Panjang area baca sekitar 65–75 karakter per baris. Heading memiliki anchor yang stabil. Artikel terkait berdasarkan referensi ID eksplisit atau irisan tag, dengan hasil deterministik.

Template penyelesaian masalah:
1. Masalah dan gejala/pesan error.
2. Lingkungan yang diuji atau kondisi yang disyaratkan.
3. Diagnosis dan hasil pemeriksaan.
4. Penyebab terkonfirmasi; pisahkan dugaan.
5. Langkah penyelesaian berurutan.
6. Verifikasi hasil.
7. Pemulihan jika perubahan perlu dibatalkan.
8. Sumber dan catatan batas penerapan.

Panduan konfigurasi dan referensi perintah boleh memakai struktur yang sesuai, tanpa memaksakan kolom diagnosis yang tidak relevan.

### Pencarian cepat

- Pemicu berada di sidebar desktop; ikon pencarian berlabel pada header mobile.
- Badge menunjukkan ⌘ K pada macOS dan Ctrl K pada Windows/Linux. Gunakan elemen kbd; simbol ⌘ berupa teks, bukan gambar.
- Klik atau kombinasi keyboard membuka satu dialog. Prevent default hanya untuk kombinasi yang ditangani; jangan membuat dua handler dari komponen bawaan dan custom.
- Fokus langsung masuk ke input. Esc menutup, fokus kembali ke pemicu, dan fokus tidak keluar dari dialog saat terbuka.
- ↑/↓ memilih hasil dan Enter membuka hasil yang dipilih. Tab tetap menavigasi kontrol secara wajar. Jangan mengaku memiliki perilaku ini jika UI bawaan belum menyediakannya; lengkapi adapter dan uji.
- Cari judul dan isi artikel. Tag, kategori, platform, dan status diproyeksikan ke indeks/metadata Pagefind sesuai API versi terpasang.
- Render state awal, loading, hasil, kosong, dan gagal dengan pesan Indonesia. Kegagalan memuat indeks menyediakan tombol Coba lagi dan akses kategori.
- Muat modul pencarian secara lazy saat diperlukan; pastikan indeks tersedia pada hasil build, bukan hanya development server.
- Pada mobile dialog hampir memenuhi lebar layar dan tetap dapat digunakan saat keyboard virtual terbuka.

### Blok kode

Tampilkan nama bahasa, syntax highlighting, scroll horizontal lokal, dan tombol salin. Tombol menyalin kode asli tanpa nomor baris atau dekorasi, mengumumkan Berhasil disalin melalui aria-live, dan menangani clipboard gagal. Perintah yang menghapus data atau mengubah sistem wajib diberi konteks dampak tepat di dekat perintah.

## 7. Data dan integritas konten

Field wajib: title, description, category, kind, platforms, tags, status, updatedAt. Field bersyarat: testedAt dan testedEnvironment wajib untuk status verified. Field opsional: related, sources, draft.

Status internal dan label:
- verified → Teruji: ada tanggal dan lingkungan pengujian konkret.
- unverified → Belum terverifikasi: panduan belum dibuktikan pada lingkungan yang dicatat.
- investigating → Dalam diagnosis: masalah belum memiliki penyelesaian final.

Tanggal ISO, tidak lebih dari tanggal penerbitan. Validasi kategori, status, ID terkait, serta URL sumber pada build. Draft tidak masuk halaman publik, statistik, sidebar, maupun indeks pencarian. Kebijakan draft harus diverifikasi terhadap kemampuan versi Starlight terpasang; jangan mengasumsikan field custom otomatis menyembunyikan halaman.

Konten contoh harus ditulis dalam bahasa Indonesia dan ditandai unverified. Jangan menganggap percakapan atau contoh perintah sebagai bukti keberhasilan. Jangan menyalin identitas, akun, token, IP privat, atau data sensitif dari screenshot ke artikel contoh.

## 8. Nonfunctional requirements

- Mobile mulai 360 px tanpa scroll horizontal halaman; kode/tabel dapat scroll di kontainernya.
- Target WCAG 2.2 AA: teks normal 4.5:1, teks besar dan komponen relevan 3:1. Verifikasi pasangan token sebelum digunakan.
- Konten inti dan navigasi dapat dibaca tanpa JavaScript.
- Gambar memiliki alt, ukuran intrinsik, dan lazy loading di bawah fold.
- Tidak ada permintaan font eksternal, autoplay media, atau animasi besar.
- Target Core Web Vitals produksi: LCP ≤2,5 detik, INP ≤200 ms, CLS ≤0,1 pada persentil ke-75 bila data lapangan tersedia. Angka ini target, bukan hasil yang dijanjikan.
- Target Lighthouse mobile terkontrol ≥90 untuk performance dan ≥95 accessibility; laporkan kondisi pengukuran. Aksesibilitas tidak dinilai dari skor saja.
- Gunakan HTTPS dan kebijakan keamanan yang cocok dengan output Astro; jangan memasang CSP yang memblokir script bawaan tanpa pengujian.
- Sitemap, canonical, description unik, judul halaman, dan halaman 404. URL produksi wajib dikonfigurasi sebelum canonical/sitemap diterbitkan.

## 9. Acceptance criteria

| ID | Hasil yang harus terbukti |
|---|---|
| AC-01 | Semua kategori, artikel, dan jumlah beranda berasal dari konten publik |
| AC-02 | ⌘ K/Ctrl K membuka dialog sekali; Esc dan pengembalian fokus bekerja |
| AC-03 | Pencarian menemukan artikel dari judul dan pesan error pada production preview |
| AC-04 | Navigasi hasil memakai keyboard dan state kosong/gagal dapat digunakan |
| AC-05 | Filter platform/status bekerja, URL dapat dibagikan, reload mempertahankan pilihan |
| AC-06 | Tombol salin menghasilkan kode persis dan menangani kegagalan |
| AC-07 | Status Teruji ditolak bila metadata pengujian tidak lengkap |
| AC-08 | Draft tidak ditemukan melalui URL publik, sidebar, statistik, atau pencarian |
| AC-09 | Desktop dan mobile mengikuti DESIGN-SYTEM.MD; tidak ada overflow halaman |
| AC-10 | Type check dan build lulus; tidak ada tautan internal atau referensi artikel rusak |
| AC-11 | Tidak ada logo Cloudflare/Linux Mint atau statistik fiktif dalam identitas produk |
| AC-12 | README menyertakan setup, penulisan artikel, perintah pemeriksaan, dan batas yang diketahui |

## 10. Prompt implementasi utama

Salin blok berikut sebagai instruksi implementasi. Sertakan ketiga dokumen ini dalam workspace.

```text
Bertindak sebagai pengembang frontend senior yang membangun knowledge base troubleshooting teknologi. Implementasikan website sesuai PRD.MD, DESIGN-SYTEM.MD, dan ARCHITECTURE.md. Bahasa UI dan artikel adalah Indonesia. Nama kerja produk Catatan Solusi harus dapat diganti dari konfigurasi terpusat.

Selesaikan implementasi fungsional, bukan sekadar mockup. Jika repository sudah ada, periksa struktur, konfigurasi, lockfile, dan instruksi proyek terlebih dahulu. Pertahankan pekerjaan pengguna yang tidak terkait. Jika repository kosong, scaffold Astro dengan Starlight menggunakan versi stabil kompatibel dan TypeScript strict. Verifikasi API dan persyaratan runtime pada dokumentasi resmi versi yang terpasang; jangan memakai nomor versi atau API berdasarkan dugaan.

Gunakan output statis, Markdown sebagai format artikel utama, MDX selektif, Pagefind bawaan Starlight, CSS custom properties, system sans-serif, system monospace, dan SVG. Hindari penambahan framework UI, runtime state manager, backend, database, atau server pencarian yang tidak dibutuhkan. Commit satu lockfile. Gunakan mekanisme override Starlight resmi dan pertahankan fitur aksesibilitas serta slot bawaan.

Bangun dashboard putih dominan dengan sidebar kiri, header horizontal, kartu berborder tipis, dan aksen hijau sesuai token. Ambil pola tata letak dari dashboard Cloudflare tanpa menyalin merek/logonya. Hijau cerah hanya untuk dekorasi; gunakan hijau gelap untuk teks interaktif dan tombol putih. Jangan mengganti aksen dengan biru atau oranye. Rilis awal hanya light mode. Buat tampilan mobile yang lengkap.

Implementasikan beranda dari data konten, kategori, daftar artikel dengan filter URL, artikel lengkap dengan daftar isi dan metadata, serta 404. Jangan menampilkan grafik palsu atau angka hardcoded. Terapkan validasi skema, tanggal, kategori, referensi terkait, dan syarat status teruji. Draft harus benar-benar tidak terbit atau terindeks. Jangan mengklaim suatu solusi teruji berdasarkan contoh atau percakapan.

Implementasikan satu dialog pencarian Pagefind dengan pemicu di sidebar dan mobile header. Badge macOS memakai ⌘ K; Windows/Linux memakai Ctrl K. Klik dan keyboard membuka dialog, fokus masuk ke input, panah memilih hasil, Enter membuka, Esc menutup, fokus kembali ke pemicu. Tangani state awal/loading/hasil/kosong/gagal. Jangan menggandakan listener bawaan. Search harus berfungsi pada production build dan memuat modul secara lazy.

Sediakan tombol salin kode yang menyalin isi asli dan menangani clipboard gagal. Artikel memiliki sumber, tanggal pembaruan, status, lingkungan penerapan, verifikasi, serta pemulihan bila relevan. Buat sedikitnya satu artikel contoh per kategori dengan konten yang masuk akal, status Belum terverifikasi, dan tanpa data pribadi. Contoh pertama adalah integrasi Pen AppImage ke panel Linux Mint dan penggunaan ikon bawaan; jelaskan bahwa path dan lingkungan harus disesuaikan dan hasil belum diuji oleh proyek ini.

Lengkapi SEO, aksesibilitas keyboard, fokus, alt gambar, reduced motion, loading/empty/error states, dan fallback konten tanpa JavaScript. Optimalkan gambar dan hindari font eksternal. Pakai nama komponen, file, dan tanggung jawab dari ARCHITECTURE.md; adaptasi kecil untuk API framework aktual harus dicatat.

Jalankan type check, build, pemeriksaan tautan, dan pengujian alur penting pada production preview. Uji shortcut kedua platform, fokus dialog, pencarian pesan error, filter/reload, salin kode, draft exclusion, serta mobile. Laporkan hasil nyata dan batas yang belum diverifikasi; jangan mengarang skor performance atau menyatakan tes lulus tanpa menjalankannya. Jangan mempublikasikan deployment sebelum diminta. Serahkan kode lengkap, README, versi runtime/paket aktual, dan ringkasan pemeriksaan.
```

## 11. Referensi teknis

- Astro Islands: https://docs.astro.build/en/concepts/islands/
- Struktur Starlight: https://starlight.astro.build/guides/project-structure/
- Override Starlight: https://starlight.astro.build/guides/overriding-components/
- Search Starlight: https://starlight.astro.build/guides/site-search/
- Pagefind: https://pagefind.app/docs/

Dokumentasi resmi menjadi rujukan API. Detail produk, ukuran, dan target di atas adalah keputusan proyek.
