"use client";

import { useState } from "react";
import axios from "axios";
import { CreateVehicleData } from "@/types/vehicle";
import { X, Save, Upload, ArrowRight, ArrowLeft, Car, Fuel, Wrench, CheckCircle } from "lucide-react";

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

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    try {
      await axios.post(`${API_BASE}/vehicles`, formData);
      onSuccess();
    } catch (error) {
      alert("Araç eklenirken bir hata oluştu!" + error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Sayısal alanlar
    const isNumberField = [
        "yil", "baslangic_km", "guncel_km", "ortalama_tuketim_l_100km",
        "periyodik_bakim_km", "periyodik_bakim_maliyeti",
        "son_bakim_km", "bakim_araligi",
        "yillik_sigorta", "yillik_mtv", "yillik_ortalama_km",
        "su_anki_fiyat", "gelecek_fiyat", "gelecek_km"
    ].includes(name);

    if (isNumberField) {
        const numVal = Number(value);
        if (numVal < 0) return; // Negatif girmeyi engelle
        setFormData((prev) => ({
            ...prev,
            [name]: numVal,
        }));
    } else {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // İlerleme çubuğu genişliği
  const progressWidth = `${(currentStep / totalSteps) * 100}%`;

  // Validation Logic
  const isStep1Valid = Boolean(
     formData.marka && formData.marka.trim() !== "" && 
     formData.model && formData.model.trim() !== "" && 
     formData.yil && 
     formData.guncel_km && formData.guncel_km > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-full sm:max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header & Progress Bar */}
        <div className="relative bg-gray-50 dark:bg-gray-900/50">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2">
                {currentStep === 1 && <Car className="w-5 h-5 text-blue-600" />}
                {currentStep === 2 && <Fuel className="w-5 h-5 text-blue-600" />}
                {currentStep === 3 && <Wrench className="w-5 h-5 text-blue-600" />}
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {currentStep === 1 && "Araç Kimliği"}
                  {currentStep === 2 && "Gider Bilgileri"}
                  {currentStep === 3 && "Bakım & Değer"}
                  <span className="ml-2 text-sm font-normal text-gray-500">({currentStep}/{totalSteps})</span>
                </h2>
             </div>
             <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1">
                <X size={24} />
             </button>
          </div>
          {/* Progress Line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out" 
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-8 flex-1">
          <form className="space-y-6" id="vehicle-form" onSubmit={handleSubmit}>
            
            {/* ADIM 1: Kimlik */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="space-y-4">
                  <div>
                    <label className="label">Marka <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        name="marka" 
                        value={formData.marka}
                        className={`input ${!formData.marka ? "border-red-500" : ""}`}
                        placeholder="Örn: Honda" 
                        onChange={handleChange} 
                        autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Model <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        name="model" 
                        value={formData.model}
                        className={`input ${!formData.model ? "border-red-500" : ""}`}
                        placeholder="Örn: Civic" 
                        onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="label">Yıl <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        type="number" 
                        name="yil" 
                        value={formData.yil || ""}
                        className={`input ${!formData.yil ? "border-red-500" : ""}`}
                        onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <label className="label">Güncel Kilometre (KM) <span className="text-red-500">*</span></label>
                    <input 
                        required
                        type="number" 
                        name="guncel_km" 
                        className={`input ${!formData.guncel_km ? "border-red-500" : ""}`}
                        placeholder="Örn: 15000"
                        value={formData.guncel_km > 0 ? formData.guncel_km : ""}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setFormData(prev => ({ 
                                ...prev, 
                                guncel_km: value,
                                baslangic_km: value 
                            }));
                        }} 
                    />
                  </div>
                </div>

                {/* Fotoğraf Alanı */}
                <div className="space-y-2">
                    <label className="label">Fotoğraf</label>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 p-4 flex flex-col items-center justify-center gap-3 text-center h-full min-h-[220px]">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Önizleme" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                        ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Car className="text-gray-300" size={48} />
                            </div>
                        )}
                        
                        <label className="cursor-pointer w-full">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 py-2 px-4 rounded-lg transition-colors">
                                <Upload size={16} />
                                {uploading ? "Yükleniyor..." : "Fotoğraf Seç"}
                            </div>
                        </label>
                        
                        <div className="w-full">
                            <input
                                name="fotograf_url"
                                className="input text-xs"
                                placeholder="veya URL yapıştır..."
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
            )}

            {/* ADIM 2: Giderler */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 fade-in duration-300">
                 <div>
                  <label className="label">Yakıt Tipi</label>
                  <select name="yakit_tipi" className="input" value={formData.yakit_tipi} onChange={handleChange}>
                    <option value="benzin">Benzin</option>
                    <option value="dizel">Dizel</option>
                    <option value="elektrik">Elektrik</option>
                    <option value="hibrit">Hibrit</option>
                    <option value="lpg">LPG</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ort. Tüketim (L/100km)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="ortalama_tuketim_l_100km" 
                    value={formData.ortalama_tuketim_l_100km > 0 ? formData.ortalama_tuketim_l_100km : ""}
                    className="input" 
                    placeholder="Örn: 6.5"
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Yıllık Sigorta (TL)</label>
                  <input 
                    type="number" 
                    name="yillik_sigorta" 
                    value={formData.yillik_sigorta > 0 ? formData.yillik_sigorta : ""}
                    className="input" 
                    placeholder="Örn: 4000" 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <label className="label">Yıllık MTV (TL)</label>
                  <input 
                    type="number" 
                    name="yillik_mtv" 
                    value={formData.yillik_mtv > 0 ? formData.yillik_mtv : ""}
                    className="input" 
                    placeholder="Örn: 1500" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}

            {/* ADIM 3: Bakım & Değer */}
            {currentStep === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  {/* Bakım */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Periyodik Bakım</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                          <label className="label">Bakım Aralığı (KM)</label>
                          <input 
                            type="number" 
                            name="bakim_araligi" 
                            className="input" 
                            value={formData.bakim_araligi}
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
                          <label className="label">Tahmini Bakım Maliyeti (TL)</label>
                          <input 
                            type="number" 
                            name="periyodik_bakim_maliyeti" 
                            className="input" 
                            placeholder="Örn: 4500"
                            value={formData.periyodik_bakim_maliyeti > 0 ? formData.periyodik_bakim_maliyeti : ""}
                            onChange={handleChange} 
                           />
                        </div>
                     </div>
                  </div>

                  {/* Değer */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Değer Kaybı</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="label">Şu Anki Değer (TL)</label>
                            <input 
                                type="number" 
                                name="su_anki_fiyat" 
                                className="input" 
                                placeholder="Örn: 900.000"
                                value={formData.su_anki_fiyat > 0 ? formData.su_anki_fiyat : ""}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="label">Gelecek Değer (TL)</label>
                            <input 
                                type="number" 
                                name="gelecek_fiyat" 
                                className="input" 
                                placeholder="Örn: 850.000" 
                                value={formData.gelecek_fiyat > 0 ? formData.gelecek_fiyat : ""}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="label">Hedef KM</label>
                            <input 
                                type="number" 
                                name="gelecek_km" 
                                className="input" 
                                placeholder="Örn: 50.000" 
                                value={formData.gelecek_km > 0 ? formData.gelecek_km : ""}
                                onChange={handleChange} 
                            />
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 flex justify-between items-center">
            
            {/* Back Button */}
            <button 
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
                <ArrowLeft size={18} /> Geri
            </button>
            
            {/* Dots Indicator (Mobile) */}
            <div className="flex gap-1.5 sm:hidden">
              {[1, 2, 3].map(step => (
                <div key={step} className={`w-2 h-2 rounded-full ${currentStep === step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              ))}
            </div>

            {/* Next / Save Button */}
            {currentStep < 3 ? (
                <button 
                    onClick={nextStep}
                    disabled={currentStep === 1 && !isStep1Valid}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all ${
                        currentStep === 1 && !isStep1Valid 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95"
                    }`}
                >
                    İleri <ArrowRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    form="vehicle-form"
                    type="submit"
                    disabled={!isStep1Valid}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all ${
                        !isStep1Valid 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 active:scale-95"
                    }`}
                >
                    <CheckCircle size={18} /> Kaydet
                </button>
            )}
        </div>
      </div>
      
      <style jsx>{`
        .label {
            @apply block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2;
        }
        .input {
            @apply w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none;
        }
      `}</style>
    </div>
  );
}
