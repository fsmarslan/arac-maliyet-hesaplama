"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Vehicle } from "@/types/vehicle";
import VehicleCard from "@/components/VehicleCard";
import AddVehicleForm from "@/components/AddVehicleForm";
import { Plus, BarChart3 } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = () => {
    axios
      .get(`${API_BASE}/vehicles`)
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Veri çekme hatası:", err));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Header */}
      <header className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 z-30 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Vehicle Master
            </h1>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Yeni Araç Ekle</span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          
          {/* İstatistik / Özet Kartı (Opsiyonel header altı) */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Araç Filom</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Toplam {vehicles.length} aracınızın detaylı maliyet analizleri aşağıdadır.
            </p>
          </div>

          {/* Grid Kartlar */}
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onDelete={fetchVehicles} onUpdate={fetchVehicles} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#161b22] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Henüz hiç araç eklemediniz.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                İlk aracınızı ekleyin
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddVehicleForm 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchVehicles();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
