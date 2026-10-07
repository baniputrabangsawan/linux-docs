---
title: Audio tidak terdeteksi setelah masuk desktop
sidebarLabel: Audio tidak terdeteksi
description: Pemeriksaan saat tidak ada kartu suara yang terlihat. Belum diuji pada perangkat tertentu.
category: perangkat-keras
kind: troubleshooting
platforms: [linux]
tags: [audio, alsa, perangkat]
status: unverified
updatedAt: "2026-10-02"
sources:
  - label: Situs proyek ALSA
    url: https://www.alsa-project.org/wiki/Main_Page
related: []
draft: false
pagefind: true
---

## Masalah

Desktop masuk tanpa suara dan alat audio menampilkan pesan `no sound cards found` atau daftar perangkat kosong.

## Lingkungan

Membutuhkan sesi desktop dan akses ke alat audio pengguna. Model kartu suara, distro, dan versi kernel tidak dicatat.

## Diagnosis

Catat keluaran alat yang menampilkan daftar kartu. Bandingkan dengan apakah perangkat terlihat di firmware atau dinonaktifkan di pengaturan desktop. Dugaan perangkat lunak dan dugaan perangkat bisu harus dipisah.

## Penyebab

Belum dikonfirmasi. Halaman ini tidak menyimpulkan bahwa kartu suara rusak.

## Langkah penyelesaian

Jangan memasang driver acak. Mulai dari pengaturan keluaran desktop dan pastikan perangkat tidak di-mute. Jika Anda mengubah berkas konfigurasi ALSA, simpan salinannya terlebih dahulu.

:::caution[Dampak]
Mengubah berkas di `/etc` membutuhkan hak yang lebih tinggi dan memengaruhi semua pengguna mesin itu.
:::

## Verifikasi

Putar berkas audio pendek setelah perangkat keluaran dipilih. Proyek ini tidak memiliki rekaman hasil uji.

## Pemulihan

Kembalikan berkas konfigurasi dari salinan. Cabut perubahan mute dari pengaturan desktop.

## Sumber dan batas penerapan

Nama perangkat harus diambil dari mesin Anda. Status: Belum terverifikasi.
