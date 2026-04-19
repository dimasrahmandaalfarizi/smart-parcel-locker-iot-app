# 🚀 Smart Locker - Backend Update Phase 3 (Share Access PIN)

Dokumen perancangan (Briefing) ini ditujukan untuk merombak _database_ dan kerangka API di _Backend_ demi merealisasikan **Fitur Wakil Pengambilan (Share Access)**.

Fitur ini memungkinkan _User_ men-generate Token/PIN 6 Angka berbatas waktu (misalnya: aktif selama 2 jam saja) untuk diberikan kepada anggota keluarga atau supir ojek _online_ agar mereka bisa mengakses mesin loker fisik tanpa memegang HP Sang _User_.

---

## 🗄️ 1. Perubahan Skema Kolom Database (Tabel `Package`)

Sistem sama sekali tidak boleh menimpa nomor resi/tracking code yang asli. Oleh karena itu, kita harus memodifikasi tabel `Package` di sisi server ORM/SQL dengan menyuntikkan 2 kolom opsional (_Nullable_) yang baru:

1. `sharedPin String?` -> Kolom penampung 6 angka acak rahasia untuk mesin (Sebaiknya memakai format _Hash/Bcrypt_).
2. `pinExpiry DateTime?` -> Kolom batas maksimal waktu (kedaluwarsa) kapan PIN itu berhenti berfungsi secara otomatis.

---

## 🔗 2. Desain Endpoint API Spesifik Terbarukan

### A. Endpoint Pembuat PIN (Diakses dari HP Aplikasi User Aktif)

| Method | Endpoint                                | Payload (JSON)         | Penjelasan Alur                                                                                                                                                                               |
| ------ | --------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/packages/:packageId/generate-pin` | `{ durationHours: 2 }` | User memencet tombol "Beri Akses Sementara" dan di balik layar ia meminta server membuatkan 6 Angka Rahasia berdurasi 2 jam. API ini langsung mem-bypass/update tabel `Package` bersangkutan. |

### B. Endpoint Pengeksekusi Pintu (Diakses dari Tablet/Layar Kiosk Fisik Loker)

| Method | Endpoint                | Payload (JSON)      | Penjelasan Alur                                                                                                                                                                                                                                           |
| ------ | ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/lockers/open-pin` | `{ pin: "408192" }` | Driver Gojek/Keluarga datang ke stasiun Loker, mengetikkan "408192" ke layar tablet _Kiosk_. API memeriksa apakah PIN cocok dan `DateTime.Now < pinExpiry`. Bila VALID, server menggebrak relai _Microcontroller ESP32 (MQTT)_ untuk membuka pintu keras! |

---

### Sistem Keamanan Mutlak (Wajib di-implementasikan Backend):

- **Autodelete (Self Destruct):** Sebuah `sharedPin` WAJIB langsung dirubah isinya kembali menjadi `null` atau `dikosongkan` ke dalam database begitu pintu terindikasi sukses dibuka satu (1) kali. _(Agar supir curang tidak bisa kembali membuka pintu yang sama sejam kemudian)._
- **Rate Limiting:** IP atau Kiosk akan dipaksa menunggu (Blocked) selama 15 menit jika terus-menerus mencoba memanggil `/api/lockers/open-pin` lebih dari 5 kali tebakan gagal berturut-turut.

_(Silakan teruskan / simpan panduan spesifikasi brilian ini untuk dijadikan acuan saat Anda mengetik kode integrasi Node.js servernya!)_
