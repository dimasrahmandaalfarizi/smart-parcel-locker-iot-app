# Smart Locker - Frontend Integration Briefing

Dokumen ini ditulis untuk memberikan konteks kepada _Developer_ atau agen _AI_ yang akan melanjutkan pengembangan di sisi **Frontend (Aplikasi Mobile - React Native / Expo)**.

## 1. Status Proyek Saat Ini

- **Backend (API)**: **SELESAI 100%**. Berjalan di port `http://localhost:3000` (Node.js + Express + Prisma + MySQL).
- **IoT (Konektivitas)**: **SELESAI 100%**. Backend sudah otomatis mempublikasikan pesan (Publish MQTT) ke `test.mosquitto.org` setiap kali ada perintah buka pintu.
- **Frontend (Mobile)**: **BELUM DIMULAI**. Ini adalah target pengerjaan berikutnya.

## 2. Arsitektur Data (Prisma/MySQL)

Backend memiliki 3 tabel utama:

1. **User**: Menyimpan data pengguna (`id`, `email`, `password` dienkripsi, `name`, `role`: `USER` / `COURIER` / `ADMIN`).
2. **Locker**: Tempat penyimpanan fisik (`id`, `number`, `status`: `AVAILABLE` / `OCCUPIED` / `BROKEN`, `size`).
3. **Package**: Data resi/paket (`id`, `trackingCode`, `status`: `IN_TRANSIT` / `IN_LOCKER` / `DELIVERED`, relasi ke `lockerId` dan `userId`).

## 3. Daftar URL API yang Siap Dipanggil Frontend

Semua endpoint di bawah (kecuali login/register) WAJIB menyertakan Header Authorization JWT:

```http
Authorization: Bearer <TOKEN_JWT>
```

### A. Autentikasi (Sistem Login)

| Method | Endpoint             | Body (JSON)                       | Deskripsi                                        |
| ------ | -------------------- | --------------------------------- | ------------------------------------------------ |
| `POST` | `/api/auth/register` | `{ email, password, name, role }` | Mendaftarkan pengguna (role opsional).           |
| `POST` | `/api/auth/login`    | `{ email, password }`             | Login pengguna. **Mengembalikan `token` (JWT)**. |

### B. Loker (Melihat Status Lemari)

| Method | Endpoint                 | Akses Role   | Deskripsi                                                  |
| ------ | ------------------------ | ------------ | ---------------------------------------------------------- |
| `GET`  | `/api/lockers`           | Bebas        | Mendapatkan daftar semua pintu loker beserta isinya.       |
| `GET`  | `/api/lockers/available` | Bebas        | Mencari loker kosong. Bisa ditambah query `?size=medium`.  |
| `POST` | `/api/lockers/:id/open`  | Akun `ADMIN` | Buka paksa 1 pintu spesifik (Kirim MQTT `OPEN`).           |
| `POST` | `/api/lockers`           | Akun `ADMIN` | Menambah data loker baru ke sistem (Nomor pintu & ukuran). |

### C. Kurir & User (Alur Utama Smart Locker)

| Method | Endpoint               | Akses Role          | Body (JSON)              | Deskripsi (Skenario Utama)                                                                                                                                                 |
| ------ | ---------------------- | ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/packages/drop`   | `COURIER` / `ADMIN` | `{ trackingCode, size }` | **SKENARIO KURIR DROPPING**: Otomatis carikan loker kosong, ubah status Loker jadi _Penuh_, simpan resi, lalu **Kirim sinyal MQTT Buka Pintu (OPEN)** ke alat fisik ESP32. |
| `POST` | `/api/packages/pickup` | Semua Login         | `{ trackingCode }`       | **SKENARIO USER AMBIL PAKET**: Cari paket dari loker, ubah loker jadi _Kosong_ kembali, status paket _Delivered_, lalu **Kirim sinyal MQTT Buka Pintu (OPEN)**.            |

---

## 4. Instruksi Pengerjaan Lanjutan (Untuk AI Frontend)

Jika agen AI ditugaskan membaca dokumen ini, maka tugas agen tersebut selanjutnya adalah berfokus di aplikasi Mobile (**React Native / Expo**).

**Fitur Utama yang harus dibuat di sisi Mobile:**

1. **Sistem Login & Register UI**: Buat halaman otentikasi. Token JWT yang didapat dari `/api/auth/login` harus disimpan (misal menggunakan `AsyncStorage` atau `SecureStore`).
2. **Navigasi Berbasis Role (Role-Based Routing)**:
   - Jika login sebagai `COURIER`: Arahkan ke antarmuka yang memiliki **QR Code Scanner** (Menggunakan library `expo-camera` / `expo-barcode-scanner`).
   - Jika login sebagai `USER`: Arahkan ke antarmuka Daftar Paket / Input Resi Manual untuk Pickup.
3. **Integrasi Kamera Scanner**: Saat kurir men-scan Barcode/QR resi, ambil nilainya (sebagai `trackingCode`) lalu kirim HTTP POST _Request_ ke `/api/packages/drop` lewat Axios/Fetch.
4. **Desain UIt**: Fokus gunakan desain ber-tema gelap (Dark-Theme) yang _modern/premium_ menggunakan Styling pilihan (Tailwind/NativeWind atau StyleSheet murni standar). Pastikan UX mulus dengan loading indikator ketika memanggil HTTP API.

⚠️ **PENTING UNTUK TEST DEVICE FISIK (HP):**
Jika Aplikasi Expo dijalankan di HP asli untuk mencoba scan QR, jangan gunakan `localhost` untuk URL API (karena localhost itu menunjuk ke HP itu sendiri). Gunakan IP LAN komputer, misal: `http://192.168.1.100:3000/api/...`
