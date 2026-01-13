"use client";

import { useEffect, useState } from "react";
import { Vehicle, CostReport } from "@/types/vehicle";
import { Car, Fuel, Wrench, AlertCircle, PlusCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import axios from "axios";
import AddComponentForm from "./AddComponentForm";

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
            Gerçek KM Maliyeti
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
              
              {/* Breakdown Toggle */}
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="mt-2 text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showBreakdown ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                Detayları {showBreakdown ? "Gizle" : "Göster"}
              </button>

              {/* Breakdown Details */}
              {showBreakdown && cost.breakdown && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Yakıt:</span>
                    <span className="font-semibold">{cost.breakdown.fuel} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bakım:</span>
                    <span className="font-semibold">{cost.breakdown.maintenance} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Parça/Eskime:</span>
                    <span className="font-semibold">{cost.breakdown.wear_tear} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Değer Kaybı:</span>
                    <span className="font-semibold">{cost.breakdown.depreciation} TL</span>
                  </div>
                 </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> Hesaplanamadı
            </span>
          )}
        </div>

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
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button 
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            >
                <Trash2 size={16} /> {deleting ? "Siliniyor..." : "Sil"}
            </button>
            <button 
                onClick={() => setShowAddComponent(true)}
                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
                <PlusCircle size={16} /> Parça Ekle
            </button>
        </div>
      </div>

      {showAddComponent && (
        <AddComponentForm 
            vehicleId={vehicle.id} 
            onSuccess={() => {
                setShowAddComponent(false);
                fetchCost(); // Maliyeti güncelle çünkü parça maliyeti etkiler
            }} 
            onCancel={() => setShowAddComponent(false)}
        />
      )}
    </div>
  );
}

