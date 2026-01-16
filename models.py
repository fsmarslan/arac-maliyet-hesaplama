import sqlite3
import json
from typing import List, Dict, Optional, Union
from datetime import datetime
try:
    from utils import get_current_fuel_prices
except ImportError:
    # utils dosyası henüz olmayabilir veya bağımlılıklar eksiktir
    def get_current_fuel_prices():
        return {'benzin': 45.0, 'motorin': 46.0}

class VehicleManager:
    """
    Araç veritabanı işlemlerini yöneten sınıf.
    SQLite veritabanı bağlantısı, kayıt tutma ve maliyet hesaplama işlemlerini kapsar.
    """
    def __init__(self, db_name="vehicle_master.db"):
        # check_same_thread=False, çok kanallı (multi-threaded) ortamlarda (FastAPI vb.)
        # aynı bağlantının farklı thread'lerden çağrılabilmesini sağlar.
        self.conn = sqlite3.connect(db_name, check_same_thread=False)
        # Row factory ile sonuçları sözlük gibi (dictionary-like) alabiliriz
        self.conn.row_factory = sqlite3.Row 
        self.create_tables()

    def create_tables(self):
        """Tüm gerekli tabloları oluşturur ve şema güncellemelerini yapar."""
        cursor = self.conn.cursor()
        
        # 1. Vehicle tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                marka TEXT NOT NULL,
                model TEXT NOT NULL,
                yil INTEGER,
                fotograf_url TEXT,
                
                -- Kilometre Bilgileri
                baslangic_km INTEGER DEFAULT 0,
                guncel_km INTEGER DEFAULT 0,
                
                -- Yakıt ve Tüketim
                yakit_tipi TEXT DEFAULT 'benzin',
                ortalama_tuketim_l_100km REAL DEFAULT 0,
                
                -- Bakım (Maintenance)
                periyodik_bakim_km INTEGER DEFAULT 10000,
                periyodik_bakim_maliyeti REAL DEFAULT 0,
                
                -- Servis Takibi (NEW)
                son_bakim_km INTEGER DEFAULT 0,
                bakim_araligi INTEGER DEFAULT 2000,
                
                -- Sabit Giderler (FixedCosts)
                yillik_sigorta REAL DEFAULT 0,
                yillik_mtv REAL DEFAULT 0,
                yillik_ortalama_km INTEGER DEFAULT 15000,
                
                -- Değer Kaybı (Depreciation Parametreleri)
                su_anki_fiyat REAL DEFAULT 0,
                gelecek_fiyat REAL DEFAULT 0,
                gelecek_km INTEGER DEFAULT 0
            )
        """)

        # Migration: Vehicles tablosuna yeni sütunları ekle (eğer yoksa)
        columns_to_add = [
            ("baslangic_km", "INTEGER DEFAULT 0"),
            ("guncel_km", "INTEGER DEFAULT 0"),
            ("yakit_tipi", "TEXT DEFAULT 'benzin'"),
            ("ortalama_tuketim_l_100km", "REAL DEFAULT 0"),
            ("periyodik_bakim_maliyeti", "REAL DEFAULT 0"),
            ("son_bakim_km", "INTEGER DEFAULT 0"),
            ("bakim_araligi", "INTEGER DEFAULT 2000"),
            ("yillik_sigorta", "REAL DEFAULT 0"),
            ("yillik_mtv", "REAL DEFAULT 0"),
            ("yillik_ortalama_km", "INTEGER DEFAULT 15000"),
            ("su_anki_fiyat", "REAL DEFAULT 0"),
            ("gelecek_fiyat", "REAL DEFAULT 0"),
            ("gelecek_km", "INTEGER DEFAULT 0")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE vehicles ADD COLUMN {col_name} {col_type}")
            except sqlite3.OperationalError:
                pass # Sütun zaten var

        # 2. Consumables (Parçalar/Sarf Malzeme) Tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS consumables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER,
                parca_adi TEXT,
                maliyet REAL,
                omur_km INTEGER,
                degisim_km INTEGER DEFAULT 0,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
            )
        """)

        # Migration: Consumables tablosuna yeni sütunları ekle (eğer yoksa)
        consumable_columns = [
            ("degisim_km", "INTEGER DEFAULT 0"),
        ]
        for col_name, col_type in consumable_columns:
            try:
                cursor.execute(f"ALTER TABLE consumables ADD COLUMN {col_name} {col_type}")
            except sqlite3.OperationalError:
                pass

        # 3. Service Logs (Servis Kayıtları) Tablosu - YENİ
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER,
                tarih TEXT NOT NULL,
                km INTEGER NOT NULL,
                yapilan_islemler TEXT,
                toplam_maliyet REAL DEFAULT 0,
                degisen_parcalar TEXT,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
            )
        """)

        # 4. Settings Tablosu (Konfigürasyon ve Fiyatlar)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        
        self.conn.commit()
        
        # Fiyatları güncelle
        self.update_fuel_prices_if_needed()

    def update_fuel_prices_if_needed(self):
        """İnternetten güncel fiyatları çeker ve veritabanına yazar."""
        prices = get_current_fuel_prices()
        
        cursor = self.conn.cursor()
        if prices:
            try:
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ('current_benzin_price', str(prices['benzin'])))
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ('current_motorin_price', str(prices['motorin'])))
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ('last_fuel_price_update', 'Just Now')) 
                self.conn.commit()
                print(f"🌍 Fiyatlar güncellendi: Benzin {prices['benzin']}, Motorin {prices['motorin']}")
            except sqlite3.Error as e:
                print(f"⚠️ Ayarlar güncellenemedi: {e}") 
        else:
            # İnternet yoksa veya fiyat çekilemezse, mevcut eski fiyatları korur
            print("⚠️ Canlı fiyat çekilemedi, veritabanındaki eski fiyatlar kullanılacak.")

    # --- VERİ GİRİŞİ (INSERT) FONKSİYONLARI ---

    def add_vehicle(self, data: Dict) -> int:
        """Yeni araç ekler. Dictionary alır."""
        try:
            # Gerekli alanları çıkart (veritabanı sütun sırası)
            keys = [
                'marka', 'model', 'yil', 'fotograf_url',
                'baslangic_km', 'guncel_km', 'yakit_tipi', 'ortalama_tuketim_l_100km',
                'periyodik_bakim_km', 'periyodik_bakim_maliyeti',
                'son_bakim_km', 'bakim_araligi',
                'yillik_sigorta', 'yillik_mtv', 'yillik_ortalama_km',
                'su_anki_fiyat', 'gelecek_fiyat', 'gelecek_km'
            ]
            
            # None kontrolü ve default değerler
            values = []
            for k in keys:
                values.append(data.get(k))

            query = f"""
                INSERT INTO vehicles ({', '.join(keys)})
                VALUES ({', '.join(['?']*len(keys))})
            """
            
            cursor = self.conn.cursor()
            cursor.execute(query, tuple(values))
            vehicle_id = cursor.lastrowid
            
            self.conn.commit()
            return vehicle_id

        except sqlite3.Error as e:
            print(f"❌ Araç eklenirken hata oluştu: {e}")
            return -1

    def update_vehicle(self, vehicle_id: int, data: Dict):
        """Araç günceller."""
        try:
            set_clauses = []
            values = []
            for k, v in data.items():
                if k != 'id':
                    set_clauses.append(f"{k} = ?")
                    values.append(v)
            
            values.append(vehicle_id)
            query = f"UPDATE vehicles SET {', '.join(set_clauses)} WHERE id = ?"
            
            cursor = self.conn.cursor()
            cursor.execute(query, tuple(values))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"❌ Araç güncelleme hatası: {e}")
            return False

    def delete_vehicle(self, vehicle_id: int) -> bool:
        """Aracı ve ilişkili parçalarını siler."""
        try:
            cursor = self.conn.cursor()
            # Önce ilişkili parçaları ve servis kayıtlarını sil (Cascade Logic)
            cursor.execute("DELETE FROM consumables WHERE vehicle_id = ?", (vehicle_id,))
            cursor.execute("DELETE FROM service_logs WHERE vehicle_id = ?", (vehicle_id,))
            # Sonra aracı sil
            cursor.execute("DELETE FROM vehicles WHERE id = ?", (vehicle_id,))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"❌ Araç silme hatası: {e}")
            return False

    def div_safely(self, numerator, denominator, default=0.0):
        try:
            if not denominator or denominator == 0:
                return default
            val = numerator / denominator
            return val
        except (ZeroDivisionError, TypeError):
            return default

    def add_consumable(self, vehicle_id: int, parca_adi: str, maliyet: float, omur_km: int):
        """Parça/Sarf Malzeme ekler."""
        try:
            query = """
                INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km)
                VALUES (?, ?, ?, ?)
            """
            cursor = self.conn.cursor()
            cursor.execute(query, (vehicle_id, parca_adi, maliyet, omur_km))
            self.conn.commit()
        except sqlite3.Error as e:
            print(f"❌ Parça ekleme hatası: {e}")
    
    def get_vehicle_consumables(self, vehicle_id: int) -> List[Dict]:
        """Araca ait sarf malzemeleri getirir."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM consumables WHERE vehicle_id = ?", (vehicle_id,))
        return [dict(row) for row in cursor.fetchall()]

    def update_consumable(self, consumable_id: int, data: Dict) -> bool:
        """Parça bilgilerini günceller."""
        try:
            set_clauses = []
            values = []
            for k, v in data.items():
                if k != 'id' and v is not None:
                    set_clauses.append(f"{k} = ?")
                    values.append(v)
            
            if not set_clauses:
                return True
                
            values.append(consumable_id)
            query = f"UPDATE consumables SET {', '.join(set_clauses)} WHERE id = ?"
            
            cursor = self.conn.cursor()
            cursor.execute(query, tuple(values))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"❌ Parça güncelleme hatası: {e}")
            return False

    def delete_consumable(self, consumable_id: int) -> bool:
        """Parçayı siler."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM consumables WHERE id = ?", (consumable_id,))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"❌ Parça silme hatası: {e}")
            return False

    # --- HESAPLAMA MOTORU (THE ENGINE) ---

    def calculate_total_km_cost(self, vehicle_id: int) -> Dict:
        """
        1 KM Başına Gerçek Maliyeti ve Dökümünü Hesaplar.
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE id = ?", (vehicle_id,))
        vehicle = cursor.fetchone()
        if not vehicle: return {}

        v = dict(vehicle)

        # 1. Yakıt Maliyeti
        # Canlı çekilen fiyatı al (Settings'den)
        benzin_price = float(self.get_setting('current_benzin_price') or 45.0)
        motorin_price = float(self.get_setting('current_motorin_price') or 45.0)
        
        # Araç yakıt tipine göre fiyat seç
        yakit_tipi = v.get('yakit_tipi', 'benzin') or 'benzin'
        fuel_price = motorin_price if yakit_tipi == 'dizel' else benzin_price 
        
        # Manuel Override Kontrolü (Settings'de 'manual_fuel_price' varsa onu kullan)
        manual_price = self.get_setting('manual_fuel_price')
        if manual_price:
            fuel_price = float(manual_price)

        avg_consumption = v.get('ortalama_tuketim_l_100km', 0) or 0
        fuel_cost = (avg_consumption / 100) * fuel_price

        # 2. Bakım Birim Maliyeti
        maint_cost = v.get('periyodik_bakim_maliyeti', 0) or 0
        maint_km = v.get('periyodik_bakim_km', 10000) or 10000
        maintenance_unit_cost = self.div_safely(maint_cost, maint_km)

        # 3. Parça Eskime Payı
        consumables = self.get_vehicle_consumables(vehicle_id)
        consumable_cost = 0.0
        consumable_details = []
        for c in consumables:
            parca_maliyeti = self.div_safely(c['maliyet'], c['omur_km'])
            consumable_cost += parca_maliyeti
            consumable_details.append({
                "parca_adi": c['parca_adi'],
                "km_basi_maliyet": round(parca_maliyeti, 4),
                "toplam_maliyet": c['maliyet'],
                "omur_km": c['omur_km']
            })

        # 4. KM Başı Değer Kaybı
        # (su_anki_fiyat - gelecek_fiyat) / (gelecek_km - su_anki_km)
        current_price = v.get('su_anki_fiyat', 0) or 0
        future_price = v.get('gelecek_fiyat', 0) or 0
        current_km = v.get('guncel_km', 0) or 0
        future_km = v.get('gelecek_km', 0) or 0
        
        # Mantıksal Koruma: Gelecek KM, güncel KM'den küçük veya eşit olamaz.
        # Bu durumda kullanıcıya hata vermez ama hesaplamayı 0 yaparız.
        km_diff = future_km - current_km
        if km_diff <= 0:
            depreciation_cost = 0.0
        else:
            depreciation_cost = self.div_safely(
                (current_price - future_price), 
                km_diff
            )
            
        if depreciation_cost < 0: depreciation_cost = 0 # Negatif değer kaybı (kar) olmasın

        # 5. Sabit Gider Payı (Analiz için hesaplanıyor ama toplam KM maliyetine dahil edilmiyor)
        # (yillik_sigorta + yillik_mtv) / kullanicinin_yillik_ortalama_km
        yillik_sigorta = v.get('yillik_sigorta', 0) or 0
        yillik_mtv = v.get('yillik_mtv', 0) or 0
        fixed_total = yillik_sigorta + yillik_mtv
        yearly_avg_km = v.get('yillik_ortalama_km', 15000) or 15000
        
        fixed_cost_per_km = self.div_safely(fixed_total, yearly_avg_km)

        # TOPLAM (Sadece marjinal/sürüşe bağlı giderler)
        total_marginal_cost = fuel_cost + maintenance_unit_cost + consumable_cost + depreciation_cost

        return {
            "vehicle_id": vehicle_id,
            "total_cost_per_km": round(total_marginal_cost, 4), # Kuruş hesabı için 4 hane
            "total_fixed_cost_yearly": round(fixed_total, 2),
            "breakdown": {
                "fuel_cost": round(fuel_cost, 4),
                "maintenance_cost": round(maintenance_unit_cost, 4),
                "consumable_cost": round(consumable_cost, 4),
                "depreciation_cost": round(depreciation_cost, 4),
                "fixed_cost_per_km": round(fixed_cost_per_km, 4)
            },
            "consumable_details": consumable_details,
            "fixed_details": {
                "yillik_sigorta": yillik_sigorta,
                "yillik_mtv": yillik_mtv,
                "yillik_ortalama_km": yearly_avg_km,
                "total_fixed_yearly": fixed_total
            },
            "params": {
                "fuel_price_used": fuel_price,
                "current_km": current_km,
                "avg_consumption": avg_consumption
            }
        }

    def list_vehicles(self):
        """Araçları listeler."""
        print("\n🚗 --- KAYITLI ARAÇLAR --- 🚗")
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vehicles")
        rows = cursor.fetchall()

        if not rows:
            print("Henüz kayıtlı araç yok.")
            return

        for row in rows:
            print(f"ID: {row['id']} | {row['marka']} {row['model']}")
            print("-" * 40)

    # --- API YARDIMCI METODLARI ---

    def get_all_vehicles(self) -> List[Dict]:
        """Tüm araçları sözlük listesi olarak döndürür."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vehicles")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def get_vehicle_by_id(self, vehicle_id: int) -> Optional[Dict]:
        """ID'ye göre tek bir araç döndürür."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE id=?", (vehicle_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_setting(self, key: str) -> Optional[str]:
        """Ayarlardan bir değer okur."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key=?", (key,))
        row = cursor.fetchone()
        return row['value'] if row else None

    # --- SERVİS TAKİBİ FONKSİYONLARI ---

    def add_service_log(self, vehicle_id: int, tarih: str, km: int, 
                        yapilan_islemler: str, toplam_maliyet: float, 
                        degisen_parcalar: Optional[str] = None) -> int:
        """Yeni servis kaydı ekler."""
        try:
            query = """
                INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            cursor = self.conn.cursor()
            cursor.execute(query, (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar))
            log_id = cursor.lastrowid
            
            # Aracın son bakım km'sini güncelle
            cursor.execute("UPDATE vehicles SET son_bakim_km = ? WHERE id = ?", (km, vehicle_id))
            
            self.conn.commit()
            return log_id
        except sqlite3.Error as e:
            print(f"❌ Servis kaydı ekleme hatası: {e}")
            return -1

    def get_service_logs(self, vehicle_id: int) -> List[Dict]:
        """Araca ait servis kayıtlarını getirir."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM service_logs WHERE vehicle_id = ? ORDER BY tarih DESC, km DESC", (vehicle_id,))
        return [dict(row) for row in cursor.fetchall()]

    def delete_service_log(self, log_id: int) -> bool:
        """Servis kaydını siler."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM service_logs WHERE id = ?", (log_id,))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"❌ Servis kaydı silme hatası: {e}")
            return False

    def get_maintenance_status(self, vehicle_id: int) -> Dict:
        """
        Bakım durumu bilgilerini hesaplar.
        Returns: {
            son_bakim_km, bakim_araligi, gelecek_bakim_km,
            guncel_km, kalan_km, ilerleme_yuzdesi
        }
        """
        vehicle = self.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            return {}
        
        son_bakim_km = vehicle.get('son_bakim_km', 0) or 0
        bakim_araligi = vehicle.get('bakim_araligi', 2000) or 2000
        guncel_km = vehicle.get('guncel_km', 0) or 0
        
        gelecek_bakim_km = son_bakim_km + bakim_araligi
        kalan_km = gelecek_bakim_km - guncel_km
        
        # İlerleme yüzdesi hesaplama (son bakımdan şimdiye kadar)
        gecen_km = guncel_km - son_bakim_km
        ilerleme_yuzdesi = min(100, max(0, (gecen_km / bakim_araligi) * 100)) if bakim_araligi > 0 else 0
        
        return {
            "son_bakim_km": son_bakim_km,
            "bakim_araligi": bakim_araligi,
            "gelecek_bakim_km": gelecek_bakim_km,
            "guncel_km": guncel_km,
            "kalan_km": kalan_km,
            "ilerleme_yuzdesi": round(ilerleme_yuzdesi, 1)
        }

    def get_critical_warnings(self, vehicle_id: int, warning_threshold_km: int = 500) -> List[Dict]:
        """
        Kritik parça uyarılarını kontrol eder.
        Ömrünün bitmesine warning_threshold_km'den az kalan parçaları döndürür.
        """
        vehicle = self.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            return []
        
        guncel_km = vehicle.get('guncel_km', 0) or 0
        consumables = self.get_vehicle_consumables(vehicle_id)
        warnings = []
        
        for c in consumables:
            degisim_km = c.get('degisim_km', 0) or 0
            omur_km = c.get('omur_km', 10000) or 10000
            
            # Parçanın biteceği km
            bitis_km = degisim_km + omur_km
            kalan_omur = bitis_km - guncel_km
            
            if kalan_omur <= warning_threshold_km:
                warnings.append({
                    "parca_id": c['id'],
                    "parca_adi": c['parca_adi'],
                    "kalan_omur_km": kalan_omur,
                    "bitis_km": bitis_km,
                    "kritik": kalan_omur <= 0
                })
        
        # Bakım uyarısı da ekle
        maint_status = self.get_maintenance_status(vehicle_id)
        if maint_status.get('kalan_km', 1000) <= warning_threshold_km:
            warnings.append({
                "parca_id": None,
                "parca_adi": "Periyodik Bakım",
                "kalan_omur_km": maint_status['kalan_km'],
                "bitis_km": maint_status['gelecek_bakim_km'],
                "kritik": maint_status['kalan_km'] <= 0
            })
        
        return warnings

    def add_consumable_with_km(self, vehicle_id: int, parca_adi: str, maliyet: float, omur_km: int, degisim_km: int = 0):
        """Parça/Sarf Malzeme ekler (değişim km'si ile)."""
        try:
            # Eğer degisim_km verilmemişse, aracın güncel km'sini kullan
            if degisim_km == 0:
                vehicle = self.get_vehicle_by_id(vehicle_id)
                if vehicle:
                    degisim_km = vehicle.get('guncel_km', 0) or 0
            
            query = """
                INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
                VALUES (?, ?, ?, ?, ?)
            """
            cursor = self.conn.cursor()
            cursor.execute(query, (vehicle_id, parca_adi, maliyet, omur_km, degisim_km))
            self.conn.commit()
        except sqlite3.Error as e:
            print(f"❌ Parça ekleme hatası: {e}")

    def close(self):
        self.conn.close()
