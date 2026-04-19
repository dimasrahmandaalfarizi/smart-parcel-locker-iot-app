# Smart Locker - API Briefing Phase 3 (Share Access PIN)

Dokumen ini adalah panduan integrasi khusus untuk fitur **Berbagi Akses lewat PIN (Kiosk Mode)**.
Fitur ini dipisah agar _Developer UI Frontend_ tidak kebingungan. Fungsinya adalah memungkinkan pengguna (pemilik paket) membuat PIN rahasia sementara agar keluarganya atau supir layanan antar bisa mengambil paket langsung di _numpad_ layar mesin Loker, tanpa memiliki atau login ke aplikasi.

---

## 🔑 2 Endpoint Baru Terkait Akses PIN

Berikut adalah _Route_ tambahan yang telah mengudara di server dan siap dipanggil Frontend:

### 1. `POST /api/packages/:id/generate-pin`

- **Tujuan Integrasi**: Di-hit oleh _Aplikasi Mobile_ milik User saat mereka memencet tombol "Beri Akses Wakil".
- **Kredensial**: **WAJIB AUTH** (`Authorization: Bearer <TOKEN_USER>`). Hanya pemilik asli paket ID ini yang boleh mengakses endpoint.
- **Payload Body (JSON)**:
  ```json
  {
    "durationHours": 2
  }
  ```
- **Respons (Success)**: Server akan memproduksi 6 angka _plaintext_ untuk dikirim terakhir kalinya ke layar HP.
  ```json
  {
    "message": "Share PIN generated successfully",
    "pin": "428105",
    "expiresAt": "2026-04-20T12:00:00.000Z"
  }
  ```
  _(**Info Sec:** Meski JSON yang ditarik angka mentah, kode Backend secara ketat menerjemahkannya menjadi enkripsi Hash Bcrypt Salt-10 ke dalam MySQL `packages.sharedPin`!)_

---

### 2. `POST /api/lockers/open-pin`

- **Tujuan Integrasi**: Di-hit oleh **Aplikasi Kiosk** layar sentuh yang menempel pada fisik mesin Lemari Loker (Gunakan _Keypad_).
- **Kredensial**: Public (Tidak butuh Bearer Token).
- **🔥 Proteksi Skematik Backend (Sudah Aktif)**:
  - **Rate Limit Block**: API ini dilengkapi pengawas otomatis. Jika IP mencoba menembak PIN / spam PIN secara membabi buta 5 kali kegagalan beruntun, server melempar HTTP 429 dan membekukan mesin itu selama **15 menit**. _Valid PIN_ tidak akan mengurangi jatah kuota harian.
  - **Auto Destruct**: Bila PIN benar & pintu terbuka, _record_ PIN tsb langsung dimusnahkan (`null`) di database secara real-time. Tidak bisa dipakai ulang sejam kemudian.
- **Payload Body (JSON)**:
  ```json
  {
    "pin": "428105"
  }
  ```
- **Skenario Percabangan Error & Sukses**:
  - Jika **Berhasil**: Pintu MQTT **TERBUKA**, status paket -> `DELIVERED`, PIN -> musnah, Audit Logging mencatat aksi sbg `OPEN_PIN`.
  - Jika **Salah / Kadaluarsa Waktunya**: Merespons balasan `400 Bad Request` ("Invalid or expired PIN").
  - Jika **Ternyata Masih Ada Denda Penitipan**: Merespons balasan `403 Forbidden` (`"errorCode": "UNPAID_PENALTY"`).
