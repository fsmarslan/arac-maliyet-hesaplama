"use client";

import { useEffect, useState } from "react";
import { Vehicle, CostReport } from "@/types/vehicle";
import { Car, Fuel, Wrench, AlertCircle, PlusCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle, FileText, Eye } from "lucide-react";
import axios from "axios";
import AddComponentForm from "./AddComponentForm";
import VehicleDetailModal from "./VehicleDetailModal";
import ServiceHistory from "./ServiceHistory";

const API_BASE = "http://127.0.0.1:8000";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: () => void;
}

export default function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const [cost, setCost] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`${vehicle.marka} ${vehicle.model} aracını silmek istediğinize emin misiniz?`)) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/vehicles/${vehicle.id}`);
      onDelete?.();
    } catch (err) {
      console.error("Delete error", err);
      alert("Araç silinirken bir hata oluştu!");
    } finally {
      setDeleting(false);
    }
  };

  const fetchCost = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/costs/${vehicle.id}`)
      .then((res) => setCost(res.data))
      .catch((err) => console.error("Cost fetch error", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCost();
  }, [vehicle.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      {/* Resim Alanı */}
      <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative shrink-0">
        {vehicle.fotograf_url ? (
          <img
            src={vehicle.fotograf_url}
            alt={`${vehicle.marka} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Car size={64} strokeWidth={1} />
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="p-5 flex flex-col grow">
        <div className="mb-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {vehicle.marka} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {vehicle.yil} • {vehicle.guncel_km?.toLocaleString()} km • 
              <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                vehicle.yakit_tipi === 'dizel' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {vehicle.yakit_tipi === 'dizel' ? 'Dizel' : 'Benzin'}
              </span>
            </p>
        </div>

        {/* Ana Maliyet Gösterme Alanı */}
        <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">
            Toplam KM Başına Maliyet
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-blue-200 dark:bg-blue-800 animate-pulse rounded"></div>
          ) : cost ? (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">
                  {cost.total_cost_per_km.toFixed(2)}
                </span>
                <span className="text-lg font-medium text-blue-600 dark:text-blue-400">TL</span>
              </div>
              
              {/* Detay Butonu */}
              <button 
                onClick={() => setShowDetailModal(true)}
                className="mt-2 text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
              >
                <Eye size={14}/> Detaylı Analiz
              </button>
            </div>
          ) : (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> Hesaplanamadı
            </span>
          )}
        </div>

        {/* Bakım Durum Çubuğu */}
        {cost?.maintenance_status && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Wrench size={12} className="text-emerald-500" />
                Bakım Durumu
              </span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {cost.maintenance_status.kalan_km > 0 
                  ? `${cost.maintenance_status.kalan_km.toLocaleString()} km kaldı`
                  : <span className="text-red-500">Bakım geçti!</span>
                }
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  cost.maintenance_status.kalan_km <= 100 
                    ? 'bg-red-500' 
                    : cost.maintenance_status.kalan_km <= 500 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, cost.maintenance_status.ilerleme_yuzdesi)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{cost.maintenance_status.son_bakim_km?.toLocaleString()} km</span>
              <span>{cost.maintenance_status.gelecek_bakim_km?.toLocaleString()} km</span>
            </div>
          </div>
        )}

        {/* Kritik Uyarılar */}
        {cost?.warnings && cost.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle size={14} />
              {cost.warnings.length} Kritik Uyarı
            </div>
            <ul className="mt-1 space-y-0.5">
              {cost.warnings.slice(0, 2).map((w, idx) => (
                <li key={idx} className="text-[11px] text-red-500 dark:text-red-400 truncate">
                  • {w.parca_adi}: {w.kalan_omur_km <= 0 ? 'GEÇMİŞ!' : `${w.kalan_omur_km} km`}
                </li>
              ))}
              {cost.warnings.length > 2 && (
                <li className="text-[10px] text-red-400">+{cost.warnings.length - 2} daha...</li>
              )}
            </ul>
          </div>
        )}

        {/* Alt Detaylar */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 grow">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            <Fuel size={14} className="text-orange-500" />
            <span>
                {cost?.fuel_efficiency_l_100km 
                  ? `${cost.fuel_efficiency_l_100km} L` 
                  : "--"} / 100km
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            <Wrench size={14} className="text-green-500" />
            <span>{vehicle.periyodik_bakim_km / 1000}k Bakım</span>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <button 
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
            >
                <Trash2 size={14} /> {deleting ? "..." : "Sil"}
            </button>
            <div className="flex gap-2">
              <button 
                  onClick={() => setShowAddComponent(true)}
                  className="text-xs flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                  <PlusCircle size={14} /> Parça
              </button>
              <button 
                  onClick={() => setShowServiceHistory(true)}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium shadow-sm"
              >
                  <FileText size={14} /> Servis Defteri
              </button>
            </div>
        </div>
      </div>

      {/* Modaller */}
      {showAddComponent && (
        <AddComponentForm 
            vehicleId={vehicle.id} 
            onSuccess={() => {
                setShowAddComponent(false);
                fetchCost();
            }} 
            onCancel={() => setShowAddComponent(false)}
        />
      )}

      {showDetailModal && cost && (
        <VehicleDetailModal
          vehicle={vehicle}
          cost={cost}
          onClose={() => setShowDetailModal(false)}
          onOpenServiceHistory={() => {
            setShowDetailModal(false);
            setShowServiceHistory(true);
          }}
        />
      )}

      {showServiceHistory && (
        <ServiceHistory
          vehicle={vehicle}
          onClose={() => setShowServiceHistory(false)}
          onUpdate={fetchCost}
        />
      )}
    </div>
  );
}

