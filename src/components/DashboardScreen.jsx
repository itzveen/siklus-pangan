import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import * as store from '../services/storageService.js';

// Assets from Figma node 16:523
import dashLeaf from '../assets/figma/dash_leaf.png';
import dashLeafStat from '../assets/figma/dash_leaf_stat.png';
import dashCloud from '../assets/figma/dash_cloud.png';
import dashAlert from '../assets/figma/dash_alert.png';
import foodBayam from '../assets/figma/food_bayam.png';
import foodWortel from '../assets/figma/food_wortel.png';
import foodTelur from '../assets/figma/food_telur.png';
import foodTahu from '../assets/figma/food_tahu.png';
import dashRecycle from '../assets/figma/dash_recycle.png';
import dashCam from '../assets/figma/dash_cam.svg';
import dashPlus from '../assets/figma/dash_plus.svg';
import dashSort from '../assets/figma/dash_sort.svg';
import dashArrowGreen from '../assets/figma/dash_arrow_green.svg';
import dashDivider from '../assets/figma/dash_divider.svg';
import kulkasLeaf from '../assets/figma/kulkas_leaf.svg';

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

  // Category filters
  const categoryFilters = [
    { id: 'all', label: `Semua (${foodItems.length})` },
    {
      id: 'vegetable',
      label: `Sayur & Buah (${foodItems.filter(f => f.category === 'vegetable').length})`
    },
    {
      id: 'meat',
      label: `Lauk Hewani (${foodItems.filter(f => f.category === 'meat' || f.category === 'plant_protein').length})`
    },
    {
      id: 'leftover',
      label: `Masakan Sisa (${foodItems.filter(f => f.category === 'leftover').length})`
    }
  ];

  const filteredFoods = foodItems.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'meat') return item.category === 'meat' || item.category === 'plant_protein';
    return item.category === activeCategory;
  });

  const sortedFoods = [...filteredFoods].sort((a, b) =>
    sortAscending ? a.expiryDays - b.expiryDays : b.expiryDays - a.expiryDays
  );

  const warningCount = foodItems.filter(f => f.status === 'warning').length;
  const activeBatch = compostBatches.find(b => b.stage === 'filling') || compostBatches[0];

  const handleMarkCooked = (food) => {
    const updated = store.markFoodAsCooked(food.id);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (e) {}
    if (onFoodItemsUpdated) onFoodItemsUpdated(updated);
  };

  const handleMoveToCompost = (food) => {
    if (onOpenCompostAi) {
      onOpenCompostAi(food);
      return;
    }
    store.addFoodToCompost(food, activeBatch?.id || null);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    } catch (e) {}
    if (onFoodItemsUpdated) onFoodItemsUpdated(store.getFoodItems());
  };

  const handlePopulateSampleData = () => {
    store.resetAllDataToDummy();
    if (onFoodItemsUpdated) onFoodItemsUpdated(store.getFoodItems());
  };

  // Helper to resolve realistic food photos from Figma
  const getFoodImage = (food) => {
    const name = (food.name || '').toLowerCase();
    if (name.includes('bayam')) return foodBayam;
    if (name.includes('wortel')) return foodWortel;
    if (name.includes('telur')) return foodTelur;
    if (name.includes('tahu')) return foodTahu;
    return food.image || foodBayam;
  };

  /* ── 1. VARIANT: KULKAS KOSONG (Figma node 44:476) ── */
  if (foodItems.length === 0) {
    return (
      <div
        className="pb-28 pt-2 px-5 space-y-6 max-w-[402px] mx-auto animate-in fade-in duration-300"
        style={{ fontFamily: 'Poppins, sans-serif' }}
        data-node-id="44:476"
        data-name="Kulkas Kosong"
      >
        {/* Greeting Section (Figma node 44:409) */}
        <div className="space-y-1">
          <h1 className="text-[26px] font-extrabold text-[#11231b] tracking-[-0.65px] leading-[32.5px]">
            Halo, {user?.name || 'Budi'}!
          </h1>
          <p className="text-[15px] text-[#5e6d66] leading-[22.5px]">
            Kulkasmu masih kosong.
          </p>
        </div>

        {/* Empty State Graphic Circle (Figma node 44:415 & 44:416) */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-[140px] h-[140px] rounded-full bg-[#dcf3e4] flex items-center justify-center relative flex-shrink-0">
            {/* Refrigerator Illustration (Figma node 44:417: 60x78px) */}
            <div className="w-[60px] h-[78px] rounded-[12px] border-[3px] border-[#136b34] flex flex-col justify-between py-[16px] px-[8px] relative bg-transparent">
              {/* Shelf 1 Divider Line */}
              <div className="w-full h-[3px] rounded-full bg-[#a7d8ba]" />
              {/* Shelf 2 Divider Line */}
              <div className="w-full h-[3px] rounded-full bg-[#a7d8ba]" />
              {/* Fridge Handle */}
              <div className="absolute right-[5px] top-[26px] w-[3px] h-[12px] rounded-full bg-[#136b34]" />
            </div>

            {/* Organic Leaf Accent at top-right of fridge (Figma node 44:423 & 44:424) */}
            <div className="absolute top-[28px] right-[24px] w-[20px] h-[20px]">
              <img src={kulkasLeaf} alt="" className="w-full h-full block" />
            </div>
          </div>
        </div>

        {/* Content & Action Buttons (Figma node 44:427) */}
        <div className="space-y-6 text-center">
          {/* Title & Description */}
          <div className="space-y-2 max-w-[280px] mx-auto">
            <h2 className="text-[20.5px] font-extrabold text-[#11231b] leading-[28px]">
              Mulai catat bahan makananmu
            </h2>
            <p className="text-[13.5px] text-[#55675e] leading-[20px]">
              Foto struk atau isi kulkas, AI akan memisahkan makanan dari non-makanan secara otomatis.
            </p>
          </div>

          {/* Action Buttons (Figma node 44:434) */}
          <div className="space-y-3 pt-2">
            {/* Button - Primary AI Scan Action (Figma node 44:435) */}
            <button
              onClick={onOpenScan}
              className="w-full h-[52px] rounded-[16px] bg-[#137a38] hover:bg-[#0e682e] text-white font-bold text-[15px] shadow-[0px_4px_6px_rgba(19,122,56,0.2)] active:scale-[0.99] transition-all flex items-center justify-center"
            >
              Scan Struk / Kulkas (AI)
            </button>

            {/* Button - Secondary Manual Input Action (Figma node 44:437) */}
            <button
              onClick={onOpenManual}
              className="w-full h-[52px] rounded-[16px] border border-[#137a38] text-[#137a38] font-bold text-[15px] bg-transparent hover:bg-[#dcf3e4]/30 active:scale-[0.99] transition-all flex items-center justify-center"
            >
              Catat Manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 2. VARIANT: DASHBOARD SUDAH ADA ISI (Figma node 16:523) ── */
  return (
    <div
      className="pb-28 pt-2 px-5 space-y-5 max-w-[402px] mx-auto animate-in fade-in duration-300"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* ── Greeting & Subtitle ── */}
      <div>
        <h1 className="text-[24px] font-bold text-black leading-tight">
          Halo, {user?.name || 'Budi'}!
        </h1>
        <p className="text-[12px] text-[#4b5563] mt-1">
          Pantry cerdas mendeteksi {foodItems.length} bahan aktif.
        </p>
      </div>

      {/* ── Badges: Zero Waste & Household ── */}
      <div className="flex items-center gap-2.5">
        {/* Zero Waste Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[17px] bg-[rgba(40,201,42,0.32)] h-[22px]">
          <img src={dashLeaf} alt="" className="w-[19px] h-[17px] object-contain" />
          <span className="text-[12px] font-bold text-[#00652c] leading-none">
            Zero Waste
          </span>
        </div>

        {/* Household Pill */}
        <div className="flex items-center px-3 py-1 rounded-[17px] bg-white border border-[#cdebd3] h-[22px]">
          <span className="text-[12px] font-bold text-[#00652c] leading-none">
            {user?.householdType === 'apartment' ? 'Apartemen (Takakura/Bokashi)' : 'Rumah (Kompos Ember)'}
          </span>
        </div>
      </div>

      {/* ── 2-Col Metric Card: Bahan Terselamatkan & Emisi Dicegah ── */}
      <div className="bg-white rounded-[25px] border border-[#cdebd3] h-[90px] px-4 flex items-center justify-between relative shadow-xs">
        {/* Left Col: Bahan Terselamatkan */}
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-[34px] h-[35px] rounded-[12px] bg-[rgba(40,201,42,0.32)] flex items-center justify-center flex-shrink-0">
            <img src={dashLeafStat} alt="" className="w-[31px] h-[26px] object-contain" />
          </div>
          <div>
            <p className="text-[11px] text-[#4b5563] leading-tight">Bahan Terselamatkan</p>
            <p className="text-[17px] font-bold text-black mt-0.5 leading-none">
              {impact?.rescuedFoodKg ?? 3.8} Kg
            </p>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-[59px] flex items-center justify-center flex-shrink-0 mx-2">
          <img src={dashDivider} alt="" className="h-[59px] w-[2px] block" />
        </div>

        {/* Right Col: Emisi Dicegah */}
        <div className="flex items-center gap-2.5 flex-1 pl-1">
          <div className="w-[34px] h-[35px] rounded-[12px] bg-[rgba(247,225,126,0.56)] flex items-center justify-center flex-shrink-0">
            <img src={dashCloud} alt="" className="w-[25px] h-[27px] object-contain" />
          </div>
          <div>
            <p className="text-[11px] text-[#4b5563] leading-tight">Emisi Dicegah</p>
            <p className="text-[17px] font-bold text-black mt-0.5 leading-none whitespace-nowrap">
              {impact?.co2ePreventedKg ?? 9.5} Kg CO₂e
            </p>
          </div>
        </div>
      </div>

      {/* ── Emergency Alert Card ("PERHATIAN SEGERA") ── */}
      {warningCount > 0 && (
        <div className="bg-[#fef3c7] border border-[#f59e0b] rounded-[24px] p-4 space-y-2.5 relative shadow-xs">
          <div className="flex items-center gap-2">
            <img src={dashAlert} alt="Warning" className="w-[24px] h-[20px] object-contain" />
            <h4 className="text-[12px] font-extrabold text-[#92400e] tracking-[0.55px] uppercase">
              PERHATIAN SEGERA
            </h4>
          </div>
          <p className="text-[14px] text-[#78350f] leading-snug">
            {warningCount} bahan makanan harus segera dihabiskan dalam 24 jam!
          </p>
          <div>
            <button
              onClick={() => onOpenRescueAi?.(foodItems.filter(f => f.status === 'warning'))}
              className="px-4 py-1.5 rounded-full bg-[#b45309] hover:bg-[#92400e] text-white text-[13px] font-bold shadow-xs active:scale-95 transition-all"
            >
              Rescue Masakan
            </button>
          </div>
        </div>
      )}

      {/* ── ADD MY STOCK ── */}
      <div className="space-y-2.5">
        <h3 className="text-[12px] font-bold text-[#4b5563] tracking-[0.6px] uppercase">
          ADD MY STOCK
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Scan AI Card */}
          <button
            onClick={onOpenScan}
            className="rounded-[24px] p-4 text-left flex flex-col justify-between h-[116px] text-white shadow-sm active:scale-[0.99] transition-all"
            style={{
              background: 'linear-gradient(145deg, #16a34a 0%, #0b6623 100%)'
            }}
          >
            <div className="w-[40px] h-[40px] rounded-[16px] bg-white/20 backdrop-blur-[4px] flex items-center justify-center">
              <img src={dashCam} alt="Scan" className="w-[20px] h-[20px]" />
            </div>
            <div>
              <h4 className="text-[17px] font-extrabold text-white leading-tight">Scan AI</h4>
              <p className="text-[12px] font-medium text-white/85 leading-tight mt-0.5">
                Struk belanja/isi kulkas
              </p>
            </div>
          </button>

          {/* Manual Input Card */}
          <button
            onClick={onOpenManual}
            className="bg-white border border-[#cdebd3] rounded-[24px] p-4 text-left flex flex-col justify-between h-[116px] shadow-sm active:scale-[0.99] transition-all"
          >
            <div className="w-[40px] h-[40px] rounded-[16px] bg-[#dcfce7] flex items-center justify-center">
              <img src={dashPlus} alt="Manual" className="w-[20px] h-[20px]" />
            </div>
            <div>
              <h4 className="text-[17px] font-extrabold text-[#1f2937] leading-tight">Manual</h4>
              <p className="text-[12px] font-medium text-[#4b5563] leading-tight mt-0.5">
                Catat stok sendiri
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── DAFTAR BAHAN MAKANAN ── */}
      <div className="space-y-3 pt-1">
        {/* Section title & sort button */}
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-[#4b5563] tracking-[0.6px] uppercase">
            DAFTAR BAHAN MAKANAN
          </h3>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="flex items-center gap-1.5 text-[12px] font-bold text-[#0b6623] hover:opacity-80 transition-opacity"
          >
            <img src={dashSort} alt="" className="w-4 h-4 block" />
            <span>Urutkan</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryFilters.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0b6623] text-white shadow-xs'
                    : 'bg-white border border-[#cdebd3] text-[#4b5563]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Food Item Cards */}
        <div className="space-y-3">
          {sortedFoods.map(food => {
            const isWarning = food.status === 'warning';
            const isSpoiled = food.status === 'spoiled';
            const isSafe = food.status === 'safe';

            // Card border & urgency styling matching Figma
            const cardBorder = isSpoiled
              ? 'border-[rgba(239,68,68,0.3)]'
              : isWarning
              ? 'border-[#fef3c7]'
              : 'border-[#cdebd3]';

            const barWidth = isSpoiled ? '100%' : isWarning ? '75%' : '25%';
            const barBg = isSpoiled ? '#ef4444' : isWarning ? '#f59e0b' : '#0b6623';

            return (
              <div
                key={food.id}
                className={`bg-white border ${cardBorder} border-solid rounded-[30px] p-3.5 flex items-center gap-3.5 shadow-xs`}
                style={{ minHeight: 127 }}
              >
                {/* Food Image */}
                <div className="w-[76px] h-[76px] rounded-[18px] border border-[#cdebd3] overflow-hidden flex-shrink-0 bg-slate-50">
                  <img
                    src={getFoodImage(food)}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[16px] font-bold text-[#1f2937] leading-tight">
                      {food.name}
                    </h4>

                    {/* Status Badge */}
                    {isSpoiled ? (
                      <span className="bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Basi / Lewat Waktu
                      </span>
                    ) : isWarning ? (
                      <span className="bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Tinggal {food.expiryDays || 1} Hari!
                      </span>
                    ) : (
                      <span className="bg-[#cdebd3] border border-[#78c28b] text-[#0b6623] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {food.expiryDays || 6} Hari Lagi
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#4b5563]">
                    {food.categoryLabel || 'Sayur segar'} · {food.quantityText || '1 ikat (250g)'}
                  </p>

                  {/* Shelf-Life Progress Bar */}
                  <div className="w-full bg-[#e6fbe9] h-[6px] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: barWidth, backgroundColor: barBg }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {isSpoiled ? (
                      <button
                        onClick={() => handleMoveToCompost(food)}
                        className="w-full py-1 px-3 rounded-[14px] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        style={{
                          background: 'linear-gradient(90deg, #0b6623 0%, #16cc46 100%)'
                        }}
                      >
                        <img src={dashRecycle} alt="" className="w-4 h-4 object-contain" />
                        <span>Alihkan Ke Kompos</span>
                      </button>
                    ) : isWarning ? (
                      <>
                        <button
                          onClick={() => onOpenRescueAi?.([food])}
                          className="bg-[#b45309] hover:bg-[#92400e] text-white text-[10px] font-bold px-3 py-1 rounded-[14px] active:scale-95 transition-all text-center flex-1"
                        >
                          Rescue Resep
                        </button>
                        <button
                          onClick={() => handleMarkCooked(food)}
                          className="bg-white border border-[#cdebd3] text-[#4b5563] text-[10px] font-semibold px-3 py-1 rounded-[14px] active:scale-95 transition-all"
                        >
                          Habis
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMarkCooked(food)}
                          className="bg-[#0b6623] hover:bg-[#094c1a] text-white text-[10px] font-bold px-3 py-1 rounded-[14px] active:scale-95 transition-all text-center flex-1"
                        >
                          Dimasak
                        </button>
                        <button
                          onClick={() => handleMarkCooked(food)}
                          className="bg-white border border-[#cdebd3] text-[#4b5563] text-[10px] font-semibold px-3 py-1 rounded-[14px] active:scale-95 transition-all"
                        >
                          Habis
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Batch Kompos #01 Preview Widget ── */}
      {activeBatch && (
        <div
          onClick={onSwitchToCompost}
          className="bg-[#dcfce7] border border-[#cdebd3] rounded-[24px] p-4 space-y-2 cursor-pointer active:scale-[0.99] transition-all hover:border-[#16a34a]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-[16px] bg-white flex items-center justify-center flex-shrink-0">
                <img src={dashLeafStat} alt="" className="w-[26px] h-[26px] object-contain" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1f2937] leading-tight">
                  {activeBatch.title || 'Batch Kompos #01'}
                </h4>
                <p className="text-[11px] text-[#4b5563] leading-tight mt-0.5">
                  Fase {activeBatch.stage === 'filling' ? 'Pengisian (Ember A)' : 'Pematangan 14 Hari'}
                </p>
              </div>
            </div>
            <span className="text-[24px] font-extrabold text-[#0b6623] tracking-[-0.6px]">
              {activeBatch.fillPercentage || 60}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white h-[8px] rounded-full overflow-hidden p-[2px]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${activeBatch.fillPercentage || 60}%`,
                background: 'linear-gradient(90deg, #16a34a 0%, #0b6623 100%)'
              }}
            />
          </div>

          {/* Detail Link */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0b6623] pt-0.5">
            <span>Detail Kompos</span>
            <img src={dashArrowGreen} alt="→" className="w-4 h-4 block" />
          </div>
        </div>
      )}
    </div>
  );
}
