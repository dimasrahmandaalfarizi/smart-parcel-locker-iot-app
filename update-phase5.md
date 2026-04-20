# Smart Locker - API Briefing Phase 5

## (Analytics, Riwayat Pembayaran, Notifikasi In-App, Manajemen User Admin)

Dokumen ini dibuat **terpisah** dari `read.md` (Fase 1-2) dan `read-phase3-pin.md` (Fase 3) agar Frontend tidak kebingungan. Berisi daftar endpoint baru yang telah aktif di Backend.

---

## 📊 1. Analytics Admin (`/api/analytics`)

| Method | Endpoint                 | Auth    | Deskripsi                                                                                                                                       |
| ------ | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/analytics/summary` | `ADMIN` | Mengembalikan data agregat sistem: `totalPackages`, `totalRevenue`, `avgPickupHours`, `penaltyCount`, `weeklyActivity` (7 hari), `lockerUsage`. |

**Contoh Respons:**

```json
{
  "totalPackages": 248,
  "totalRevenue": 1250000,
  "avgPickupHours": 18.4,
  "penaltyCount": 12,
  "weeklyActivity": [{ "label": "Sen", "value": 38 }],
  "lockerUsage": [{ "label": "Loker 01", "value": 92 }]
}
```

---

## 💳 2. Riwayat Pembayaran (`/api/admin/payments/history`)

| Method | Endpoint                          | Auth        | Deskripsi                                                                                            |
| ------ | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/admin/payments/history`     | Semua Login | Daftar riwayat denda dengan pagination (`?page=1&limit=10`). ADMIN lihat semua, User lihat miliknya. |
| `GET`  | `/api/admin/payments/history/:id` | Semua Login | Detail satu pembayaran.                                                                              |

**Catatan**: Tabel `Payment` otomatis terisi setiap kali Webhook Midtrans menerima konfirmasi sukses.

---

## 🔔 3. Notification Center (`/api/notifications`)

| Method  | Endpoint                          | Auth        | Deskripsi                                                             |
| ------- | --------------------------------- | ----------- | --------------------------------------------------------------------- |
| `GET`   | `/api/notifications`              | Semua Login | Seluruh notifikasi milik user login, urutkan terbaru dulu.            |
| `GET`   | `/api/notifications/unread-count` | Semua Login | Mengembalikan `{"unreadCount": 3}` untuk badge angka merah di TabBar. |
| `PATCH` | `/api/notifications/:id/read`     | Semua Login | Tandai satu notif jadi sudah dibaca.                                  |
| `PATCH` | `/api/notifications/read-all`     | Semua Login | Tandai semua notif jadi sudah dibaca.                                 |

**Pembuatan Notifikasi Otomatis (Tanpa Hit Endpoint):**

- Saat Kurir Drop Paket → Notif `PACKAGE_ARRIVED` otomatis dibuat untuk user pemilik paket.
- Saat Webhook Midtrans Sukses → Notif `PAYMENT_SUCCESS` otomatis dibuat.

---

## 👥 4. Admin User Management (`/api/admin/users`)

| Method   | Endpoint                      | Auth    | Deskripsi                                                |
| -------- | ----------------------------- | ------- | -------------------------------------------------------- |
| `GET`    | `/api/admin/users`            | `ADMIN` | Semua user dengan pagination. Filter role: `?role=USER`. |
| `GET`    | `/api/admin/users/:id`        | `ADMIN` | Profil detail 1 user + riwayat paketnya.                 |
| `PATCH`  | `/api/admin/users/:id/status` | `ADMIN` | Blokir / Aktifkan akun. Payload: `{"isActive": false}`.  |
| `DELETE` | `/api/admin/users/:id`        | `ADMIN` | Hapus akun secara permanen.                              |

**Behavior Keamanan yang Sudah Aktif:**

- Login akan **ditolak (403)** jika `isActive = false`.
- Admin tidak bisa blokir/hapus akun Admin lain.
- Admin tidak bisa blokir/hapus akunnya sendiri.
