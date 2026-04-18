# Smart Parcel Locker - Backend Architecture Briefing

Dokumen ini adalah panduan teknis (briefing) yang dirancang khusus untuk pengembangan **Backend** dari sistem Smart Locker IoT. Dokumen ini dapat dibaca oleh tim _Antigravity_ (AI) atau _Developer_ lain sebagai landasan arsitektur.

---

## 1. Tujuan Utama

Backend ini bertindak sebagai otak sentral (Pusat Komando) yang menghubungkan dua dunia:

1. **Dunia Aplikasi Mobile (REST API):** Melayani permintaan data dari aplikasi HP User, Courier, dan Admin.
2. **Dunia Perangkat Keras / IoT (MQTT):** Mengendalikan perangkat keras (ESP32 / Mikrokontroler) untuk membuka/menutup kunci selenoide pintu loker secara _real-time_.

## 2. Tech Stack (Teknologi Pendukung)

- **Runtime & Framework:** Node.js + Express.js (Bahasa JavaScript/TypeScript)
- **Database:** PostgreSQL (Atau MySQL)
- **ORM / Database Manager:** Prisma ORM (Untuk keamanan skema yang kuat)
- **Protokol IoT:** MQTT (menggunakan library `mqtt.js`) terhubung ke broker seperti Eclipse Mosquitto.
- **Keamanan (Auth):** JWT (JSON Web Tokens) dan _Bcrypt_ untuk enkripsi password.

## 3. Fitur Utama yang Harus Dibangun

1. **Authentication Service**: Mengelola login User, Kurir (termasuk validasi token QR dinamis), dan Admin.
2. **Locker Management Service**:
   - Menyimpan status fisik _real-time_ dari lemari loker (Tersedia, Terisi, Rusak).
   - _Logic_ Auto-Sorting: Mencari loker kosong yang ukurannya sesuai dengan paket yang di-scan.
3. **Package Tracking Service**:
   - Membuat/mengupdate resi kiriman di database.
   - Pemicu aksi pengerjaan IoT (mengirim _command_ "BUKA" ke mesin).

## 4. Rencana Struktur Folder (Direktori)

```text
smart-locker-backend/
│
├── prisma/
│   └── schema.prisma       # Pusat definisi tabel database (Tabel User, Locker, Package)
│
├── src/
│   ├── config/             # Pengaturan koneksi pihak ketiga
│   │   ├── db.js           # Koneksi ke Prisma
│   │   └── mqttBroker.js   # Konfigurasi konektivitas ke ESP32
│   │
│   ├── controllers/        # Tempat meletakkan "otak / logika" bisnis
│   │   ├── authController.js
│   │   ├── lockerController.js
│   │   └── packageController.js
│   │
│   ├── routes/             # Pengatur jalan / Alamat URL API
│   │   ├── authRoutes.js   # cth: POST /api/auth/login
│   │   ├── lockerRoutes.js # cth: POST /api/lockers/open
│   │   └── packageRoutes.js
│   │
│   ├── middlewares/        # Penjaga pintu (Keamanan & Pemblokiran akses ilegal)
│   │   └── authMiddleware.js # Mengecek keshahihan JWT Token
│   │
│   ├── app.js              # Penyatuan seluruh Middleware & Routes Express
│   └── server.js           # File yang dieksekusi pertama kali (Listener server)
│
├── .env                    # Variabel rahasia (Password DB, MQTT Secret)
├── package.json            # Daftar daftar library (Dependencies)
└── README.md
```

## 5. Flowchart Eksekusi IoT (Alur Buka Loker)

1. **API Menerima Request:** Aplikasi Kurir memanggil `POST /api/lockers/assign-drop` dengan menyertakan Nomor Resi paket.
2. **Database Checking:** Controller `packageController.js` memverifikasi token dan mengubah `status` loker #05 menjadi `occupied` di database PostgreSQL.
3. **Trigger IoT Publish:** Backend mengirimkan pesan MQTT `(Topic: "locker/door/05/cmd", Message: "OPEN")`.
4. **Hardware Response:** ESP32 menerima pesan MQTT, lalu mengalirkan listrik ke relay pintu loker fisik. Pintu Terbuka!

## 6. Instruksi Awal (Start-Up Guide)

Jika siap untuk memulai, jalankan blok perintah ini di terminal:

```bash
mkdir smart-locker-backend
cd smart-locker-backend
npm init -y
npm install express cors dotenv jsonwebtoken bcryptjs mqtt @prisma/client
npm install -D nodemon prisma
npx prisma init
```
