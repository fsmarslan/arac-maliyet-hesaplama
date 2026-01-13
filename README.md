# 🚗 Araç Maliyet Hesaplama

Araçlarınızın kilometre başına gerçek maliyetini hesaplayan modern bir web uygulaması.

## ✨ Özellikler

- **Gerçek Zamanlı Yakıt Fiyatları**: Petrol Ofisi'nden güncel benzin ve motorin fiyatlarını çeker
- **Detaylı Maliyet Analizi**: Yakıt, bakım, parça eskimesi, değer kaybı ve sigorta maliyetlerini hesaplar
- **Araç Yönetimi**: Araç ekleme, silme ve fotoğraf yükleme
- **Parça Takibi**: Lastik, fren, zincir gibi sarf parçalarının maliyetini takip eder
- **Benzin/Dizel Desteği**: Yakıt tipine göre doğru fiyat hesaplaması

## 🛠️ Teknolojiler

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Hafif veritabanı
- **BeautifulSoup4** - Web scraping

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Modern styling
- **Lucide React** - İkonlar

## 📦 Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+
- npm veya yarn

### Backend Kurulumu

```bash
# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### Frontend Kurulumu

```bash
cd frontend
npm install
```

## 🚀 Çalıştırma

### Hızlı Başlatma (Her iki servisi birlikte)

```bash
./start.sh
```

### Manuel Başlatma

**Backend:**
```bash
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Uygulama:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Proje Yapısı

```
AracMaliyetHesaplama/
├── main.py              # FastAPI uygulaması
├── models.py            # Veritabanı modelleri ve iş mantığı
├── utils.py             # Yakıt fiyatı çekme fonksiyonları
├── requirements.txt     # Python bağımlılıkları
├── start.sh             # Başlatma scripti
├── uploads/             # Yüklenen fotoğraflar
└── frontend/
    ├── src/
    │   ├── app/         # Next.js app router
    │   ├── components/  # React bileşenleri
    │   └── types/       # TypeScript tipleri
    └── package.json
```

## 📊 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/vehicles` | Tüm araçları listele |
| POST | `/vehicles` | Yeni araç ekle |
| DELETE | `/vehicles/{id}` | Araç sil |
| GET | `/costs/{id}` | Araç maliyet analizi |
| POST | `/upload` | Fotoğraf yükle |
| GET | `/settings` | Yakıt fiyatlarını getir |

## 📝 Lisans

MIT
