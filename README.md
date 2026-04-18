# 📦 Smart Parcel Locker - Full Documentation

Dokumen ini adalah kristalisasi (gabungan) dari seluruh spesifikasi antarmuka dan REST API terbaru proyek Smart Locker, termasuk pembaruan _Enterprise Phase 2_.

## 🎨 1. Arsitektur Frontend (Mobile App)

- **Framework:** React Native dengan Expo.
- **Paradigma Desain:** _Dark Mode_ modern (Gaya "Liquid Glass").
  - **Background:** Hitam Pekat & Abu-abu arang.
  - **Aksen Utama:** Biru Terang (Primary).
  - **Teks:** Putih & Abu-abu Terang.
- **Sistem Navigasi:**
  - Stack Navigation untuk otentikasi (Gateway Login, Register, Lupa Password).
  - Floating Tab Navigation untuk antarmuka dalam.
- **Role Pengguna:** `ADMIN` (Forensik/Superuser), `COURIER` (Pengantar Paket), `USER` (Penerima).

## 🔗 2. Spesifikasi API Lengkap (Node.js & IoT Integrations)

**Base URL:** `http://<IP_KOMPUTER_LOKAL>:3000/api`
**Header Wajib:** `Authorization: Bearer <TOKEN_JWT>`

### A. Autentikasi & Akun (`/api/auth` & `/api/users`)

| Method | Endpoint                    | Payload (JSON)                    | Deskripsi                                                                                   |
| ------ | --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/register`        | `{ email, password, name, role }` | Pendaftaran akun baru ke sistem database.                                                   |
| `POST` | `/api/auth/login`           | `{ email, password }`             | Login untuk menghasilkan (JWT) token sesi.                                                  |
| `POST` | `/api/auth/forgot-password` | `{ email }`                       | Trigger pengiriman email berisi kode 6 angka OTP reset password ke email User.              |
| `POST` | `/api/auth/verify-otp`      | `{ email, otp }`                  | Memeriksa kecocokan token angka OTP yang diketikkan di HP pengguna.                         |
| `POST` | `/api/auth/reset-password`  | `{ email, otp, newPassword }`     | Me-replace password di database berbekal tiket OTP dari validasi sebelumnya.                |
| `POST` | `/api/users/push-token`     | `{ pushToken }`                   | **(Background Tugas Aplikasi):** Mendaftarkan Notification Push ID milik HP User ke Server. |

### B. Transmisi Loker & Logistik (`/api/packages`)

_(Endpoint di bawah ini secara asinkronus akan memerintah Relay MQTT/IoT pada Hardware NodeMCU/ESP32 untuk menghidupkan solenoid pintu)._
| Method | Endpoint | Role Akses | Deskripsi Teknis |
|---|---|---|---|
| `GET` | `/api/packages/my-packages` | `Semua (Login)` | Menarik daftar paket milik User bersangkutan beserta Info Dendanya (`isPaid` & `overtimeFee`). |
| `POST`| `/api/packages/drop` | `COURIER` / `ADMIN` | Menscan kode resi, sistem Server mencari loker Kosong & Trigger Pintu IoT Terbuka Cepat (Notif dikirim langsung). |
| `POST`| `/api/packages/pickup` | `Semua` | Menarik paket keluar. **Aturan Sakti:** Jika user belum bayar denda, Server menolak dengan Response `403` berisi `errorCode: "UNPAID_PENALTY"` & nilai nominal ganti ruginya. |

### C. Pembayaran / Payment Gateway (`/api/payments`)

| Method | Endpoint               | Payload (JSON)     | Deskripsi                                                                                                                                |
| ------ | ---------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/payments/create` | `{ trackingCode }` | Memanggil layanan _Midtrans/Web Payment_ bila User gagal (`403`) mengambil paket akibat paket dibiarkan terlalu lama di mesin (>48 Jam). |

### D. Audit Mesin & Data Center (`/api/lockers` & `/api/logs`)

| Method | Endpoint                 | Role    | Deskripsi                                                                                                                                 |
| ------ | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/lockers`           | `Bebas` | Melihat Status Relasi Diagram seluruh Loker + Paket yang tertanam di dalamnya secara real-time.                                           |
| `GET`  | `/api/lockers/available` | `Bebas` | Menyaring secara database loker mana yang pintunya belum dipakai barang (opsional difilter dengan `?size=medium`).                        |
| `POST` | `/api/lockers/:id/open`  | `ADMIN` | Titik Force-Unlock (Buka Paksa) pintu secara kendali jarak jauh (Otomatis log pencatatan berjalan).                                       |
| `GET`  | `/api/logs`              | `ADMIN` | Menarik tabel Database Log berisi riwayat sensor _Forensik Buka Tutup Loker_, melacak siapa dan kapan mesin dibuka hingga skala detiknya. |
