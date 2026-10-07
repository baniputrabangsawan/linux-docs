---
title: systemctl untuk melihat dan mengubah unit
sidebarLabel: systemctl
description: Referensi singkat systemctl. Contoh yang mengubah layanan harus dipahami dampaknya dan belum diuji di sini.
category: referensi-perintah
kind: command-reference
platforms: [linux]
tags: [systemctl, systemd, perintah]
status: unverified
updatedAt: "2026-10-01"
sources:
  - label: systemctl(1)
    url: https://www.freedesktop.org/software/systemd/man/latest/systemctl.html
related: []
draft: false
pagefind: true
---

## Fungsi

`systemctl` berkomunikasi dengan systemd untuk menampilkan status unit dan, bila diminta, mengubah apakah unit berjalan.

## Bentuk umum

```text
systemctl [perintah] [unit]
```

Tanpa perintah ubah, banyak pemanggilan hanya membaca status. Itu tetap bergantung pada versi systemd yang terpasang.

## Parameter yang sering dipakai

- `status` menampilkan keadaan unit.
- `start`, `stop`, dan `restart` mengubah apakah unit berjalan.
- `--user` membatasi operasi ke manajer pengguna, bila fitur itu tersedia.

Nama unit pada mesin Anda tidak boleh dianggap sama dengan contoh.

## Contoh

Melihat status tidak menghentikan layanan:

```bash
systemctl status ssh.service
```

:::caution[Dampak]
`systemctl restart` menghentikan lalu menjalankan ulang unit. Koneksi yang dilayani unit itu dapat terputus. Jangan menjalankan contoh ini pada layanan yang sedang dipakai orang lain.
:::

```bash
systemctl restart ssh.service
```

Nama `ssh.service` adalah contoh. Beberapa sistem memakai nama unit lain.

## Batas penerapan

Halaman ini bukan transkrip sesi yang berhasil. Status artikel: Belum terverifikasi. Keluaran perintah bergantung pada versi systemd dan hak pengguna.
