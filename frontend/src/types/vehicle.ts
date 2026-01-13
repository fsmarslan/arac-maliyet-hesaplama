export interface Vehicle {
  id: number;
  marka: string;
  model: string;
  yil: number;
  fotograf_url?: string;
  
  // KM Bilgileri
  baslangic_km: number;
  guncel_km: number;
  
  // Yakıt
  yakit_tipi: 'benzin' | 'dizel';
  ortalama_tuketim_l_100km: number;
  
  // Bakım
  periyodik_bakim_km: number;
  periyodik_bakim_maliyeti: number;
  
  // Sabit Giderler
  yillik_sigorta: number;
  yillik_mtv: number;
  yillik_ortalama_km: number;
  
  // Değer Kaybı
  su_anki_fiyat: number;
  gelecek_fiyat: number;
  gelecek_km: number;
}

export interface CostBreakdown {
  fuel: number;
  maintenance: number;
  wear_tear: number;
  depreciation: number;
  insurance: number;
}

export interface CostReport {
  vehicle_id: number;
  total_cost_per_km: number;
  breakdown?: CostBreakdown;
  cost_per_km_tl?: number; // Legacy support
  fuel_efficiency_l_100km: number;
  market_fuel_price_ref: number | string;
  status?: string;
}

export interface CreateVehicleData {
  marka: string;
  model: string;
  yil: number;
  fotograf_url?: string;
  baslangic_km: number;
  guncel_km: number;
  yakit_tipi: 'benzin' | 'dizel';
  ortalama_tuketim_l_100km: number;
  periyodik_bakim_km: number;
  periyodik_bakim_maliyeti: number;
  yillik_sigorta: number;
  yillik_mtv: number;
  yillik_ortalama_km: number;
  su_anki_fiyat: number;
  gelecek_fiyat: number;
  gelecek_km: number;
}

export interface Component {
  id: number;
  vehicle_id: number;
  parca_adi: string;
  maliyet: number;
  omur_km: number;
}

export interface ComponentCreate {
  vehicle_id: number;
  parca_adi: string;
  maliyet: number;
  omur_km: number;
}
