# 🎭 Pentas Seni 2026 — WhatsApp Group Web App

Web aplikasi real-time untuk acara pentas seni dengan tampilan mirip WhatsApp Group.

---

## 📁 Struktur File

```
pentas-seni/
├── index.html    ← Markup utama
├── style.css     ← Semua styling (WhatsApp look)
├── script.js     ← Logika chat, call, Firebase
└── README.md     ← Panduan ini
```

---

## 🔥 Step 1: Setup Firebase

### 1. Buat Project Firebase
1. Buka https://console.firebase.google.com
2. Klik **"Add project"** → beri nama (misal: `pentas-seni-2026`)
3. Nonaktifkan Google Analytics (opsional) → **Create project**

### 2. Aktifkan Realtime Database
1. Di sidebar, klik **Build → Realtime Database**
2. Klik **"Create Database"**
3. Pilih region (misal: `asia-southeast1`)
4. Pilih mode **"Start in test mode"** (aman untuk event sementara)
5. Klik **Enable**

### 3. Ambil Firebase Config
1. Di sidebar, klik ikon ⚙️ → **Project settings**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **"</>"** (Web)
4. Register app dengan nama apa saja
5. Copy konfigurasi yang muncul:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pentas-seni-2026.firebaseapp.com",
  databaseURL: "https://pentas-seni-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pentas-seni-2026",
  storageBucket: "pentas-seni-2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Pasang Config ke index.html
Buka `index.html`, cari bagian:
```javascript
// 🔥 GANTI DENGAN CONFIG FIREBASE KAMU
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  ...
```
Ganti seluruh objek `firebaseConfig` dengan config milikmu.

### 5. Atur Security Rules (Opsional, untuk produksi)
Di Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    "messages": {
      ".read": true,
      ".write": true,
      "$messageId": {
        ".validate": "newData.hasChildren(['name', 'message', 'timestamp'])"
      }
    }
  }
}
```

---

## 🚀 Step 2: Deploy ke Vercel

### Cara 1: Drag & Drop (Paling Mudah)
1. Buka https://vercel.com → Sign in dengan GitHub
2. Klik **"New Project"** → pilih tab **"Import Third-Party Git Repository"**
   — ATAU —
   Langsung buka https://vercel.com/new/import
3. Scroll ke bawah → klik **"Deploy from existing file"**
4. **Drag & drop** folder `pentas-seni/` ke area upload
5. Klik **Deploy** → tunggu ~30 detik
6. Dapatkan URL publik! 🎉

### Cara 2: Via GitHub
1. Upload folder ke repo GitHub baru
2. Di Vercel → New Project → Import GitHub repo
3. Framework Preset: **Other** (biarkan default)
4. Klik Deploy

### Cara 3: Vercel CLI
```bash
npm i -g vercel
cd pentas-seni
vercel
```
Ikuti instruksi di terminal.

---

## 🎨 Kustomisasi

### Ganti Nama Acara
Di `index.html`, cari dan ganti:
- `"Pentas Seni 2026"` → nama acaramu
- `🎭` → emoji yang sesuai

### Ganti Info Rundown
Di `index.html`, bagian `<div id="infoPanel">`, edit tabel `.rundown-item`.

### Ganti Warna Tema
Di `style.css`, ubah variabel CSS:
```css
:root {
  --wa-header: #075E54;    /* Warna header */
  --wa-green:  #25D366;    /* Warna aksen */
  --wa-bubble-out: #DCF8C6; /* Warna bubble kanan */
}
```

### Ganti Video di Video Call
Di `index.html`:
```html
<video src="URL_VIDEO_KAMU" ...>
```
Bisa pakai Google Drive share link, YouTube embed, atau upload ke Cloudinary.

### Admin Bot Messages
Di `script.js`:
```javascript
const ADMIN_MESSAGES = [
  "Pesan pertama bot...",
  "Pesan kedua...",
];
```

---

## 🛡️ Fitur Keamanan

- ✅ **Escape HTML** — mencegah XSS injection
- ✅ **Anti-spam** — delay 2 detik antar pesan
- ✅ **Limit pesan** — hanya 100 pesan terakhir dimuat
- ✅ **Validasi nama** — wajib isi sebelum chat

---

## 📱 Fitur Lengkap

| Fitur | Status |
|-------|--------|
| Chat real-time (Firebase) | ✅ |
| Bubble WA (kiri/kanan) | ✅ |
| Nama & warna per user | ✅ |
| Timestamp pesan | ✅ |
| Date divider | ✅ |
| Admin Bot pesan otomatis | ✅ |
| Fake Call dengan audio | ✅ |
| Fake Video Call | ✅ |
| Info grup + rundown | ✅ |
| Emoji picker | ✅ |
| Anti-spam | ✅ |
| Scroll to bottom button | ✅ |
| Unread badge | ✅ |
| Online count simulasi | ✅ |
| Simpan nama (localStorage) | ✅ |
| Escape XSS | ✅ |
| Mobile responsive | ✅ |

---

## 🆘 Troubleshooting

**Chat tidak muncul?**
→ Pastikan `databaseURL` di firebaseConfig sudah benar (ada region-nya).

**Error CORS / permission?**
→ Cek Firebase Rules, pastikan `.read` dan `.write` = `true`.

**Video call tidak play?**
→ Ganti URL video dengan file MP4 yang accessible publik.

**Nama tidak tersimpan?**
→ Pastikan browser tidak dalam mode incognito (localStorage diblokir).
