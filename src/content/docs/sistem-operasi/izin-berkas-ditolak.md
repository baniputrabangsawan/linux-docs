---
title: Mengatasi pesan Permission denied pada berkas milik pengguna
sidebarLabel: Permission denied
description: Pemeriksaan izin saat perintah menampilkan Permission denied. Belum diuji pada lingkungan yang dicatat.
category: sistem-operasi
kind: troubleshooting
platforms: [linux]
tags: [izin, permission, berkas]
status: unverified
updatedAt: "2026-10-05"
sources:
  - label: chmod pada manual GNU coreutils
    url: https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html
related: []
draft: false
pagefind: true
---

## Masalah

Perintah berhenti dengan pesan `Permission denied` saat membaca atau menjalankan berkas di direktori rumah. Artikel ini tidak mencakup berkas sistem di `/etc` atau `/usr`.

## Lingkungan

Dibutuhkan akun yang memiliki direktori rumah dan dapat menjalankan `ls` serta `chmod`. Distro dan versi tidak dicatat karena halaman ini belum diuji.

## Diagnosis

Catat path persis dari pesan error. Bandingkan pemilik dan mode dengan `ls -l`. Dugaan umum adalah bit eksekusi atau tulis tidak aktif untuk pengguna tersebut. Dugaan itu belum dikonfirmasi di proyek ini.

## Penyebab

Penyebab final belum ada. Jangan menyamakan setiap `Permission denied` dengan izin berkas; mount read-only atau kebijakan keamanan juga dapat menghasilkan pesan yang sama.

## Langkah penyelesaian

:::caution[Dampak]
`chmod` mengubah izin berkas yang disebut. Perintah contoh hanya menyentuh satu berkas di direktori rumah dan tidak menghapus isinya.
:::

```bash
chmod u+x /home/pengguna/bin/alat-lokal
```

Ganti path dengan berkas yang benar-benar gagal. Jangan menjalankan `chmod -R` pada direktori rumah.

## Verifikasi

Ulangi perintah yang sebelumnya gagal. Jika pesan `Permission denied` hilang, izin pengguna pada berkas itu berubah. Proyek ini belum mengamati hasil tersebut.

## Pemulihan

Kembalikan mode sebelumnya jika Anda mencatatnya, misalnya `chmod u-x` pada berkas yang sama.

## Sumber dan batas penerapan

Contoh path harus diganti. Status: Belum terverifikasi.
