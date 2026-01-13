from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from models import VehicleManager
import os
import uuid

# Uploads klasörü
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Uygulama Başlatma
app = FastAPI(
    title="Vehicle Master API",
    description="Araç Takip ve Maliyet Analiz Sistemi Backend API",
    version="2.0.0"
)

# CORS Ayarları (Next.js vb. frontendler için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = VehicleManager()

# Static files - yüklenen fotoğraflar için
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- PYDANTIC MODELLERİ ---

class VehicleBase(BaseModel):
    marka: str
    model: str
    yil: int = Field(..., ge=1900, le=2030)
    fotograf_url: Optional[str] = None
    
    # KM Bilgileri
    baslangic_km: int = 0
    guncel_km: int = 0
    
    # Yakıt
    yakit_tipi: str = "benzin"  # benzin veya dizel
    ortalama_tuketim_l_100km: float = 0.0
    
    # Bakım
    periyodik_bakim_km: int = 10000
    periyodik_bakim_maliyeti: float = 0.0
    
    # Sabit Giderler
    yillik_sigorta: float = 0.0
    yillik_mtv: float = 0.0
    yillik_ortalama_km: int = 15000
    
    # Değer Kaybı
    su_anki_fiyat: float = 0.0
    gelecek_fiyat: float = 0.0
    gelecek_km: int = 0

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(VehicleBase):
    pass

class ComponentCreate(BaseModel):
    vehicle_id: int
    parca_adi: str
    maliyet: float
    omur_km: int

class SettingsUpdate(BaseModel):
    manual_fuel_price: Optional[float] = None

# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Vehicle Master API v2 Çalışıyor 🚀"}

@app.get("/vehicles")
def get_vehicles():
    """Tüm araçları listeler."""
    return manager.get_all_vehicles()

@app.get("/vehicles/{vehicle_id}")
def get_vehicle_detail(vehicle_id: int):
    """Araç detaylarını getirir."""
    v = manager.get_vehicle_by_id(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    return v

@app.post("/vehicles", status_code=201)
def create_vehicle(vehicle: VehicleCreate):
    """Yeni araç oluşturur."""
    data = vehicle.dict()
    vehicle_id = manager.add_vehicle(data)
    
    if vehicle_id == -1:
        raise HTTPException(status_code=500, detail="Veritabanı hatası.")
    
    return {"id": vehicle_id, "message": "Araç eklendi."}

@app.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, vehicle: VehicleUpdate):
    """Araç bilgilerini günceller."""
    if not manager.get_vehicle_by_id(vehicle_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
        
    success = manager.update_vehicle(vehicle_id, vehicle.dict())
    if not success:
        raise HTTPException(status_code=500, detail="Güncelleme başarısız.")
        
    return {"message": "Araç güncellendi."}

@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int):
    """Aracı siler."""
    if not manager.get_vehicle_by_id(vehicle_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
        
    success = manager.delete_vehicle(vehicle_id)
    if not success:
        raise HTTPException(status_code=500, detail="Silme işlemi başarısız.")
        
    return {"message": "Araç silindi."}

# --- COMPONENTS ---

@app.get("/vehicles/{vehicle_id}/consumables")
def get_components(vehicle_id: int):
    return manager.get_vehicle_consumables(vehicle_id)

@app.post("/vehicles/{vehicle_id}/consumables")
def add_component(vehicle_id: int, comp: ComponentCreate):
    # URL'deki ID ile body'deki ID uyuşsun veya override edelim
    if comp.vehicle_id != vehicle_id:
        comp.vehicle_id = vehicle_id
    manager.add_consumable(comp.vehicle_id, comp.parca_adi, comp.maliyet, comp.omur_km)
    return {"message": "Parça eklendi."}

# --- COST ANALYSIS ---

@app.get("/vehicles/{vehicle_id}/analysis")
def get_analysis(vehicle_id: int):
    """Detaylı maliyet analizi."""
    if not manager.get_vehicle_by_id(vehicle_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
        
    return manager.calculate_total_km_cost(vehicle_id)

# --- SETTINGS ---

@app.get("/settings")
def get_settings():
    benzin = manager.get_setting('current_benzin_price')
    motorin = manager.get_setting('current_motorin_price')
    manual = manager.get_setting('manual_fuel_price')
    return {
        "live_benzin": benzin,
        "live_motorin": motorin,
        "manual_fuel_price": manual
    }

@app.post("/settings")
def update_settings(settings: SettingsUpdate):
    if settings.manual_fuel_price is not None:
        cursor = manager.conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ('manual_fuel_price', str(settings.manual_fuel_price)))
        manager.conn.commit()
    return {"message": "Ayarlar güncellendi."}

# --- FRONTEND UYUMLULUK ENDPOINTLERİ ---

@app.get("/costs/{vehicle_id}")
def get_costs(vehicle_id: int):
    """VehicleCard için maliyet analizi endpoint'i."""
    if not manager.get_vehicle_by_id(vehicle_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    
    result = manager.calculate_total_km_cost(vehicle_id)
    
    # Frontend'in beklediği format
    return {
        "vehicle_id": result.get("vehicle_id"),
        "total_cost_per_km": result.get("total_cost_per_km", 0),
        "breakdown": {
            "fuel": result.get("breakdown", {}).get("fuel_cost", 0),
            "maintenance": result.get("breakdown", {}).get("maintenance_cost", 0),
            "wear_tear": result.get("breakdown", {}).get("consumable_cost", 0),
            "depreciation": result.get("breakdown", {}).get("depreciation_cost", 0),
            "insurance": result.get("breakdown", {}).get("fixed_cost", 0)
        },
        "fuel_efficiency_l_100km": manager.get_vehicle_by_id(vehicle_id).get("ortalama_tuketim_l_100km", 0),
        "market_fuel_price_ref": result.get("params", {}).get("fuel_price_used", 0)
    }

@app.post("/components")
def add_component_direct(comp: ComponentCreate):
    """AddComponentForm için parça ekleme endpoint'i."""
    if not manager.get_vehicle_by_id(comp.vehicle_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    manager.add_consumable(comp.vehicle_id, comp.parca_adi, comp.maliyet, comp.omur_km)
    return {"message": "Parça eklendi."}


# --- DOSYA YÜKLEME ---

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Fotoğraf yükler ve URL döndürür."""
    # Sadece resim dosyalarına izin ver
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP).")
    
    # Benzersiz dosya adı oluştur
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Dosyayı kaydet
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
    
    # URL döndür
    return {"url": f"http://127.0.0.1:8000/uploads/{unique_filename}"}

