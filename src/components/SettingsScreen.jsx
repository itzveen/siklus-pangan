import React from 'react';
import { Home, Building2, Minus, Plus, RotateCcw, Check, Sparkles } from 'lucide-react';
import EatWiseLogo from './EatWiseLogo.jsx';
import * as store from '../services/storageService.js';

export default function SettingsScreen({
  user,
  onUserUpdate,
  onRequestLogout,
  onResetData
}) {
  const currentHousehold = user?.householdType || 'house';
  const currentHour = user?.notificationHour || '08:00';

  const handleSelectHousehold = (type) => {
    const updated = store.saveUserProfile({
      ...store.getUserProfile(),
      householdType: type
    });
    if (onUserUpdate) onUserUpdate(updated);
  };

  const handleAdjustHour = (delta) => {
    const updated = store.adjustNotificationHour(delta);
    if (onUserUpdate) onUserUpdate(updated);
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <EatWiseLogo size="sm" showText={false} className="mb-1" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan
        </h1>
        <p className="text-xs text-slate-500">
          Sesuaikan profil dan rekomendasi AI untuk dapurmu
        </p>
      </div>

      {/* 1. Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-bold text-lg flex items-center justify-center overflow-hidden border-2 border-emerald-600 shadow-sm">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{(user?.name || 'B')[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{user?.name || 'Budi'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'budi@gmail.com'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onRequestLogout}
          className="py-1.5 px-4 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-full border border-rose-300 transition-colors active:scale-95 shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* 2. Preferensi Hunian */}
      <div className="space-y-2.5">
        <h2 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          PREFERENSI HUNIAN
        </h2>

        {/* Option 1: Rumah dengan Halaman */}
        <button
          onClick={() => handleSelectHousehold('house')}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
            currentHousehold === 'house'
              ? 'bg-[#DCFCE7] border-emerald-500 shadow-sm ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="mt-0.5">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                currentHousehold === 'house'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {currentHousehold === 'house' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
              <Home className="w-4 h-4 text-emerald-700" />
              <span>Rumah dengan Halaman</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI menyarankan kompos tanah atau biopori.
            </p>
          </div>
        </button>

        {/* Option 2: Kos / Apartemen */}
        <button
          onClick={() => handleSelectHousehold('apartment')}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
            currentHousehold === 'apartment'
              ? 'bg-[#DCFCE7] border-emerald-500 shadow-sm ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="mt-0.5">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                currentHousehold === 'apartment'
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {currentHousehold === 'apartment' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Kos / Apartemen</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI hanya menyarankan Takakura, Bokashi, atau Eco-Enzyme agar tidak bau.
            </p>
          </div>
        </button>
      </div>

      {/* 3. Waktu Notifikasi */}
      <div className="space-y-2.5">
        <h2 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          WAKTU NOTIFIKASI
        </h2>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Pengingat harian</h4>
            <p className="text-xs text-slate-400 mt-0.5">Jam notifikasi bahan kritis</p>
          </div>

          {/* Stepper Hour Control */}
          <div className="flex items-center gap-2.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => handleAdjustHour(-1)}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 active:scale-95 transition-all"
              title="Kurang 1 jam"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs text-slate-900 min-w-[65px] text-center">
              {currentHour} WIB
            </span>
            <button
              onClick={() => handleAdjustHour(1)}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 active:scale-95 transition-all"
              title="Tambah 1 jam"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Reset Data Demo & Juri Utilities */}
      <div className="pt-2">
        <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Mode Demo & Pengujian Juri</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Kembalikan stok kulkas, riwayat AI, dan notifikasi ke kondisi awal demo Figma.
          </p>
          <button
            onClick={onResetData}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data ke Kondisi Awal</span>
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-2">
        <p>EatWise Mobile Web · v1.0.0 (Zero-Waste Edition)</p>
        <p>Closed-Loop Food Waste & Smart Composting</p>
      </div>
    </div>
  );
}
