---
title: DNS gagal dengan Temporary failure in name resolution
sidebarLabel: DNS gagal
description: Pemeriksaan awal saat resolver tidak dapat mengubah nama host. Belum diuji pada jaringan tertentu.
category: jaringan
kind: troubleshooting
platforms: [linux]
tags: [dns, resolver, jaringan]
status: unverified
updatedAt: "2026-10-03"
sources:
  - label: resolved.conf
    url: https://www.freedesktop.org/software/systemd/man/latest/resolved.conf.html
related: []
draft: false
pagefind: true
---

## Masalah

Perintah jaringan berhenti dengan `Temporary failure in name resolution`. Browser atau klien lain juga gagal membuka nama host, sementara alamat IP yang sudah diketahui masih bisa diuji terpisah.

## Lingkungan

Berlaku untuk mesin Linux yang memakai resolver lokal. Nama distro, versi systemd, dan alamat resolver tidak dicatat. Jangan menaruh alamat IP privat kantor ke artikel.

## Diagnosis

Catat apakah kegagalan terjadi untuk semua nama atau satu nama. Pisahkan kegagalan DNS dari kegagalan rute. Dugaan: resolver tidak menjawab atau konfigurasi DNS kosong. Dugaan itu belum diuji di sini.

## Penyebab

Belum ada penyebab terkonfirmasi. Mengganti DNS publik bukan perbaikan yang dibuktikan proyek ini.

## Langkah penyelesaian

:::caution[Dampak]
Mengubah konfigurasi resolver mengubah cara mesin mencari nama. Simpan salinan berkas sebelum mengedit, dan jangan menimpa konfigurasi yang dikelola jaringan kantor tanpa izin.
:::

Periksa status resolver yang terpasang, misalnya `resolvectl status` bila systemd-resolved dipakai. Catat server DNS yang terlihat, tanpa menyalinnya ke dokumentasi publik bila itu alamat internal.

## Verifikasi

Ulangi pencarian nama yang gagal. Hilangnya pesan `Temporary failure in name resolution` adalah tanda yang perlu Anda amati sendiri.

## Pemulihan

Kembalikan berkas konfigurasi dari salinan yang Anda simpan. Jangan menghapus seluruh direktori konfigurasi jaringan.

## Sumber dan batas penerapan

Langkah ini adalah daftar pemeriksaan, bukan resep yang sudah dibuktikan. Status: Belum terverifikasi.
