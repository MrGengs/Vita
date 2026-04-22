# VITA — Checklist Setup Foto & Isolasi User

## Jawaban Singkat

| Pertanyaan | Jawaban |
|---|---|
| Perlu upload ulang `cam.ino`? | **TIDAK** — firmware tidak perlu diubah |
| Perlu tambah sesuatu di Supabase? | **YA** — 1 kolom di tabel `captures` |
| Perlu deploy web app? | **YA** — setelah semua setup selesai |

---

## Mengapa `cam.ino` Tidak Perlu Diubah

ESP32-CAM tidak tahu siapa yang sedang login di browser. Device hanya bertugas:
1. Ambil foto (JPEG)
2. Upload ke Supabase Storage → dapat public URL
3. Insert row ke tabel `captures` → `{url, path, size, ip, device}`

Tugas menandai foto milik siapa (`user_uid`) dilakukan oleh **frontend** (scanner.js) segera setelah foto terdeteksi, via PATCH ke Supabase. Ini sudah diimplementasikan di versi terbaru `scanner.js`.

---

## Langkah 1 — Tambah Kolom `user_uid` di Supabase

Ini **satu-satunya** hal yang harus dilakukan di Supabase.

### Cara A: Lewat SQL Editor (Direkomendasikan)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → Project `vita-steriflow`
2. Klik **SQL Editor** di sidebar kiri
3. Jalankan query ini:

```sql
-- Tambah kolom user_uid (nullable, karena ESP32 tidak mengisi ini)
ALTER TABLE captures
ADD COLUMN IF NOT EXISTS user_uid TEXT DEFAULT NULL;

-- Index agar query filter per-user cepat
CREATE INDEX IF NOT EXISTS idx_captures_user_uid
ON captures (user_uid);
```

4. Klik **Run** → pastikan output `Success`

### Cara B: Lewat Table Editor

1. Buka **Table Editor** → tabel `captures`
2. Klik **Add Column**
3. Isi:
   - **Name**: `user_uid`
   - **Type**: `text`
   - **Default**: kosongkan
   - **Nullable**: centang (✓)
4. Save

---

## Langkah 2 — Verifikasi Struktur Tabel `captures`

Setelah menambah kolom, struktur tabel harus seperti ini:

| Kolom | Tipe | Isi oleh |
|-------|------|----------|
| `id` | int8 / serial | Supabase (auto) |
| `url` | text | ESP32-CAM |
| `path` | text | ESP32-CAM |
| `size` | int8 | ESP32-CAM |
| `ip` | text | ESP32-CAM |
| `device` | text | ESP32-CAM |
| `source` | text | ESP32-CAM |
| `created_at` | timestamptz | Supabase (auto) |
| `user_uid` | text | **Frontend (scanner.js)** ← baru |

> `user_uid` akan kosong/null untuk foto lama. Hanya foto yang diambil setelah update ini yang akan punya `user_uid`.

---

## Langkah 3 — Fix Permission UPDATE di Supabase ⚠️ WAJIB

Ini adalah penyebab utama `user_uid` tetap null. Jalankan SQL berikut di **SQL Editor**:

```sql
-- 1. Pastikan kolom ada
ALTER TABLE captures
ADD COLUMN IF NOT EXISTS user_uid TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_captures_user_uid ON captures (user_uid);

-- 2. Berikan hak UPDATE ke role anon
GRANT UPDATE (user_uid) ON captures TO anon;

-- 3. Hapus policy lama jika ada, lalu buat ulang (CREATE POLICY tidak mendukung IF NOT EXISTS)
DROP POLICY IF EXISTS "anon_update_user_uid" ON captures;

CREATE POLICY "anon_update_user_uid"
ON captures FOR UPDATE TO anon
USING (true) WITH CHECK (true);
```

### Cek apakah berhasil

Buka **SQL Editor**, jalankan:

```sql
-- Harus menampilkan 'UPDATE' atau semua privileges
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'captures' AND grantee = 'anon';
```

