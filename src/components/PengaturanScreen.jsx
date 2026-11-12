import React, { useState } from 'react';
import * as store from '../services/storageService.js';

// Assets from Figma
import landingIcon from '../assets/figma/landing_icon.svg';
import stepMinus from '../assets/figma/step_minus.svg';
import stepPlus from '../assets/figma/step_plus.svg';

export default function PengaturanScreen({
  user,
  onProfileUpdated,
  onOpenLogoutDialog
}) {
  const [householdType, setHouseholdType] = useState(user?.householdType || 'house');
  const [notificationHour, setNotificationHour] = useState(user?.notificationHour || '08:00');

  const handleSelectHousehold = (type) => {
    setHouseholdType(type);
    const updated = store.saveUserProfile({
      ...store.getUserProfile(),
      householdType: type
    });
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  const handleAdjustHour = (delta) => {
    const updated = store.adjustNotificationHour(delta);
    setNotificationHour(updated.notificationHour || '08:00');
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  const userInitial = (user?.name || user?.fullName || 'B')[0].toUpperCase();

  return (
    <div
      className="w-full min-h-screen pb-28 pt-4 px-5 space-y-6 animate-in fade-in duration-300 relative"
      style={{
        backgroundColor: '#f8fff4',
        fontFamily: 'Poppins, sans-serif'
      }}
      data-node-id="30:2902"
      data-name="Pengaturan"
    >
      {/* ── 1. Top Logo EatWise ── */}
      <div className="flex items-center gap-2">
        <div
          className="w-[38px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #28c92a 0%, #006d2c 51%, #0b6623 100%)'
          }}
        >
          <img src={landingIcon} alt="EatWise Icon" className="w-[28px] h-[27px] block" />
        </div>
        <div className="font-bold text-[21px] leading-normal whitespace-nowrap">
          <span style={{ color: '#006d2c' }}>Eat</span>
          <span style={{ color: '#28c92a' }}>Wise</span>
        </div>
      </div>

      {/* ── 2. Header Title (Figma node 30:2803) ── */}
      <div>
        <h1 className="text-[28px] font-extrabold text-[#1e293b] tracking-[-0.7px] leading-tight">
          Pengaturan
        </h1>
      </div>

      {/* ── 3. User Profile Card (Figma node 30:2805) ── */}
      <div className="bg-white border border-[#d7ebdc] rounded-[24px] p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          {/* Avatar (52x52px) */}
          <div className="w-[52px] h-[52px] rounded-full bg-[#0e7134] flex items-center justify-center text-white font-bold text-[24px] shadow-xs overflow-hidden flex-shrink-0">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>

          {/* Name & Email */}
          <div>
            <h2 className="font-bold text-[#1e293b] text-[17px] leading-tight">
              {user?.name || user?.fullName || 'Budi'}
            </h2>
            <p className="text-[12px] text-[#6b7280] mt-0.5">
              {user?.email || 'budi@gmail.com'}
            </p>
          </div>
        </div>

        {/* Logout Button (Figma node 30:2815) */}
        <button
          type="button"
          onClick={onOpenLogoutDialog}
          className="border border-[#ba1a1a] rounded-full px-5 py-2 text-[#ba1a1a] font-bold text-[14px] hover:bg-red-50 active:scale-95 transition-all"
        >
          Logout
        </button>
      </div>

      {/* ── 4. Preferensi Hunian (Figma node 30:2817) ── */}
      <div className="space-y-2.5">
        <h2 className="text-[12px] font-bold text-[#374151] tracking-[0.6px] uppercase">
          PREFERENSI HUNIAN
        </h2>

        <div className="space-y-3">
          {/* Radio Card 1: Rumah dengan Halaman (Figma node 30:2821) */}
          <div
            onClick={() => handleSelectHousehold('house')}
            className={`border rounded-[24px] p-4 flex items-start gap-3.5 shadow-xs cursor-pointer transition-all ${
              householdType === 'house'
                ? 'bg-[#e5f7e8] border-[#16a34a]'
                : 'bg-white border-[#d7ebdc] hover:border-[#16a34a]/40'
            }`}
          >
            {/* Custom Radio Icon */}
            <div className="pt-0.5">
              <div
                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                  householdType === 'house' ? 'border-[#16a34a]' : 'border-[#9ca3af]'
                }`}
              >
                {householdType === 'house' && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#16a34a]" />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#1e293b] text-[15px] leading-snug">
                Rumah dengan Halaman
              </h3>
              <p className="text-[12px] text-[#526071] leading-relaxed mt-0.5">
                AI menyarankan kompos tanah atau biopori.
              </p>
            </div>
          </div>

          {/* Radio Card 2: Kos / Apartemen (Figma node 30:2831) */}
          <div
            onClick={() => handleSelectHousehold('apartment')}
            className={`border rounded-[24px] p-4 flex items-start gap-3.5 shadow-xs cursor-pointer transition-all ${
              householdType === 'apartment'
                ? 'bg-[#e5f7e8] border-[#16a34a]'
                : 'bg-white border-[#d7ebdc] hover:border-[#16a34a]/40'
            }`}
          >
            <div className="pt-0.5">
              <div
                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                  householdType === 'apartment' ? 'border-[#16a34a]' : 'border-[#9ca3af]'
                }`}
              >
                {householdType === 'apartment' && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#16a34a]" />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#1e293b] text-[15px] leading-snug">
                Kos / Apartemen
              </h3>
              <p className="text-[12px] text-[#526071] leading-relaxed mt-0.5">
                AI hanya menyarankan Takakura, Bokashi, atau Eco-Enzyme agar tidak bau.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Waktu Notifikasi (Figma node 45:981) ── */}
      <div className="space-y-2.5">
        <h2 className="text-[12px] font-bold text-[#374151] tracking-[0.6px] uppercase">
          WAKTU NOTIFIKASI
        </h2>

        <div className="bg-white border border-[#d7ebdc] rounded-[24px] p-4 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="font-bold text-[#1e293b] text-[14px]">
              Jam Notifikasi
            </h3>
            <p className="text-[12px] text-[#6b7280] mt-0.5">
              Pengingat bahan kritis harian
            </p>
          </div>

          {/* Stepper Control */}
          <div className="flex items-center gap-2 bg-[#f8fff4] border border-[#d7ebdc] rounded-full p-1">
            <button
              type="button"
              onClick={() => handleAdjustHour(-1)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs active:scale-95 transition-all text-[#16a34a] hover:bg-emerald-50"
              aria-label="Kurangi jam"
            >
              <img src={stepMinus} alt="-" className="w-3.5 h-3.5" />
            </button>

            <span className="font-bold text-[15px] text-[#1b2e23] px-2 min-w-[50px] text-center">
              {notificationHour}
            </span>

            <button
              type="button"
              onClick={() => handleAdjustHour(1)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs active:scale-95 transition-all text-[#16a34a] hover:bg-emerald-50"
              aria-label="Tambah jam"
            >
              <img src={stepPlus} alt="+" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
