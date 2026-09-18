# ✈️ GökHat — Modern Uçuş Rezervasyon Platformu

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**GökHat**; kullanıcıların uçuş araması yapabildiği, interaktif koltuk haritasından koltuk seçebildiği ve saniyeler içinde PNR kodlu bilet oluşturabildiği modern, full-stack bir uçak bileti platformudur.

---

### 🗄️ Veri Kaynağı Modu
* **Veritabanı Modu:** Kendi MySQL veritabanınızdaki uçuşlar üzerinde tam rezervasyon akışı (koltuk seçimi + bilet alma).

---

## 📑 İçindekiler
- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [API Uç Noktaları](#-api-uç-noktaları)
- [Lisans](#-lisans)

---

## ✨ Özellikler

* 🔐 **Kimlik Doğrulama:** JWT tabanlı güvenli oturum yönetimi, bcrypt ile şifre hash'leme, korumalı route'lar.
* 🔎 **Uçuş Arama:** Kalkış, varış ve tarih parametrelerine göre filtreli arama.
* 💺 **Koltuk Seçimi:** Doluluk durumunu canlı gösteren interaktif kabin haritası (2 adımlı rezervasyon akışı).
* ⚡ **Eşzamanlılık Güvenliği:** Aynı koltuğun çift satılmasını engelleyen MySQL Transaction + UNIQUE kısıt mimarisi.
* 🎫 **Bilet Yönetimi:** PNR kodlu biletler, rezervasyon geçmişi ve iptal işlemi (koltuk otomatik satışa döner).
* 🎨 **Modern Arayüz:** Açık tema, responsive tasarım, Tailwind CSS ile tutarlı tasarım sistemi.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknolojiler |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7, Tailwind CSS, Axios, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | MySQL |
| **Kimlik Doğrulama** | JWT, bcrypt |
| **Harici API** | Amadeus Self-Service (Flight Offers Search) |

---

## ⚙️ Kurulum

### Gereksinimler
* Node.js 18 veya üzeri
* MySQL 8 veya üzeri
* *(Opsiyonel)* Canlı uçuş araması için Amadeus hesabı

### 1) Depoyu Klonlayın
```bash
git clone https://github.com/batuhandinc0/GokHat.git
cd GokHat
```

### 2) Backend'i Başlatın
```bash
cd server
npm install
```

Sunucu kök dizininde `.env` dosyası oluşturun:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sifreniz
DB_NAME=gokhat_db
JWT_SECRET=super_gizli_anahtarinizi_buraya_yazin

# Canlı uçuş araması için (opsiyonel)
AMADEUS_CLIENT_ID=amadeus_api_key
AMADEUS_CLIENT_SECRET=amadeus_api_secret
```

Sunucuyu çalıştırın:
```bash
npm run dev
```

### 3) Frontend'i Başlatın
Yeni bir terminal sekmesinde:
```bash
cd frontend
npm install
npm run dev
```

> Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışır. Frontend, `/api` isteklerini Vite proxy üzerinden backend'e yönlendirir.

---

## 🔑 Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
| :--- | :---: | :--- |
| `PORT` | ✅ | Backend sunucu portu |
| `DB_HOST` | ✅ | MySQL sunucu adresi |
| `DB_USER` | ✅ | MySQL kullanıcı adı |
| `DB_PASSWORD` | ✅ | MySQL şifresi |
| `DB_NAME` | ✅ | Veritabanı adı |
| `JWT_SECRET` | ✅ | JWT imzalama anahtarı |

> ⚠️ **Uyarı:** `.env` dosyası asla versiyon kontrolüne dahil edilmemelidir (`.gitignore` içinde bulunduğundan emin olun).

---

## 📌 API Uç Noktaları

| Metod | Endpoint | Açıklama | Yetki |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı | Herkese açık |
| `POST` | `/api/auth/login` | Giriş & JWT üretimi | Herkese açık |
| `GET` | `/api/flights` | Filtreli uçuş listesi (veritabanı) | Herkese açık |
| `GET` | `/api/flights/:id` | Uçuş detayı & dolu koltuklar | Herkese açık |
| `POST` | `/api/bookings` | Rezervasyon oluşturma | 🔒 Token gerekli |
| `GET` | `/api/bookings/my-tickets` | Kullanıcının biletleri | 🔒 Token gerekli |
| `PATCH` | `/api/bookings/:id/cancel` | Bilet iptali | 🔒 Token gerekli |

---

## 🤝 Katkıda Bulunma
Katkılarınızı memnuniyetle karşılarım! 

1. Projeyi Fork'layın
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: Yeni özellik eklendi'`)
4. Dalınıza push yapın (`git push origin feature/YeniOzellik`)
5. Bir Pull Request açın

---

## 📄 Lisans
Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.

---

## 👤 Geliştirici
**batuhandinc0** — [GitHub Profili](https://github.com/batuhandinc0)

⭐ Beğendiyseniz depoya yıldız vermeyi unutmayın!