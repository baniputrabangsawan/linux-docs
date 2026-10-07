---
title: Situs menolak koneksi karena sertifikat kedaluwarsa
sidebarLabel: Sertifikat kedaluwarsa
description: Pemeriksaan saat klien melaporkan certificate has expired. Bukan bukti bahwa sertifikat tertentu sudah diperbarui.
category: server-hosting
kind: troubleshooting
platforms: [linux]
tags: [ssl, sertifikat, hosting]
status: unverified
updatedAt: "2026-10-02"
sources:
  - label: FAQ Let's Encrypt
    url: https://letsencrypt.org/docs/faq/
related: []
draft: false
pagefind: true
---

## Masalah

Peramban atau klien HTTPS menampilkan `certificate has expired`. Pengunjung tidak dapat memercayai nama host sampai sertifikat yang disajikan masih berlaku.

## Lingkungan

Membutuhkan akses baca ke konfigurasi server yang Anda kelola. Nama host, alamat IP, dan isi sertifikat tidak boleh disalin ke artikel publik.

## Diagnosis

Catat tanggal kedaluwarsa dari pesan klien dan bandingkan dengan sertifikat yang benar-benar disajikan server. Dugaan: proses perpanjangan berhenti. Dugaan itu belum dibuktikan di sini.

## Penyebab

Belum dikonfirmasi. Sertifikat kedaluwarsa, rantai sertifikat yang salah, dan jam sistem yang bergeser dapat menghasilkan gejala serupa.

## Langkah penyelesaian

Perpanjang sertifikat lewat mekanisme yang sudah dipakai server itu, lalu muat ulang layanan yang menyajikan sertifikat. Jangan menempelkan kunci privat ke dokumentasi.

:::caution[Dampak]
Memuat ulang layanan web memutus koneksi yang sedang berjalan. Lakukan pada jendela yang Anda siapkan.
:::

## Verifikasi

Buka nama host yang sama dan periksa tanggal sertifikat yang disajikan. Proyek ini tidak melakukan pemeriksaan itu.

## Pemulihan

Jika konfigurasi baru salah, kembalikan berkas konfigurasi dan sertifikat dari salinan sebelum pemuatan ulang.

## Sumber dan batas penerapan

Nama penerbit sertifikat berbeda-beda. Status: Belum terverifikasi.
