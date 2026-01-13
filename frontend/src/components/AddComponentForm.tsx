"use client";

import { useState } from "react";
import axios from "axios";
import { ComponentCreate } from "@/types/vehicle";
import { X, Save } from "lucide-react";

interface AddComponentFormProps {
  vehicleId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const API_BASE = "http://127.0.0.1:8000";

export default function AddComponentForm({ vehicleId, onSuccess, onCancel }: AddComponentFormProps) {
  const [formData, setFormData] = useState<Omit<ComponentCreate, "vehicle_id">>({
    parca_adi: "",
    maliyet: 0,
    omur_km: 10000,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/components`, {
        ...formData,
        vehicle_id: vehicleId,
      });
      onSuccess();
    } catch (error) {
      console.error("Parça eklenemedi:", error);
      alert("Parça eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Yeni Parça Ekle</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parça Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Lastik Seti, Zincir"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.parca_adi}
              onChange={(e) => setFormData({ ...formData, parca_adi: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maliyet (TL)
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.maliyet || ""}
                onChange={(e) => setFormData({ ...formData, maliyet: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ömür (KM)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.omur_km || ""}
                onChange={(e) => setFormData({ ...formData, omur_km: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Ekleniyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
