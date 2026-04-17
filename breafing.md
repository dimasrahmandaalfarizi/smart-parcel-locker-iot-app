Saya sedang mengembangkan aplikasi mobile berbasis React Native (Expo) untuk sistem Smart Parcel Locker berbasis IoT.

Tujuan aplikasi ini adalah untuk mendukung proses penyimpanan dan pengambilan paket secara otomatis melalui sistem loker pintar yang terintegrasi dengan backend dan perangkat IoT (ESP32).

Aplikasi ini memiliki 3 jenis pengguna utama:
1. User (penerima paket)
2. Courier (kurir)
3. Admin (monitoring sistem)

Fitur utama sistem:
- Login dan autentikasi pengguna
- Scan barcode / QR code untuk input paket (courier)
- Sistem auto sorting (backend menentukan locker secara otomatis berdasarkan ukuran dan ketersediaan)
- Tampilan status paket (stored, picked up, expired)
- Notifikasi paket masuk dan pengingat pengambilan
- Pembukaan locker melalui tombol "Open Locker"
- Verifikasi akses menggunakan QR code atau PIN
- Monitoring status locker (available, occupied)

Alur utama aplikasi:
1. Courier scan paket → sistem menentukan locker → locker terbuka → paket dimasukkan
2. User menerima notifikasi → melihat detail paket → membuka locker → mengambil paket
3. Sistem memperbarui status secara real-time

Saya ingin kamu membantu generate UI menggunakan React Native (Expo) dengan ketentuan berikut:
- Gunakan functional component
- Gunakan StyleSheet (bukan CSS web)
- Gunakan komponen React Native seperti View, Text, TouchableOpacity
- Desain modern, minimalis, dan clean
- Gunakan warna dominan: hitam (dark mode), biru (accent), putih (text)
- Layout berbasis card (card UI)
- Tidak menggunakan elemen HTML seperti div

Screen yang ingin dibuat:
1. Login Screen
2. Home Dashboard (list paket)
3. Package Detail Screen
4. Scan Screen (untuk courier)
5. Open Locker Screen

Tambahan:
- UI harus realistis seperti aplikasi production (bukan sekadar contoh)
- Fokus pada user experience yang jelas dan mudah digunakan
- Jangan terlalu kompleks, tapi tetap terlihat profesional