# Smart Locker - API Briefing Phase 6

## (Peta Lokasi, Helpdesk/Support, dan Force Trigger Kiosk)

Dokumen ini berisi referensi lengkap API yang baru ditambahkan pada Phase 6. Serahkan file ini ke _Frontend Developer_ untuk diintegrasikan ke sistem antarmuka Peta dan Tiket Dukungan.

---

## 🗺️ 1. Peta Titik Loker (`/api/locations`)

**Tujuan:** Mengembalikan daftar koordinat dan informasi ketersediaan slot (untuk dirender menjadi Pin/Marker di layar Maps).

| Method | Endpoint         | Auth             | Detail Respons JSON                                                                                                          |
| ------ | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/locations` | _Bebas / Public_ | API ini langsung mengagregasi data loker anak, jadi _Frontend_ tahu ada berapa loker "AVAILABLE" di satu titik `locationId`. |

**Contoh Respons Sukses (Status: 200)**:

```json
[
  {
    "id": 1,
    "name": "Stasiun KRL Sudirman",
    "address": "Jl. Jenderal Sudirman No.1",
    "latitude": -6.2023,
    "longitude": 106.8228,
    "totalLockers": 15,
    "availableLockers": 4
  }
]
```

---

## 🎧 2. Helpdesk / Pengaduan Kendala (`/api/support/ticket`)

**Tujuan:** Saat loker fisik _offline_ atau barang belum terambil tetapi statusnya _Delivered_, User/Kurir bisa mengirim tiket.

| Method | Endpoint              | Auth              | Cttn. Endpoint                                                      |
| ------ | --------------------- | ----------------- | ------------------------------------------------------------------- |
| `POST` | `/api/support/ticket` | **Semua `LOGIN`** | `packageId` & `photoUrl` opsional, namun `description` wajib diisi. |

**Payload (Body):**

```json
{
  "packageId": 102,
  "description": "Loker 07 tidak mau terbuka padahal saya sudah masukkan PIN-nya kemarin sore.",
  "photoUrl": "https://img.host.com/error-loker-07.jpg"
}
```

_Sistem otomatis me-reply User melalui Inbox Notification In-App bahwa tiket sedang diproses!_ (`Tiket Bantuan Diterima 🎧`)

---

## ⚡ 3. Hardware Force Trigger (Admin Only) (`/api/lockers/:id/force-trigger`)

**Tujuan:** Fitur eskalasi tingkat dewa untuk Admin. Jika sensor MACET (misalnya karena gangguan _Firmware_ ESP32), hit endpoint ini akan melempar pesan elektrik `FORCE_OPEN` tanpa logika kompromistis lainnya.

| Method | Endpoint                         | Auth              | Respons & Efek                                                                    |
| ------ | -------------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `POST` | `/api/lockers/:id/force-trigger` | **Wajib `ADMIN`** | Langsung menembak payload MQTT `FORCE_OPEN` + dicatat di dalam audit `LockerLog`. |

_Kirimkan id mesin / lockerId ke dalam parameter endpoint (Contoh: `/api/lockers/8/force-trigger`)._