Hasil yang benar: ada baris `anon | UPDATE`.

### Diagnosis error dari Browser Console

Setelah deploy, buka **DevTools → Console** di browser dan lihat log ketika ESP32 memotret.
Frontend sekarang mencetak error spesifik jika PATCH gagal:

| Pesan Console | Artinya | Solusi |
|---|---|---|
| `HTTP 403` | RLS blocking | Jalankan SQL policy di atas |
| `HTTP 400: Column 'user_uid' does not exist` | Kolom belum ada | Jalankan `ALTER TABLE` di atas |
| `HTTP 404` | Tabel tidak ditemukan | Cek nama tabel, pastikan `captures` |
| Tidak ada error | PATCH berhasil ✓ | `user_uid` terisi di Supabase |

---

## Langkah 4 — Deploy Web App

Setelah Supabase siap, deploy frontend terbaru:

```bash
firebase deploy --only hosting
```

---

## Langkah 5 — Test Alur Lengkap

Urutan test yang benar:

```
1. Login sebagai User A
2. Buka halaman Scanner → pilih Vita-005 → Connect
3. Tekan tombol fisik ESP32-CAM
4. Toast "Foto IoT terdeteksi!" muncul → preview gambar tampil
5. Klik "Analisis Gambar" → tunggu hasil AI
6. Pilih jenis makan → klik "Simpan ke Log"
```

### Cek di Supabase (Table Editor → `captures`)
Baris terbaru harus punya `user_uid` = UID milik User A (bukan null).

### Cek di Firestore (Firebase Console)
```
users/
  {uid_user_A}/
    meals/
      {meal_id}/
        image_url: "https://jonpztihoxuzzdjneoqv.supabase.co/storage/v1/object/public/captures/..."
        image_filename: "Vita-005_42_1234567.jpg"
        device_id: "Vita-005"
        mealType: "Makan Siang"
        ...
```

### Cek di Halaman History
Kartu hari yang memiliki foto akan menampilkan **thumbnail 32×32px** di bawah progress bar kalori.

### Cek di Halaman Nutrition
Meal card yang punya foto menampilkan **gambar asli** (bukan emoji) di kotak kiri.

---

## Alur Isolasi User A vs User B

```
ESP32 capture foto
      │
      ▼
Supabase Storage: captures/Vita-005_42_xxx.jpg   ← semua user, file fisik
      │
      ▼
Supabase Table captures:
  { url, path, device: "Vita-005" }               ← awalnya user_uid = NULL
      │
      ▼ (scanner.js PATCH, dalam 3 detik)
  { ..., user_uid: "abc123_uid_userA" }            ← ditandai milik User A
      │
      ▼ (scanner.js saveMeal)
Firestore: users/abc123_uid_userA/meals/{id}
  { image_url, image_filename, device_id, ... }   ← terisolasi per UID
      │
      ├─▶ History User A → getMealsForDateRange("abc123") → foto User A ✓
      └─▶ History User B → getMealsForDateRange("xyz789") → kosong ✓
```

---

## Ringkasan: Apa yang Sudah vs Belum

| Item | Status |
|------|--------|
| `cam.ino` — firmware ESP32 | ✅ Tidak perlu diubah |
| `scanner.js` — PATCH `user_uid` ke Supabase | ✅ Sudah diimplementasikan |
| `scanner.js` — simpan `device_id` + `image_url` ke Firestore | ✅ Sudah diimplementasikan |
| `history.js` — fix bug kalori (pakai `totalNutrition.calories`) | ✅ Sudah diperbaiki |
| `history.js` — tampilkan thumbnail foto di kartu harian | ✅ Sudah diimplementasikan |
| `nutrition.js` — tampilkan gambar di meal card | ✅ Sudah ada sebelumnya |
| Supabase — kolom `user_uid` di tabel `captures` | ⏳ **Perlu dilakukan manual** |
| Firebase deploy | ⏳ **Perlu dilakukan setelah setup Supabase** |
