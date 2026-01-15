"use client";

import { useEffect, useState } from "react";
import { Vehicle, CostReport } from "@/types/vehicle";
import { Car, Fuel, Wrench, AlertCircle, PlusCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle, FileText, Eye, Edit2, Gauge } from "lucide-react";
import axios from "axios";
import AddComponentForm from "./AddComponentForm";
import VehicleDetailModal from "./VehicleDetailModal";
import ServiceHistory from "./ServiceHistory";
import EditVehicleModal from "./EditVehicleModal";

const API_BASE = "http://127.0.0.1:8000";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export default function VehicleCard({ vehicle, onDelete, onUpdate }: VehicleCardProps) {
  const [cost, setCost] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quickKm, setQuickKm] = useState<number>(vehicle.guncel_km || 0);
  const [updatingKm, setUpdatingKm] = useState(false);

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

  useEffect(() => {
    setQuickKm(vehicle.guncel_km || 0);
  }, [vehicle.guncel_km]);

  const handleQuickKmUpdate = async () => {
    if (quickKm === vehicle.guncel_km) return;
    setUpdatingKm(true);
    try {
      await axios.put(`${API_BASE}/vehicles/${vehicle.id}`, {
        ...vehicle,
        guncel_km: quickKm
      });
      onUpdate?.();
      fetchCost();
    } catch (err) {
      console.error("KM update error", err);
      alert("KM güncellenirken hata oluştu!");
    } finally {
      setUpdatingKm(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      {/* Resim Alanı */}
      <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 relative shrink-0">
        {vehicle.fotograf_url ? (
          <img
            src={vehicle.fotograf_url}
            alt={`${vehicle.marka} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Car size={48} strokeWidth={1} />
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="p-4 flex flex-col grow">
        <div className="mb-1.5 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {vehicle.marka} {vehicle.model}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {vehicle.yil} • 
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  vehicle.yakit_tipi === 'dizel' 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {vehicle.yakit_tipi === 'dizel' ? 'Dizel' : 'Benzin'}
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
              title="Düzenle"
            >
              <Edit2 size={14} />
            </button>
        </div>

        {/* Hızlı KM Güncelleme */}
        <div className="mb-2 p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
          <div className="flex items-center gap-2">
            <Gauge size={13} className="text-blue-500" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">GÜNCEL KM:</span>
            <input
              type="number"
              value={quickKm}
              onChange={(e) => setQuickKm(Number(e.target.value))}
              onBlur={handleQuickKmUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickKmUpdate()}
              className="flex-1 px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 outline-none font-semibold"
              disabled={updatingKm}
            />
            {updatingKm && (
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        {/* Ana Maliyet Gösterme Alanı */}
        <div className="mt-1 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">
            Sürüş Maliyeti (1 KM)
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-blue-200 dark:bg-blue-800 animate-pulse rounded"></div>
          ) : cost ? (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                  {cost.total_cost_per_km.toFixed(2)}
                </span>
                <span className="text-base font-medium text-blue-600 dark:text-blue-400">TL</span>
              </div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 italic">
                * Sabit giderler ve vergiler hariçtir.
              </p>
              
              {/* Detay Butonu */}
              <button 
                onClick={() => setShowDetailModal(true)}
                className="mt-1.5 text-[11px] flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
              >
                <Eye size={13}/> Detaylı Analiz
              </button>
            </div>
          ) : (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={13} /> Hesaplanamadı
            </span>
          )}
        </div>

        {/* Bakım Durum Çubuğu */}
        {cost?.maintenance_status && (
          <div className="mt-2.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Wrench size={11} className={`${
                  cost.maintenance_status.kalan_km <= 100 
                    ? 'text-red-500' 
                    : cost.maintenance_status.kalan_km <= 500 
                      ? 'text-yellow-500' 
                      : 'text-emerald-500'
                }`} />
                Bakım Durumu
              </span>
              <span className={`font-medium ${
                cost.maintenance_status.kalan_km <= 0 
                  ? 'text-red-500 font-bold' 
                  : cost.maintenance_status.kalan_km <= 100 
                    ? 'text-red-600 dark:text-red-400' 
                    : cost.maintenance_status.kalan_km <= 500 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-gray-800 dark:text-gray-200'
              }`}>
                {cost.maintenance_status.kalan_km > 0 
                  ? `${cost.maintenance_status.kalan_km.toLocaleString()} KM kaldı`
                  : 'Bakım geçti!'
                }
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  cost.maintenance_status.kalan_km <= 0
                    ? 'bg-red-600 animate-pulse'
                    : cost.maintenance_status.kalan_km <= 100 
                      ? 'bg-red-500' 
                      : cost.maintenance_status.kalan_km <= 300
                        ? 'bg-orange-500'
                        : cost.maintenance_status.kalan_km <= 500 
                          ? 'bg-yellow-500' 
                          : cost.maintenance_status.kalan_km <= 1000
                            ? 'bg-lime-500'
                            : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, cost.maintenance_status.ilerleme_yuzdesi))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>{cost.maintenance_status.son_bakim_km?.toLocaleString()} KM</span>
              <span>{cost.maintenance_status.gelecek_bakim_km?.toLocaleString()} KM</span>
            </div>
          </div>
        )}

        {/* Kritik Uyarılar */}
        {cost?.warnings && cost.warnings.length > 0 && (
          <div className="mt-2 p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-tight">
              <AlertTriangle size={12} />
              {cost.warnings.length} Kritik Uyarı
            </div>
            <ul className="mt-1 space-y-0.5">
              {cost.warnings.slice(0, 2).map((w, idx) => (
                <li key={idx} className="text-[10px] text-red-500 dark:text-red-400 truncate">
                  • {w.parca_adi}: {w.kalan_omur_km <= 0 ? 'GEÇMİŞ!' : `${w.kalan_omur_km} KM`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alt Detaylar */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400 grow">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5 rounded border border-gray-100 dark:border-gray-600/30">
            <Fuel size={13} className="text-orange-500" />
            <span className="font-medium">
                {cost?.fuel_efficiency_l_100km 
                  ? `${cost.fuel_efficiency_l_100km} L` 
                  : "--"} / 100km
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5 rounded border border-gray-100 dark:border-gray-600/30">
            <Wrench size={13} className="text-green-500" />
            <span className="font-medium">{vehicle.periyodik_bakim_km / 1000}k KM Bakım</span>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <button 
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all disabled:opacity-50"
            >
                <Trash2 size={13} /> {deleting ? "..." : "Sil"}
            </button>
            <div className="flex gap-1.5">
              <button 
                  onClick={() => setShowAddComponent(true)}
                  className="text-[11px] flex items-center gap-1 px-2.5 py-1 text-gray-500 border border-gray-200 dark:border-gray-600 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
              >
                  <PlusCircle size={13} /> Parça
              </button>
              <button 
                  onClick={() => setShowServiceHistory(true)}
                  className="text-[11px] flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all font-medium shadow-sm hover:shadow active:scale-95"
              >
                  <FileText size={13} /> Servis Defteri
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
          onUpdate={() => {
            onUpdate?.();
            fetchCost();
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

      {showEditModal && (
        <EditVehicleModal
          vehicle={vehicle}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate?.();
            fetchCost();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

