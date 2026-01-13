import requests
from bs4 import BeautifulSoup
import re

def get_current_fuel_prices():
    """
    Petrol Ofisi web sitesinden İstanbul Avrupa yakası güncel akaryakıt fiyatlarını çeker.
    Geriye {'benzin': float, 'motorin': float} döner.
    Hata durumunda None döndürür.
    """
    url = "https://www.petrolofisi.com.tr/akaryakit-fiyatlari"
    prices = {}
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Petrol Ofisi yapısı: table.table-prices içinde tr.price-row
            # İstanbul Avrupa satırını bul
            rows = soup.find_all('tr', class_='price-row')
            
            for row in rows:
                district_name = row.get('data-disctrict-name', '')
                
                if 'ISTANBUL (AVRUPA)' in district_name.upper() or 'İSTANBUL (AVRUPA)' in district_name.upper():
                    # KDV dahil fiyatları çek (with-tax class'ı)
                    price_spans = row.find_all('span', class_='with-tax')
                    
                    if len(price_spans) >= 2:
                        # İlk fiyat: Benzin (Kurşunsuz 95)
                        # İkinci fiyat: Motorin (Diesel)
                        benzin_price = _parse_price(price_spans[0].get_text())
                        motorin_price = _parse_price(price_spans[1].get_text())
                        
                        if benzin_price > 0 and motorin_price > 0:
                            prices['benzin'] = benzin_price
                            prices['motorin'] = motorin_price
                            print(f"✅ Fiyatlar çekildi - Benzin: {benzin_price} TL, Motorin: {motorin_price} TL")
                            return prices
            
            # Eğer ISTANBUL AVRUPA bulunamazsa, ilk satırı dene
            if not prices and rows:
                first_row = rows[0]
                price_spans = first_row.find_all('span', class_='with-tax')
                if len(price_spans) >= 2:
                    benzin_price = _parse_price(price_spans[0].get_text())
                    motorin_price = _parse_price(price_spans[1].get_text())
                    if benzin_price > 0 and motorin_price > 0:
                        prices['benzin'] = benzin_price
                        prices['motorin'] = motorin_price
                        print(f"✅ Fiyatlar çekildi (ilk satır) - Benzin: {benzin_price} TL, Motorin: {motorin_price} TL")
                        return prices
                                
    except Exception as e:
        print(f"⚠️ Fiyat çekme hatası (Petrol Ofisi): {e}")

    return None

def _parse_price(price_str):
    """ '53,16 TL/L' gibi stringleri float'a çevirir. """
    try:
        # Sadece rakam ve virgül/noktayı al
        # Örn: "53,16" -> 53.16
        # Temizlik:
        clean_str = re.sub(r'[^\d,.]', '', price_str)
        # Virgülü noktaya çevir
        clean_str = clean_str.replace(',', '.')
        
        val = float(clean_str)
        return val
    except (ValueError, TypeError):
        return 0.0
