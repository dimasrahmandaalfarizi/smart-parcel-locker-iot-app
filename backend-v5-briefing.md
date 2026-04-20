# Smart Locker — Backend Update Phase 5

## (Analytics, Payment History, Notification Center, User Management)

Dokumen ini adalah panduan eksekusi untuk Developer Backend (Node.js/Express + Prisma).
Seluruh 4 fitur di bawah ini telah memiliki UI di sisi Frontend — cukup aktifkan endpointnya!

---

## 1. 📊 Analytics Summary (`GET /api/analytics/summary`)

**Tujuan:** Mengisi `AdminAnalyticsScreen.js` yang saat ini menggunakan data dummy.

### Endpoint

| Method | Endpoint                 | Auth  | Deskripsi                              |
| ------ | ------------------------ | ----- | -------------------------------------- |
| `GET`  | `/api/analytics/summary` | ADMIN | Agregat data sistem dalam satu respons |

### Response JSON yang Dibutuhkan Frontend

```json
{
  "totalPackages": 248,
  "totalRevenue": 1250000,
  "avgPickupHours": 18.4,
  "penaltyCount": 12,
  "weeklyActivity": [
    { "label": "Sen", "value": 38 },
    { "label": "Sel", "value": 51 },
    ...
  ],
  "lockerUsage": [
    { "label": "Loker A", "value": 92 },
    ...
  ],
  "courierActivity": [
    { "label": "JNE", "value": 98 },
    ...
  ]
}
```

### Logika Query Prisma yang Disarankan

```js
// totalPackages: count semua Package
// totalRevenue: sum Package.overtimeFee where isPaid = true
// avgPickupHours: rata-rata (updatedAt - createdAt) per Package
// weeklyActivity: groupBy createdAt (hari), count per hari dalam 7 hari terakhir
// lockerUsage: groupBy lockerId, count Package per loker
// courierActivity: groupBy Package.droppedBy (userId kurir), count
```

---

## 2. 💳 Riwayat Pembayaran (`GET /api/payments/history`)

**Tujuan:** Mengisi `PackageHistoryScreen.js` dengan data transaksi denda nyata.

### Tabel Database Baru (`Payment`)

Tambahkan tabel baru di Prisma schema:

```prisma
model Payment {
  id          String   @id @default(cuid())
  userId      String
  packageId   String
  amount      Decimal
  method      String   // "QRIS", "GoPay", "OVO", "Transfer Bank"
  status      String   @default("PENDING") // PENDING, SUCCESS, FAILED
  midtransId  String?  // transaction_id dari Midtrans callback
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  package     Package  @relation(fields: [packageId], references: [id])
}
```

### Endpoint

| Method | Endpoint                    | Auth       | Payload            |
| ------ | --------------------------- | ---------- | ------------------ |
| `GET`  | `/api/payments/history`     | USER/ADMIN | `?page=1&limit=10` |
| `GET`  | `/api/payments/history/:id` | USER/ADMIN | -                  |

### Catatan Webhook Midtrans

Di controller `POST /api/payments/webhook` yang sudah ada, tambahkan insert ke tabel `Payment`:

```js
await prisma.payment.create({
  data: {
    userId: package.userId,
    packageId: package.id,
    amount: package.overtimeFee,
    method: notif.payment_type,
    status: "SUCCESS",
    midtransId: notif.transaction_id,
  },
});
```

---

## 3. 🔔 Notification Center (`/api/notifications`)

**Tujuan:** Inbox notifikasi permanen di dalam aplikasi (tidak hilang seperti Push).

### Tabel Database Baru (`Notification`)

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String   // "PACKAGE_ARRIVED", "PENALTY_WARNING", "PAYMENT_SUCCESS", "SYSTEM"
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

### Endpoints

| Method  | Endpoint                          | Auth  | Deskripsi                                |
| ------- | --------------------------------- | ----- | ---------------------------------------- |
| `GET`   | `/api/notifications`              | LOGIN | Ambil semua notifikasi milik user login  |
| `GET`   | `/api/notifications/unread-count` | LOGIN | Hitung badge angka merah di tab bar      |
| `PATCH` | `/api/notifications/:id/read`     | LOGIN | Tandai 1 notifikasi sebagai sudah dibaca |
| `PATCH` | `/api/notifications/read-all`     | LOGIN | Tandai semua sebagai sudah dibaca        |

### Notifikasi Otomatis (Insert dari Controller Lain)

Setiap kali ada aksi penting, sisipkan insert Notification:

- **Saat `POST /api/packages/drop` sukses** → buat notif `PACKAGE_ARRIVED` ke userId penerima
- **Saat `POST /api/payments/webhook` sukses** → buat notif `PAYMENT_SUCCESS` ke userId pemilik paket
- **Cron Job Harian**: Scan semua Package di mana `createdAt > 40 jam` dan `status = STORED` → buat notif `PENALTY_WARNING`

---

## 4. 👥 Admin User Management (`/api/admin/users`)

**Tujuan:** Admin bisa melihat, memfilter, dan menonaktifkan akun pengguna.

### Update Tabel `User`

Tambahkan kolom:

```prisma
// Di model User yang sudah ada:
isActive Boolean @default(true)
lastLoginAt DateTime?
```

> Di setiap endpoint `POST /api/auth/login`, update `lastLoginAt = new Date()`.

### Endpoints

| Method   | Endpoint                      | Auth  | Deskripsi                                                 |
| -------- | ----------------------------- | ----- | --------------------------------------------------------- |
| `GET`    | `/api/admin/users`            | ADMIN | Daftar semua user dengan pagination (`?role=USER&page=1`) |
| `GET`    | `/api/admin/users/:id`        | ADMIN | Detail profil 1 user + riwayat paketnya                   |
| `PATCH`  | `/api/admin/users/:id/status` | ADMIN | Blokir/aktivasi akun (`{ isActive: false }`)              |
| `DELETE` | `/api/admin/users/:id`        | ADMIN | Hapus permanen akun (soft delete disarankan)              |

### Middleware Keamanan yang WAJIB

- Semua endpoint `/api/admin/*` harus melewati middleware `verifyAdmin` yang memeriksa `req.user.role === 'ADMIN'`
- `PATCH status` dan `DELETE` tidak boleh digunakan untuk mengubah/menghapus akun ADMIN lain (self-protection)

---

## 📋 Urutan Eksekusi yang Disarankan

1. **Jalankan Prisma Migration** untuk tabel baru `Payment` dan `Notification`
2. Kerjakan **Fitur 1 (Analytics)** dahulu — paling cepat, hanya agregasi query
3. Lanjut ke **Fitur 2 (Payment History)** — modifikasi webhook yang sudah ada
4. Kemudian **Fitur 3 (Notification)** — paling banyak integrasi lintas controller
5. Terakhir **Fitur 4 (User Management)** — paling sederhana secara CRUD

Setelah semua endpoint siap, informasikan saya untuk segera connect ke Frontend! 🚀
