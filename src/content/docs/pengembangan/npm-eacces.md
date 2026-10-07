---
title: npm gagal dengan EACCES saat memasang paket global
sidebarLabel: npm EACCES
description: Cara membaca EACCES tanpa mengubah kepemilikan direktori sistem. Belum diuji.
category: pengembangan
kind: troubleshooting
platforms: [lintas-platform]
tags: [npm, izin, paket]
status: unverified
updatedAt: "2026-10-04"
sources:
  - label: Mengatasi EACCES npm
    url: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
related:
  - sistem-operasi/izin-berkas-ditolak
draft: false
pagefind: true
---

## Masalah

`npm install -g` berhenti dengan `EACCES: permission denied`. Pesan itu muncul saat npm mencoba menulis ke direktori global yang tidak dimiliki pengguna.

## Lingkungan

Berlaku di mesin yang memasang Node.js dan npm. Versi npm tidak dicatat. Platform ditandai lintas platform karena pesan yang sama muncul di lebih dari satu sistem operasi, tetapi tiap path tetap harus diperiksa.

## Diagnosis

Baca path di akhir pesan `EACCES`. Jika path berada di direktori sistem, jangan mengubah pemiliknya menjadi pengguna harian. Dugaan: npm global masih menunjuk ke direktori yang dilindungi. Dugaan belum diuji di sini.

## Penyebab

Dokumentasi npm menjelaskan beberapa pola izin. Proyek ini tidak mengonfirmasi pola mana yang terjadi pada mesin pembaca.

## Langkah penyelesaian

Utamakan pemasangan lokal proyek, bukan global. Jika prefix pengguna diperlukan, ikuti dokumentasi npm dan arahkan prefix ke direktori di dalam rumah Anda.

:::caution[Dampak]
`chown` pada direktori sistem mengubah pemilik berkas untuk seluruh mesin. Jangan menjalankan `chown -R` pada `/usr`.
:::

## Verifikasi

Ulangi pemasangan pada proyek lokal. Hilangnya `EACCES` hanya berarti penulisan ke path baru berhasil, dan itu harus Anda amati sendiri.

## Pemulihan

Kembalikan prefix npm ke nilai sebelumnya jika Anda mengubahnya. Jangan menghapus `node_modules` global tanpa daftar paket yang terpasang.

## Sumber dan batas penerapan

Artikel terkait izin berkas ada di kategori sistem operasi. Status: Belum terverifikasi.
