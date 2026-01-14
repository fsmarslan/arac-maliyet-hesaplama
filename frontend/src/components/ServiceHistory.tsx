"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Vehicle, ServiceLog, ServiceLogCreate } from "@/types/vehicle";
import { X, Plus, Trash2, Calendar, Gauge, Wrench, Coins } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface ServiceHistoryProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ServiceHistory({ vehicle, onClose, onUpdate }: ServiceHistoryProps) {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<ServiceLogCreate, "vehicle_id">>({
    tarih: new Date().toISOString().split("T")[0],
    km: vehicle.guncel_km || 0,
    yapilan_islemler: "",
    toplam_maliyet: 0,
    degisen_parcalar: ""
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/vehicles/${vehicle.id}/service-logs`);
      setLogs(res.data);
    } catch (err) {
      console.error("Servis kayıtları alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [vehicle.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE}/vehicles/${vehicle.id}/service-logs`, {
        ...formData,
        vehicle_id: vehicle.id
      });
      
      setShowAddForm(false);
      setFormData({
        tarih: new Date().toISOString().split("T")[0],
        km: vehicle.guncel_km || 0,
        yapilan_islemler: "",
        toplam_maliyet: 0,
        degisen_parcalar: ""
      });
      
      fetchLogs();
      onUpdate?.();
    } catch (err) {
      console.error("Servis kaydı eklenemedi:", err);
      alert("Servis kaydı eklenirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: number) => {
    if (!confirm("Bu servis kaydını silmek istediğinize emin misiniz?")) return;
    
    try {
      await axios.delete(`${API_BASE}/service-logs/${logId}`);
      fetchLogs();
      onUpdate?.();
    } catch (err) {
      console.error("Servis kaydı silinemedi:", err);
      alert("Servis kaydı silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-full sm:max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Wrench size={20} />
              Servis Defteri
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm">
              {vehicle.marka} {vehicle.model} - {vehicle.guncel_km?.toLocaleString()} km
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex-grow">
          
          {/* Yeni Kayıt Butonu - Compact */}
          {!showAddForm && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                <Plus size={16} />
                Yeni Kayıt
              </button>
            </div>
          )}

          {/* Yeni Kayıt Formu */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Yeni Servis Kaydı</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kilometre
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.km || ""}
                    onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yapılan İşlemler
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Yağ değişimi, Filtre değişimi, Zincir yağlama..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  value={formData.yapilan_islemler}
                  onChange={(e) => setFormData({ ...formData, yapilan_islemler: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Toplam Maliyet (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.toplam_maliyet || ""}
                    onChange={(e) => setFormData({ ...formData, toplam_maliyet: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Değişen Parçalar
                  </label>
                  <input
                    type="text"
                    placeholder="Yağ Filtresi, Hava Filtresi..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.degisen_parcalar || ""}
                    onChange={(e) => setFormData({ ...formData, degisen_parcalar: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          )}

          {/* Kayıt Listesi */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Geçmiş Servis Kayıtları ({logs.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <Wrench size={40} className="mx-auto mb-2 opacity-50" />
                <p>Henüz servis kaydı bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} className="text-blue-500" />
                          {new Date(log.tarih).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Gauge size={14} className="text-emerald-500" />
                          {log.km?.toLocaleString()} km
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <Coins size={14} />
                          {log.toplam_maliyet?.toLocaleString()} TL
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                      {log.yapilan_islemler}
                    </p>
                    
                    {log.degisen_parcalar && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Değişen Parçalar:</span> {log.degisen_parcalar}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
