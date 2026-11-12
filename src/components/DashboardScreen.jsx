import React, { useState } from 'react';
import { Camera, Plus, AlertTriangle, ArrowUpDown, ChevronRight, Sprout, Flame, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as store from '../services/storageService.js';

export default function DashboardScreen({
  user,
  foodItems = [],
  impact = {},
  compostBatches = [],
  onOpenScan,
  onOpenManual,
  onOpenRescueAi,
  onOpenCompostAi,
  onFoodItemsUpdated,
  onSwitchToCompost
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortAscending, setSortAscending] = useState(true);

  // Filter Categories
  const categoryFilters = [
    { id: 'all', label: `Semua (${foodItems.length})` },
    {
      id: 'vegetable',
      label: `Sayur & Buah (${foodItems.filter(f => f.category === 'vegetable').length})`
    },
    {
      id: 'meat',
      label: `Lauk Hewani (${foodItems.filter(f => f.category === 'meat').length})`
    },
    {
      id: 'leftover',
      label: `Masakan Sisa (${foodItems.filter(f => f.category === 'leftover').length})`
    }
  ];

  const filteredFoods = foodItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const sortedFoods = [...filteredFoods].sort((a, b) => {
    return sortAscending ? a.expiryDays - b.expiryDays : b.expiryDays - a.expiryDays;
  });

  const warningCount = foodItems.filter(f => f.status === 'warning').length;
  const activeBatch = compostBatches.find(b => b.stage === 'filling') || compostBatches[0];

  const handleMarkCooked = (food) => {
    const updated = store.markFoodAsCooked(food.id);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}
    if (onFoodItemsUpdated) onFoodItemsUpdated(updated);
  };

  const handleMoveToCompost = (food) => {
    const updatedBatches = store.addFoodToCompost(food, activeBatch?.id || null);
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 }
      });
    } catch (e) {}
    const remaining = store.getFoodItems();
    if (onFoodItemsUpdated) onFoodItemsUpdated(remaining);
  };

  const handlePopulateSampleData = () => {
    store.resetAllDataToDummy();
    if (onFoodItemsUpdated) onFoodItemsUpdated(store.getFoodItems());
  };

  /* -------------------------------------------------------------
   * VARIANT A: KULKAS KOSONG (Empty Fridge Screen)
   * ------------------------------------------------------------- */
  if (foodItems.length === 0) {
    return (
      <div className="pb-24 pt-4 px-4 space-y-6 max-w-[440px] mx-auto animate-in fade-in duration-300">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Halo, {user?.name || 'Budi'}!
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kulkasmu masih kosong.
          </p>
        </div>

        {/* Empty State Illustration Box */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-48 h-48 rounded-full bg-[#EBF7EE] flex items-center justify-center relative shadow-inner border border-emerald-100">
            {/* Outline Refrigerator with Sprout Leaf SVG */}
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-28 h-28 text-emerald-800"
            >
              {/* Fridge Frame */}
              <rect x="35" y="20" width="50" height="80" rx="10" stroke="currentColor" strokeWidth="3" fill="#FFFFFF" />
              {/* Divider */}
              <line x1="35" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2.5" />
              {/* Handles */}
              <rect x="39" y="32" width="3" height="10" rx="1.5" fill="currentColor" />
              <rect x="39" y="58" width="3" height="16" rx="1.5" fill="currentColor" />
              {/* Sprout Leaf on Top */}
              <path
                d="M78 20C78 20 84 15 90 18C91 24 85 27 78 20Z"
                fill="#22C55E"
                stroke="#166534"
                strokeWidth="1.5"
              />
              <path
                d="M80 20C82 17 86 16 88 17"
                stroke="#166534"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="space-y-2 max-w-[290px] mx-auto">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Mulai catat bahan makananmu
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Foto struk atau isi kulkas, AI akan memisahkan makanan dari non-makanan secara otomatis.
            </p>
          </div>
        </div>

        {/* Stacked CTAs */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onOpenScan}
            className="w-full py-3.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span>Scan Struk / Kulkas (AI)</span>
          </button>

          <button
            onClick={onOpenManual}
            className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-sm rounded-2xl border-2 border-emerald-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Catat Manual</span>
          </button>

          {/* Quick Demo Restore Pill */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handlePopulateSampleData}
              className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
            >
              Isi Data Contoh Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * VARIANT B: DASHBOARD SUDAH ADA ISI (Stocked Fridge Screen)
   * ------------------------------------------------------------- */
  return (
    <div className="pb-28 pt-3 px-4 space-y-5 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* 1. Greeting & Context Chips */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Halo, {user?.name || 'Budi'}!
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Pantry cerdas mendeteksi {foodItems.length} bahan aktif.
        </p>

        <div className="flex flex-wrap gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-emerald-800 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Zero Waste</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-xs">
            <span>🏡</span>
            <span>{user?.householdType === 'apartment' ? 'Apartemen (Takakura/Bokashi)' : 'Rumah (Kompos Ember)'}</span>
          </span>
        </div>
      </div>

      {/* 2. Eco-Impact Metric Cards (2 Columns) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Bahan Terselamatkan */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
              Bahan Terselamatkan
            </span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              {impact?.rescuedFoodKg ?? 3.8} Kg
            </span>
          </div>
        </div>

        {/* Card 2: Emisi Dicegah */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
              Emisi Dicegah
            </span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              {impact?.co2ePreventedKg ?? 9.5} Kg <span className="text-[10px] font-medium text-slate-400">CO₂e</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Urgent Warning Banner ("PERHATIAN SEGERA") */}
      {warningCount > 0 && (
        <div className="bg-[#FEF3C7] rounded-2xl p-4 border border-[#FDE68A] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-800" />
            <h4 className="text-xs font-extrabold text-amber-900 tracking-wide uppercase">
              PERHATIAN SEGERA
            </h4>
          </div>
          <p className="text-xs text-amber-950 font-medium leading-relaxed">
            {warningCount} bahan makanan harus segera dihabiskan dalam 24 jam!
          </p>
          <button
            onClick={onOpenRescueAi}
            className="w-full py-2.5 px-4 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            <span>Rescue Masakan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Quick Actions: ADD MY STOCK */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          ADD MY STOCK
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Scan AI Card */}
          <button
            onClick={onOpenScan}
            className="bg-[#166534] hover:bg-[#14532D] text-white p-4 rounded-2xl shadow-sm transition-all active:scale-[0.99] text-left flex flex-col justify-between min-h-[96px] group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white mb-2">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight text-white">Scan AI</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">Struk belanja/isi kulkas</p>
            </div>
          </button>

          {/* Manual Input Card */}
          <button
            onClick={onOpenManual}
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-xs transition-all active:scale-[0.99] text-left flex flex-col justify-between min-h-[96px]"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 border border-emerald-100">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900">Manual</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Catat stok sendiri</p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Inventory: DAFTAR BAHAN MAKANAN */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            DAFTAR BAHAN MAKANAN
          </h3>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Food Items List */}
        <div className="space-y-3">
          {sortedFoods.map((food) => {
            const isWarning = food.status === 'warning';
            const isSpoiled = food.status === 'spoiled';
            const isSafe = food.status === 'safe';

            return (
              <div
                key={food.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {/* Thumbnail / Emoji Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                    {food.icon || (food.category === 'meat' ? '🍗' : food.category === 'leftover' ? '🍲' : '🥬')}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-900">{food.name}</h4>
                      {/* Status Badges */}
                      {isSpoiled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                          Basi / Lewat Waktu
                        </span>
                      ) : isWarning ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          Tinggal {food.expiryDays || 1} Hari!
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {food.expiryDays} Hari Lagi
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {food.categoryLabel || 'Bahan segar'} · {food.quantityText || '1 porsi (250g)'}
                    </p>

                    {/* Urgency Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSpoiled
                            ? 'w-full bg-rose-500'
                            : isWarning
                            ? 'w-1/4 bg-amber-500'
                            : 'w-3/4 bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-1 flex items-center gap-2">
                  {isSpoiled ? (
                    <button
                      onClick={() => handleMoveToCompost(food)}
                      className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <Sprout className="w-3.5 h-3.5" />
                      <span>Alihkan Ke Kompos</span>
                    </button>
                  ) : (
                    <>
                      {isWarning ? (
                        <button
                          onClick={onOpenRescueAi}
                          className="flex-1 py-2 px-3 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] text-center"
                        >
                          Rescue Resep
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkCooked(food)}
                          className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.99] text-center"
                        >
                          Dimasak
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkCooked(food)}
                        className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-all active:scale-[0.99]"
                      >
                        Habis
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Compost Status Card Footer */}
      {activeBatch && (
        <div
          onClick={onSwitchToCompost}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <Sprout className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">{activeBatch.title}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Fase {activeBatch.stage === 'filling' ? 'Pengisian' : 'Pematangan'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 group-hover:text-emerald-700 transition-colors">
                Detail Kompos &gt;
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-emerald-700">
              {activeBatch.fillPercentage || 60}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
