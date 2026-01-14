"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Vehicle } from "@/types/vehicle";
import { X, Save, Upload } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditVehicleModal({ vehicle, onSuccess, onCancel }: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    marka: vehicle.marka || "",
    model: vehicle.model || "",
    yil: vehicle.yil || new Date().getFullYear(),
    fotograf_url: vehicle.fotograf_url || "",
    baslangic_km: vehicle.baslangic_km || 0,
    guncel_km: vehicle.guncel_km || 0,
    yakit_tipi: vehicle.yakit_tipi || "benzin",
    ortalama_tuketim_l_100km: vehicle.ortalama_tuketim_l_100km || 0,
    periyodik_bakim_km: vehicle.periyodik_bakim_km || 2000,
    periyodik_bakim_maliyeti: vehicle.periyodik_bakim_maliyeti || 0,
    son_bakim_km: vehicle.son_bakim_km || 0,
    bakim_araligi: vehicle.bakim_araligi || 2000,
    yillik_sigorta: vehicle.yillik_sigorta || 0,
    yillik_mtv: vehicle.yillik_mtv || 0,
    yillik_ortalama_km: vehicle.yillik_ortalama_km || 15000,
    su_anki_fiyat: vehicle.su_anki_fiyat || 0,
    gelecek_fiyat: vehicle.gelecek_fiyat || 0,
    gelecek_km: vehicle.gelecek_km || 0
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(vehicle.fotograf_url || null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await axios.post(`${API_BASE}/upload`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFormData((prev) => ({
        ...prev,
        fotograf_url: response.data.url
      }));
    } catch (error) {
      alert("Fotoğraf yüklenirken hata oluştu!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API_BASE}/vehicles/${vehicle.id}`, formData);
      onSuccess();
    } catch (error) {
      alert("Araç güncellenirken bir hata oluştu!");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = [
      "yil", "baslangic_km", "guncel_km", "ortalama_tuketim_l_100km",
      "periyodik_bakim_km", "periyodik_bakim_maliyeti",
      "son_bakim_km", "bakim_araligi",
      "yillik_sigorta", "yillik_mtv", "yillik_ortalama_km",
      "su_anki_fiyat", "gelecek_fiyat", "gelecek_km"
    ].includes(name);

    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-full sm:max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-500 to-orange-500 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Araç Düzenle</h2>
            <p className="text-amber-100 text-xs sm:text-sm">{vehicle.marka} {vehicle.model}</p>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white p-1">
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="section-title">Temel Bilgiler</h3>
                <div>
                  <label className="label">Marka</label>
                  <input 
                    required 
                    name="marka" 
                    className="input" 
                    value={formData.marka}
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input 
                    required 
                    name="model" 
                    className="input" 
                    value={formData.model}
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Yıl</label>
                  <input 
                    required 
                    type="number" 
                    name="yil" 
                    className="input" 
                    value={formData.yil}
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Fotoğraf</label>
                  <div className="space-y-2">
                    {previewUrl && (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={previewUrl} alt="Önizleme" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <span className="text-sm text-gray-500">Yükleniyor...</span>
                      ) : (
                        <>
                          <Upload size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Değiştir</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="section-title">Kilometre & Yakıt</h3>
                <div>
                  <label className="label">Güncel Kilometre</label>
                  <input 
                    type="number" 
                    name="guncel_km" 
                    className="input" 
                    value={formData.guncel_km}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        guncel_km: value,
                        baslangic_km: prev.baslangic_km || value
                      }));
                    }} 
                  />
                </div>
                <div>
                  <label className="label">Yakıt Tipi</label>
                  <select 
                    name="yakit_tipi" 
                    className="input" 
                    value={formData.yakit_tipi}
                    onChange={handleChange}
                  >
                    <option value="benzin">Benzin</option>
                    <option value="dizel">Dizel</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ort. Tüketim (L/100km)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="ortalama_tuketim_l_100km" 
                    className="input" 
                    value={formData.ortalama_tuketim_l_100km}
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Yıllık Ortalama KM</label>
                  <input 
                    type="number" 
                    name="yillik_ortalama_km" 
                    className="input" 
                    value={formData.yillik_ortalama_km}
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Servis Takibi */}
            <h3 className="section-title">Servis Takibi & Bakım</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">Son Bakım (KM)</label>
                <input 
                  type="number" 
                  name="son_bakim_km" 
                  className="input" 
                  value={formData.son_bakim_km}
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="label">Bakım Aralığı (KM)</label>
                <input 
                  type="number" 
                  name="periyodik_bakim_km" 
                  className="input" 
                  value={formData.periyodik_bakim_km}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      periyodik_bakim_km: value,
                      bakim_araligi: value 
                    }));
                  }} 
                />
              </div>
              <div>
                <label className="label">Bakım Maliyeti (TL)</label>
                <input 
                  type="number" 
                  name="periyodik_bakim_maliyeti" 
                  className="input" 
                  value={formData.periyodik_bakim_maliyeti}
                  onChange={handleChange} 
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Sabit Giderler */}
            <h3 className="section-title">Sabit Giderler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Yıllık Sigorta (TL)</label>
                <input 
                  type="number" 
                  name="yillik_sigorta" 
                  className="input" 
                  value={formData.yillik_sigorta}
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="label">Yıllık MTV (TL)</label>
                <input 
                  type="number" 
                  name="yillik_mtv" 
                  className="input" 
                  value={formData.yillik_mtv}
                  onChange={handleChange} 
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Değer Kaybı */}
            <h3 className="section-title">Değer Kaybı (Amortisman)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">Şu Anki Değer (TL)</label>
                <input 
                  type="number" 
                  name="su_anki_fiyat" 
                  className="input" 
                  value={formData.su_anki_fiyat}
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="label">Tahmini Gelecek Değer (TL)</label>
                <input 
                  type="number" 
                  name="gelecek_fiyat" 
                  className="input" 
                  value={formData.gelecek_fiyat}
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="label">Hedef KM</label>
                <input 
                  type="number" 
                  name="gelecek_km" 
                  className="input" 
                  value={formData.gelecek_km}
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 py-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 shadow-lg shadow-amber-500/30 font-medium transition-all active:scale-95 text-sm disabled:opacity-50"
              >
                <Save size={16} /> {saving ? "Kaydediliyor..." : "Güncelle"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .label {
            @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
        }
        .input {
            @apply w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm;
        }
        .section-title {
            @apply text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1;
        }
      `}</style>
    </div>
  );
}
