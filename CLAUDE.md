# Product Requirement Document (PRD)

## EcoPoint – Aplikasi Pengelolaan Sampah Berbasis AI dan Reward

### Version

1.0

### Product Owner

Tim Pengembang EcoPoint

### Tanggal

Juni 2026

---

# 1. Latar Belakang

Kesadaran masyarakat terhadap pengelolaan sampah masih relatif rendah. Banyak sampah yang sebenarnya dapat didaur ulang namun berakhir di tempat pembuangan akhir karena kurangnya edukasi dan insentif bagi masyarakat.

EcoPoint hadir sebagai platform yang memanfaatkan teknologi Artificial Intelligence (AI) untuk membantu masyarakat mengidentifikasi jenis sampah, mencatat kontribusi daur ulang, serta memperoleh reward berupa poin yang dapat ditukarkan dengan voucher dari merchant mitra.

---

# 2. Tujuan Produk

### Tujuan Utama

Meningkatkan partisipasi masyarakat dalam pengelolaan sampah dan daur ulang melalui sistem reward berbasis poin.

### Tujuan Bisnis

* Meningkatkan jumlah sampah yang berhasil didaur ulang.
* Memberikan insentif kepada masyarakat untuk memilah sampah.
* Membangun ekosistem digital antara masyarakat, petugas pengelola sampah, dan merchant mitra.
* Menyediakan data statistik pengelolaan sampah yang terukur.

---

# 3. Aktor Sistem

## User

Masyarakat yang melakukan scan dan pengumpulan sampah.

### Hak Akses

* Scan sampah menggunakan AI.
* Melihat riwayat scan.
* Mengajukan klaim sampah.
* Melihat saldo poin.
* Menukar poin dengan voucher.
* Melihat statistik kontribusi sampah.

---

## Petugas

Petugas pengelola sampah yang melakukan verifikasi fisik.

### Hak Akses

* Melihat daftar pengajuan.
* Memverifikasi jenis sampah.
* Menimbang sampah.
* Menyetujui atau menolak pengajuan.
* Mengoreksi data pengajuan jika diperlukan.

---

# 4. Jenis Sampah yang Didukung

Sistem hanya mendukung 7 jenis sampah berikut:

1. Plastic
2. Paper
3. Cardboard
4. Metal
5. Battery
6. Clothes
7. Shoes

Jenis sampah lain tidak termasuk dalam cakupan versi pertama aplikasi.

---

# 5. Alur Bisnis

## Langkah 1 – Scan Sampah

User melakukan scan menggunakan kamera smartphone.

AI akan mendeteksi:

* Jenis sampah
* Estimasi jumlah sampah

Hasil scan disimpan sebagai draft pengajuan.

---

## Langkah 2 – Pengajuan Klaim

User memilih hasil scan dan membuat pengajuan klaim.

Data yang dikirim:

* Jenis sampah
* Jumlah estimasi
* Foto hasil scan
* Waktu pengajuan

Status:

MENUNGGU_VERIFIKASI

---

## Langkah 3 – Penyerahan Sampah

User menyerahkan sampah fisik kepada petugas pada lokasi pengumpulan.

---

## Langkah 4 – Verifikasi Petugas

Petugas memeriksa:

* Kesesuaian jenis sampah
* Kondisi sampah
* Berat sampah aktual

Petugas dapat:

* Approve
* Reject
* Mengoreksi data

---

## Langkah 5 – Perhitungan Poin

Poin dihitung berdasarkan:

Poin = Berat Sampah (kg) × Nilai Poin per Kg

Contoh:

Plastic = 10 poin/kg
Paper = 5 poin/kg
Cardboard = 8 poin/kg
Metal = 20 poin/kg
Battery = 50 poin/kg
Clothes = 15 poin/kg
Shoes = 25 poin/kg

Contoh perhitungan:

Plastic = 2 kg × 10 = 20 poin
Metal = 1 kg × 20 = 20 poin

Total = 40 poin

---

## Langkah 6 – Poin Masuk

Setelah pengajuan disetujui:

* Saldo poin user bertambah.
* Riwayat transaksi tercatat.

---

## Langkah 7 – Penukaran Voucher

User dapat menukarkan poin menjadi voucher dari merchant mitra.

Contoh:

100 poin = Voucher Rp10.000
250 poin = Voucher Rp25.000
500 poin = Voucher Rp50.000

---

# 6. Fitur Utama

## Modul User

### Login dan Registrasi

* Registrasi akun
* Login
* Logout

### Scan Sampah

* Kamera AI
* Deteksi jenis sampah
* Penyimpanan hasil scan

### Pengajuan Klaim

* Membuat pengajuan
* Melihat status pengajuan

### Poin dan Reward

* Saldo poin
* Riwayat poin
* Penukaran voucher

### Statistik

* Total sampah terkumpul
* Total berat sampah
* Total poin
* Statistik per jenis sampah

---

## Modul Petugas

### Verifikasi Pengajuan

* Daftar pengajuan
* Detail pengajuan
* Approve atau Reject

### Penimbangan

* Input berat aktual
* Koreksi data jika diperlukan

### Monitoring

* Total sampah terkumpul
* Total user aktif
* Total poin yang telah diberikan

---

# 7. Dashboard User

Menampilkan:

* Total poin
* Total pengajuan
* Total berat sampah
* Statistik berdasarkan jenis sampah

Contoh:

Plastic : 25 kg
Paper : 12 kg
Metal : 8 kg
Cardboard : 10 kg
Battery : 2 kg
Clothes : 6 kg
Shoes : 3 kg

---

# 8. Dashboard Petugas

Menampilkan:

* Jumlah pengajuan menunggu verifikasi
* Total sampah yang telah diverifikasi
* Total berat sampah
* Total poin yang telah diberikan

---

# 9. Pencegahan Kecurangan

* Poin tidak diberikan saat scan.
* Poin hanya diberikan setelah verifikasi petugas.
* Sampah fisik wajib diserahkan.
* Berat aktual digunakan sebagai dasar perhitungan poin.
* Petugas dapat menolak pengajuan yang tidak sesuai.
* Semua aktivitas tercatat dalam sistem.

---

# 10. Target MVP

Versi pertama aplikasi harus mendukung:

* Login dan registrasi
* Scan sampah menggunakan AI
* Pengajuan klaim
* Verifikasi petugas
* Penimbangan sampah
* Perhitungan poin
* Penukaran voucher
* Dashboard statistik dasar

Fitur seperti leaderboard, badge, marketplace reward, dan integrasi e-wallet dapat dikembangkan pada versi berikutnya.
