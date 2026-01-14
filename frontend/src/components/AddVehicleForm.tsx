"use client";

import { useState } from "react";
import axios from "axios";
import { CreateVehicleData } from "@/types/vehicle";
import { X, Save, Upload } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface AddVehicleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddVehicleForm({ onSuccess, onCancel }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<CreateVehicleData>({
    marka: "",
    model: "",
    yil: new Date().getFullYear(),
    fotograf_url: "",
    baslangic_km: 0,
    guncel_km: 0,
    yakit_tipi: "benzin",
    ortalama_tuketim_l_100km: 0,
    periyodik_bakim_km: 2000,
    periyodik_bakim_maliyeti: 0,
    son_bakim_km: 0,
    bakim_araligi: 2000,
    yillik_sigorta: 0,
    yillik_mtv: 0,
    yillik_ortalama_km: 15000,
    su_anki_fiyat: 0,
    gelecek_fiyat: 0,
    gelecek_km: 0
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Önizleme için
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Sunucuya yükle
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

    try {
      await axios.post(`${API_BASE}/vehicles`, formData);
      onSuccess();
    } catch (error) {
      alert("Araç eklenirken bir hata oluştu!" + error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Yeni Araç Ekle</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="section-title">Temel Bilgiler</h3>
                <div>
                  <label className="label">Marka</label>
                  <input required name="marka" className="input" placeholder="Örn: Honda" onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input required name="model" className="input" placeholder="Örn: Civic" onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Yıl</label>
                  <input required type="number" name="yil" className="input" defaultValue={new Date().getFullYear()} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Fotoğraf</label>
                  <div className="space-y-2">
                    {/* Önizleme */}
                    {previewUrl && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src={previewUrl} alt="Önizleme" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Dosya Seçme */}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
                          <Upload size={18} className="text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.fotograf_url ? "Fotoğrafı Değiştir" : "Bilgisayardan Seç"}
                          </span>
                        </>
                      )}
                    </label>
                    {/* Veya URL */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">veya</span>
                      <input
                        name="fotograf_url"
                        className="input text-sm flex-1"
                        placeholder="URL yapıştır..."
                        value={formData.fotograf_url}
                        onChange={(e) => {
                          handleChange(e);
                          setPreviewUrl(e.target.value || null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="section-title">Kilometre & Yakıt Bilgileri</h3>
                <div>
                  <label className="label">Başlangıç KM</label>
                  <input type="number" name="baslangic_km" className="input" defaultValue={0} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Güncel KM</label>
                  <input type="number" name="guncel_km" className="input" defaultValue={0} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Yakıt Tipi</label>
                  <select name="yakit_tipi" className="input" defaultValue="benzin" onChange={handleChange}>
                    <option value="benzin">Benzin</option>
                    <option value="dizel">Dizel</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ort. Tüketim (L/100km)</label>
                  <input type="number" step="0.1" name="ortalama_tuketim_l_100km" className="input" onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Yıllık Ortalama KM</label>
                  <input type="number" name="yillik_ortalama_km" className="input" defaultValue={15000} onChange={handleChange} />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Servis Takibi & Bakım */}
            <h3 className="section-title">Servis Takibi & Bakım</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Son Bakım (KM)</label>
                <input type="number" name="son_bakim_km" className="input" placeholder="Örn: 10500" onChange={handleChange} />
              </div>
              <div>
                <label className="label">Bakım Aralığı (KM)</label>
                <input 
                  type="number" 
                  name="bakim_araligi" 
                  className="input" 
                  defaultValue={2000} 
                  onChange={(e) => {
                    handleChange(e);
                    // Sync with periyodik_bakim_km
                    setFormData(prev => ({ ...prev, periyodik_bakim_km: Number(e.target.value) }));
                  }} 
                />
              </div>
              <div>
                <label className="label">Bakım Maliyeti (TL)</label>
                <input type="number" name="periyodik_bakim_maliyeti" className="input" placeholder="Örn: 800" onChange={handleChange} />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Sabit Giderler */}
            <h3 className="section-title">Sabit Giderler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Yıllık Sigorta (TL)</label>
                <input type="number" name="yillik_sigorta" className="input" placeholder="Örn: 4000" onChange={handleChange} />
              </div>
              <div>
                <label className="label">Yıllık MTV (TL)</label>
                <input type="number" name="yillik_mtv" className="input" placeholder="Örn: 1000" onChange={handleChange} />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Değer Kaybı */}
            <h3 className="section-title">Değer Kaybı (Amortisman) Hesabı</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-3">Aracınızın belirli bir KM sonraki tahmini değerini girin</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Şu Anki Değer (TL)</label>
                <input type="number" name="su_anki_fiyat" className="input" placeholder="Örn: 120000" onChange={handleChange} />
              </div>
              <div>
                <label className="label">Tahmini Gelecek Değer (TL)</label>
                <input type="number" name="gelecek_fiyat" className="input" placeholder="Örn: 100000" onChange={handleChange} />
              </div>
              <div>
                <label className="label">Hedef KM</label>
                <input type="number" name="gelecek_km" className="input" placeholder="Örn: 21100" onChange={handleChange} />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#161b22] py-4 border-t border-gray-100 dark:border-gray-800">
               <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 font-medium transition-all active:scale-95"
                >
                  <Save size={18} /> Kaydet
                </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .label {
            @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5;
        }
        .input {
            @apply w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all;
        }
        .section-title {
            @apply text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1;
        }
      `}</style>
    </div>
  );
}
