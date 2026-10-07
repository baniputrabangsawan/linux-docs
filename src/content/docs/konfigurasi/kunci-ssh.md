---
title: Menyiapkan kunci SSH untuk akun sendiri
sidebarLabel: Kunci SSH
description: Urutan penyiapan kunci SSH tanpa kata sandi di dalam repositori. Belum diuji pada server tertentu.
category: konfigurasi
kind: configuration
platforms: [linux]
tags: [ssh, kunci, konfigurasi]
status: unverified
updatedAt: "2026-10-03"
sources:
  - label: Manual OpenSSH
    url: https://www.openssh.com/manual.html
related: []
draft: false
pagefind: true
---

## Tujuan

Membuat pasangan kunci SSH di komputer Anda dan menyiapkan berkas konfigurasi klien agar nama host tidak ditulis berulang. Halaman ini tidak memasang kunci ke server.

## Syarat

`ssh-keygen` tersedia. Anda memiliki direktori `~/.ssh` yang hanya dapat dibaca pemiliknya. Jangan menyimpan kunci privat di artikel, tiket, atau tangkapan layar.

## Langkah

:::caution[Dampak]
`ssh-keygen` menulis berkas kunci baru. Jika path sudah ada, alat itu dapat menolak menimpa atau, bila Anda memaksa, mengganti kunci lama. Gunakan nama berkas yang belum ada.
:::

```bash
ssh-keygen -t ed25519 -f /home/pengguna/.ssh/id_contoh -C "catatan-solusi"
```

Ganti path dan komentar. Komentar contoh bukan identitas akun sungguhan.

Berkas konfigurasi klien dapat memuat `Host` dan `IdentityFile`. Jangan menulis kata sandi atau kunci privat di berkas Markdown.

## Verifikasi

`ssh-keygen -l -f` pada berkas publik menampilkan sidik jari. Proyek ini tidak menghasilkan sidik jari contoh karena tidak membuat kunci.

## Pemulihan

Hapus hanya berkas kunci contoh yang baru dibuat. Jangan menghapus `~/.ssh` secara utuh.

## Batas penerapan

Server tujuan, pengguna, dan port harus Anda isi sendiri. Status: Belum terverifikasi.
