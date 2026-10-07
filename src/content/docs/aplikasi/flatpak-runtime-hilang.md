---
title: Flatpak gagal karena runtime tidak terpasang
sidebarLabel: Runtime Flatpak hilang
description: Apa yang diperiksa saat Flatpak menolak menjalankan aplikasi karena runtime hilang. Belum diuji.
category: aplikasi
kind: troubleshooting
platforms: [linux]
tags: [flatpak, runtime, dependensi]
status: unverified
updatedAt: "2026-10-04"
sources:
  - label: Konsep dasar Flatpak
    url: https://docs.flatpak.org/en/latest/basic-concepts.html
related: []
draft: false
pagefind: true
---

## Masalah

Peluncur Flatpak tidak membuka aplikasi dan menampilkan pesan semacam `runtime tidak ditemukan`. Nama runtime berbeda tiap aplikasi.

## Lingkungan

Membutuhkan `flatpak` pada PATH dan akses ke repositori yang sudah dikonfigurasi pengguna. Versi Flatpak tidak dicatat.

## Diagnosis

Jalankan `flatpak info` pada ID aplikasi untuk melihat runtime yang diminta. Bandingkan dengan `flatpak list --runtime`. Jika ID aplikasi tidak diketahui, jangan menebak.

## Penyebab

Belum dikonfirmasi. Runtime yang hilang adalah penjelasan yang sering muncul di dokumentasi Flatpak, bukan temuan pengujian proyek ini.

## Langkah penyelesaian

:::caution[Dampak]
Memasang runtime mengunduh paket dan memakai ruang disk. Batalkan hanya jika Anda tahu ID runtime yang baru dipasang.
:::

Pasang runtime yang disebutkan pesan error, bukan runtime acak. Contoh bentuk perintah:

```bash
flatpak install flathub org.freedesktop.Platform//23.08
```

Ganti ID dan cabang dengan nilai dari pesan aplikasi Anda.

## Verifikasi

Buka kembali aplikasi. Jika pesan runtime hilang, ketergantungan yang diminta sudah ada. Hasil itu belum diamati di sini.

## Pemulihan

`flatpak uninstall` pada ID runtime yang baru dipasang menghapus runtime itu dari pengguna. Jangan menghapus runtime yang masih dipakai aplikasi lain.

## Sumber dan batas penerapan

ID pada contoh adalah ilustrasi. Status: Belum terverifikasi.
