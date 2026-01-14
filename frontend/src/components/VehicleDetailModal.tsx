"use client";

import { Vehicle, CostReport } from "@/types/vehicle";
import { X, Fuel, Wrench, Settings, TrendingDown, FileText, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  cost: CostReport;
  onClose: () => void;
  onOpenServiceHistory: () => void;
}

const COLORS = ['#f97316', '#22c55e', '#a855f7', '#ef4444', '#6b7280'];

export default function VehicleDetailModal({ 
  vehicle, 
  cost, 
  onClose, 
  onOpenServiceHistory 
}: VehicleDetailModalProps) {
  const breakdown = cost.breakdown;
  const consumableDetails = cost.consumable_details || [];
  const fixedDetails = cost.fixed_details;
  const warnings = cost.warnings || [];

  // Pie chart data
  const pieData = [
    { name: 'Yakıt', value: breakdown?.fuel || 0, color: '#f97316' },
    { name: 'Bakım', value: breakdown?.maintenance || 0, color: '#22c55e' },
    { name: 'Parça Eskime', value: breakdown?.wear_tear || 0, color: '#a855f7' },
    { name: 'Değer Kaybı', value: breakdown?.depreciation || 0, color: '#ef4444' },
    { name: 'Sabit Gider', value: breakdown?.insurance || 0, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Calculate depreciation context
  const depreciationKmRange = (vehicle.gelecek_km || 0) - (vehicle.guncel_km || 0);
  const depreciationAmount = (vehicle.su_anki_fiyat || 0) - (vehicle.gelecek_fiyat || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-full sm:max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {vehicle.marka} {vehicle.model}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm">Detaylı Maliyet Analizi</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Pie Chart & Toplam Maliyet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Maliyet Dağılımı</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${Number(value).toFixed(4)} TL/KM`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Toplam Maliyet */}
            <div className="flex flex-col justify-center text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-2">
                Toplam KM Başına Maliyet
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-blue-700 dark:text-blue-300">
                  {cost.total_cost_per_km.toFixed(2)}
                </span>
                <span className="text-lg sm:text-xl font-medium text-blue-600 dark:text-blue-400">TL</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Her kilometre için ödediğiniz gerçek maliyet
              </p>
            </div>
          </div>

          {/* Kritik Uyarılar */}
          {warnings.length > 0 && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={18} />
                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Kritik Uyarılar</h3>
              </div>
              <ul className="space-y-1.5">
                {warnings.map((w, idx) => (
                  <li key={idx} className={`flex justify-between items-center text-xs sm:text-sm ${
                    w.kritik ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    <span>⚠️ {w.parca_adi}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      w.kritik 
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' 
                        : 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                    }`}>
                      {w.kalan_omur_km <= 0 ? 'GEÇMİŞ!' : `${w.kalan_omur_km} km kaldı`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Maliyet Dökümü */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
              <FileText size={16} className="text-blue-500" />
              Kuruşu Kuruşuna Döküm
            </h3>
            
            <div className="grid gap-2 sm:gap-3">
              
              {/* Yakıt */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
                    <Fuel className="text-orange-600 dark:text-orange-400" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">⚡ Yakıt</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {cost.fuel_efficiency_l_100km} L/100km × {Number(cost.market_fuel_price_ref).toFixed(2)} TL
                    </p>
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                  {breakdown?.fuel?.toFixed(4)} <span className="text-xs font-normal">TL</span>
                </span>
              </div>

              {/* Periyodik Bakım */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                    <Wrench className="text-green-600 dark:text-green-400" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">🛠️ Periyodik Bakım</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {vehicle.periyodik_bakim_maliyeti?.toLocaleString()} TL / {vehicle.periyodik_bakim_km?.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                  {breakdown?.maintenance?.toFixed(4)} <span className="text-xs font-normal">TL</span>
                </span>
              </div>

              {/* Parça Eskime */}
              <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                      <Settings className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">⚙️ Parça Eskime</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Zincir, Balata, Lastik vb.</p>
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                    {breakdown?.wear_tear?.toFixed(4)} <span className="text-xs font-normal">TL</span>
                  </span>
                </div>
                
                {consumableDetails.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700/50 space-y-1">
                    {consumableDetails.map((c, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">• {c.parca_adi}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {c.km_basi_maliyet.toFixed(4)} TL
                          <span className="text-[10px] text-gray-400 ml-1">
                            ({c.toplam_maliyet?.toLocaleString()} / {c.omur_km?.toLocaleString()} km)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Değer Kaybı */}
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
                      <TrendingDown className="text-red-600 dark:text-red-400" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">📉 Değer Kaybı</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {vehicle.su_anki_fiyat?.toLocaleString()} TL → {vehicle.gelecek_fiyat?.toLocaleString()} TL
                      </p>
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {breakdown?.depreciation?.toFixed(4)} <span className="text-xs font-normal">TL</span>
                  </span>
                </div>
                {depreciationKmRange > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700/50">
                    <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/30 px-2 py-1 rounded inline-block">
                      📊 Gelecek {depreciationKmRange.toLocaleString()} KM için öngörülen kayıp: {depreciationAmount.toLocaleString()} TL
                    </p>
                  </div>
                )}
              </div>

              {/* Sabit Giderler */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                      <FileText className="text-gray-600 dark:text-gray-400" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">📜 Sabit Giderler</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Vergi + Sigorta</p>
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-300">
                    {breakdown?.insurance?.toFixed(4)} <span className="text-xs font-normal">TL</span>
                  </span>
                </div>
                
                {fixedDetails && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600/50 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">• Yıllık Sigorta</span>
                      <span className="text-gray-600 dark:text-gray-400">{fixedDetails.yillik_sigorta?.toLocaleString()} TL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">• Yıllık MTV</span>
                      <span className="text-gray-600 dark:text-gray-400">{fixedDetails.yillik_mtv?.toLocaleString()} TL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">• Yıllık Ort. KM</span>
                      <span className="text-gray-600 dark:text-gray-400">{fixedDetails.yillik_ortalama_km?.toLocaleString()} km</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onOpenServiceHistory}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <FileText size={16} />
            Servis Defteri
          </button>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
