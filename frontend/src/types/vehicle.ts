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
  
  // Servis Takibi (YENİ)
  son_bakim_km: number;
  bakim_araligi: number;
  
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

export interface ConsumableDetail {
  id?: number;
  parca_adi: string;
  km_basi_maliyet: number;
  toplam_maliyet: number;
  omur_km: number;
}

export interface FixedDetails {
  yillik_sigorta: number;
  yillik_mtv: number;
  yillik_ortalama_km: number;
}

export interface MaintenanceStatus {
  son_bakim_km: number;
  bakim_araligi: number;
  gelecek_bakim_km: number;
  guncel_km: number;
  kalan_km: number;
  ilerleme_yuzdesi: number;
}

export interface CriticalWarning {
  parca_id: number | null;
  parca_adi: string;
  kalan_omur_km: number;
  bitis_km: number;
  kritik: boolean;
}

export interface CostReport {
  vehicle_id: number;
  total_cost_per_km: number;
  breakdown?: CostBreakdown;
  consumable_details?: ConsumableDetail[];
  fixed_details?: FixedDetails;
  cost_per_km_tl?: number; // Legacy support
  fuel_efficiency_l_100km: number;
  market_fuel_price_ref: number | string;
  maintenance_status?: MaintenanceStatus;
  warnings?: CriticalWarning[];
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
  son_bakim_km: number;
  bakim_araligi: number;
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
  degisim_km: number;
}

export interface ComponentCreate {
  vehicle_id: number;
  parca_adi: string;
  maliyet: number;
  omur_km: number;
  degisim_km?: number;
}

export interface ServiceLog {
  id: number;
  vehicle_id: number;
  tarih: string;
  km: number;
  yapilan_islemler: string;
  toplam_maliyet: number;
  degisen_parcalar?: string;
}

export interface ServiceLogCreate {
  vehicle_id: number;
  tarih: string;
  km: number;
  yapilan_islemler: string;
  toplam_maliyet: number;
  degisen_parcalar?: string;
}
