"""
Test Verisi Ekleme Scripti
QJ Motor SRV 125 (2024) örnek araç verisi
"""

import sqlite3
from datetime import datetime

def add_test_data():
    conn = sqlite3.connect("vehicle_master.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Önce mevcut test aracını kontrol et
    cursor.execute("SELECT id FROM vehicles WHERE marka = 'QJ Motor' AND model = 'SRV 125'")
    existing = cursor.fetchone()
    
    if existing:
        print("⚠️ QJ Motor SRV 125 zaten mevcut. Güncelleniyor...")
        vehicle_id = existing['id']
        
        # Güncelle
        cursor.execute("""
            UPDATE vehicles SET
                yil = 2024,
                baslangic_km = 0,
                guncel_km = 11100,
                yakit_tipi = 'benzin',
                ortalama_tuketim_l_100km = 2.5,
                periyodik_bakim_km = 2000,
                periyodik_bakim_maliyeti = 800,
                son_bakim_km = 10500,
                bakim_araligi = 2000,
                yillik_sigorta = 4000,
                yillik_mtv = 1000,
                yillik_ortalama_km = 5000,
                su_anki_fiyat = 120000,
                gelecek_fiyat = 100000,
                gelecek_km = 21100
            WHERE id = ?
        """, (vehicle_id,))
        
    else:
        print("✅ QJ Motor SRV 125 ekleniyor...")
        
        # Yeni araç ekle
        cursor.execute("""
            INSERT INTO vehicles (
                marka, model, yil, fotograf_url,
                baslangic_km, guncel_km, yakit_tipi, ortalama_tuketim_l_100km,
                periyodik_bakim_km, periyodik_bakim_maliyeti,
                son_bakim_km, bakim_araligi,
                yillik_sigorta, yillik_mtv, yillik_ortalama_km,
                su_anki_fiyat, gelecek_fiyat, gelecek_km
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'QJ Motor', 'SRV 125', 2024, None,
            0, 11100, 'benzin', 2.5,
            2000, 800,
            10500, 2000,
            4000, 1000, 5000,
            120000, 100000, 21100
        ))
        vehicle_id = cursor.lastrowid
    
    conn.commit()
    print(f"   Araç ID: {vehicle_id}")
    
    # Parçaları ekle (önce mevcutları sil)
    cursor.execute("DELETE FROM consumables WHERE vehicle_id = ?", (vehicle_id,))
    
    # Zincir Dişli Seti (6000 TL, 20.000 km ömürlü)
    cursor.execute("""
        INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
        VALUES (?, ?, ?, ?, ?)
    """, (vehicle_id, 'Zincir Dişli Seti', 6000, 20000, 0))
    
    # Yağ Filtresi
    cursor.execute("""
        INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
        VALUES (?, ?, ?, ?, ?)
    """, (vehicle_id, 'Motor Yağı + Filtre', 500, 2000, 10500))
    
    # Arka Balata
    cursor.execute("""
        INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
        VALUES (?, ?, ?, ?, ?)
    """, (vehicle_id, 'Arka Balata', 400, 15000, 0))
    
    # Ön Balata
    cursor.execute("""
        INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
        VALUES (?, ?, ?, ?, ?)
    """, (vehicle_id, 'Ön Balata', 500, 12000, 0))
    
    # Lastik Seti
    cursor.execute("""
        INSERT INTO consumables (vehicle_id, parca_adi, maliyet, omur_km, degisim_km)
        VALUES (?, ?, ?, ?, ?)
    """, (vehicle_id, 'Lastik Seti', 3000, 15000, 0))
    
    conn.commit()
    print("   ✅ Parçalar eklendi")
    
    # Örnek servis kayıtları ekle
    cursor.execute("DELETE FROM service_logs WHERE vehicle_id = ?", (vehicle_id,))
    
    # İlk bakım
    cursor.execute("""
        INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        vehicle_id, 
        '2025-06-15', 
        2000, 
        'İlk bakım yapıldı. Yağ ve filtre değişimi, genel kontrol.',
        500,
        'Motor Yağı, Yağ Filtresi'
    ))
    
    # İkinci bakım
    cursor.execute("""
        INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        vehicle_id, 
        '2025-08-20', 
        4500, 
        'Periyodik bakım. Yağ değişimi, zincir yağlama, fren kontrolü.',
        600,
        'Motor Yağı, Yağ Filtresi'
    ))
    
    # Üçüncü bakım
    cursor.execute("""
        INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        vehicle_id, 
        '2025-10-10', 
        6500, 
        'Periyodik bakım. Hava filtresi değişimi, buji kontrolü.',
        750,
        'Motor Yağı, Yağ Filtresi, Hava Filtresi'
    ))
    
    # Dördüncü bakım
    cursor.execute("""
        INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        vehicle_id, 
        '2025-11-25', 
        8500, 
        'Periyodik bakım. Zincir gerginlik ayarı, yağ değişimi.',
        550,
        'Motor Yağı, Yağ Filtresi'
    ))
    
    # Son bakım
    cursor.execute("""
        INSERT INTO service_logs (vehicle_id, tarih, km, yapilan_islemler, toplam_maliyet, degisen_parcalar)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        vehicle_id, 
        '2026-01-05', 
        10500, 
        'Periyodik bakım. Yağ değişimi, zincir yağlama, genel kontrol. Her şey yolunda.',
        500,
        'Motor Yağı, Yağ Filtresi'
    ))
    
    conn.commit()
    print("   ✅ Servis kayıtları eklendi")
    
    # Sonuç özeti
    print("\n📊 ÖZET")
    print("=" * 50)
    print(f"Araç: QJ Motor SRV 125 (2024)")
    print(f"Güncel KM: 11.100")
    print(f"Son Bakım: 10.500 km | Bakım Aralığı: 2.000 km")
    print(f"Gelecek Bakım: 12.500 km (1.400 km kaldı)")
    print(f"Yıllık Masraf: Sigorta 4.000 TL + MTV 1.000 TL = 5.000 TL")
    print(f"Yıllık Ort. KM: 5.000")
    print("=" * 50)
    
    conn.close()
    print("\n✅ Test verisi başarıyla eklendi!")

if __name__ == "__main__":
    add_test_data()
