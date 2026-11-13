import React, { useState, useRef } from 'react';
import { fetchFromBackend } from '../../config/api.js';

// Figma assets
import imgRawBackArrow from '../../assets/figma/a26fc.svg';
import imgRawMinus from '../../assets/figma/ef95b.svg';
import imgRawPlus from '../../assets/figma/e2537.svg';
import imgSparkleAi from '../../assets/figma/52fbd.svg';
import imgPlusWhite from '../../assets/figma/9a4ec.svg';

import imgLeftoverBackArrow from '../../assets/figma/e030e.svg';
import imgLeftoverMinus from '../../assets/figma/51664.svg';
import imgLeftoverPlus from '../../assets/figma/4deb4.svg';
import imgCalendarDays from '../../assets/figma/ec575.svg';
import imgClock from '../../assets/figma/909c6.svg';
import imgSortIndicator from '../../assets/figma/f5fa6.svg';
import imgInfo from '../../assets/figma/82622.svg';
import imgDialogCheckIcon from '../../assets/figma/c4268.svg';

const RAW_CATEGORIES = [
  { id: 'vegetable', label: 'Sayur & Buah', suggestedDays: 3 },
  { id: 'meat', label: 'Lauk Hewani', suggestedDays: 5 },
  { id: 'plant_protein', label: 'Lauk Nabati', suggestedDays: 4 },
  { id: 'carb', label: 'Karbohidrat', suggestedDays: 7 },
  { id: 'spice', label: 'Bumbu', suggestedDays: 14 },
  { id: 'other', label: 'Lainnya', suggestedDays: 5 }
];

const RAW_UNITS = ['butir', 'ikat', 'buah', 'gram', 'porsi', 'pak'];
const RAW_EXPIRY_OPTIONS = [1, 2, 3, 5, 7, 14];

const LEFTOVER_CATEGORIES = [
  { id: 'carb', label: 'Nasi & mi' },
  { id: 'meat', label: 'Lauk' },
  { id: 'leftover', label: 'Sayur & sup' },
  { id: 'snack', label: 'Camilan' },
  { id: 'other', label: 'Lainnya' }
];

const STORAGE_OPTIONS = [
  { id: 'chiller', label: 'Chiller' },
  { id: 'freezer', label: 'Freezer' },
  { id: 'room', label: 'Suhu ruang' }
];

/**
 * ManualInputModal — Slicing Section "Scan & Input" (Catat Stok Sendiri)
 * Mencakup layar Figma:
 * - 29:2621 (Catat Stok Sendiri - Bahan Mentah)
 * - 58:132  (Catat Stok Sendiri - Input Masakan Sisa)
 * - 45:1304 / 66:16 (Dialog makanan berhasil disimpan)
 */
export default function ManualInputModal({
  initialTab = 'raw', // 'raw' | 'leftover'
  initialShowSuccess = false,
  onClose,
  onSavedToFridge
}) {
  const [stockType, setStockType] = useState(initialTab);
  const [showSuccessDialog, setShowSuccessDialog] = useState(initialShowSuccess);
  const [savedCount, setSavedCount] = useState(1);
  const rawNameInputRef = useRef(null);

  // Raw Material State (29:2621)
  const [rawName, setRawName] = useState('');
  const [rawCategory, setRawCategory] = useState('vegetable');
  const [rawQuantity, setRawQuantity] = useState(1);
  const [rawUnit, setRawUnit] = useState('ikat');
  const [rawExpiryDays, setRawExpiryDays] = useState(3);
  const [rawStorage, setRawStorage] = useState('chiller');
  const [rawNotes, setRawNotes] = useState('');

  // Leftover Food State (58:132)
  const [leftoverName, setLeftoverName] = useState('');
  const [leftoverSubCat, setLeftoverSubCat] = useState('Sayur & sup');
  const [leftoverQuantity, setLeftoverQuantity] = useState(1);
  const [leftoverUnit, setLeftoverUnit] = useState('porsi');
  const [cookedDateIso, setCookedDateIso] = useState('2026-11-12');
  const [cookedDateText, setCookedDateText] = useState('12 Nov 2026');
  const [cookedTimeIso, setCookedTimeIso] = useState('12:30');
  const [cookedTimeText, setCookedTimeText] = useState('12.30');
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);

  const handleDateChange = (e) => {
    const val = e.target.value;
    setCookedDateIso(val);
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des'
    ];
    const mIdx = Math.max(0, Math.min(11, parseInt(mm, 10) - 1));
    setCookedDateText(`${parseInt(dd, 10)} ${months[mIdx]} ${yyyy}`);
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    setCookedTimeIso(val);
    if (!val) return;
    setCookedTimeText(val.replace(':', '.'));
  };
  const [leftoverStorage, setLeftoverStorage] = useState('chiller');
  const [leftoverExpiryDays, setLeftoverExpiryDays] = useState(2);
  const [customExpiryMode, setCustomExpiryMode] = useState(false);
  const [leftoverNotes, setLeftoverNotes] = useState('');

  const activeRawCatInfo =
    RAW_CATEGORIES.find((c) => c.id === rawCategory) || RAW_CATEGORIES[0];
  const rawStorageLabelText =
    STORAGE_OPTIONS.find((s) => s.id === rawStorage)?.label || 'Chiller';
  const leftoverStorageLabelText =
    STORAGE_OPTIONS.find((s) => s.id === leftoverStorage)?.label || 'Chiller';

  const handleSaveRaw = async (resetAfter = false) => {
    const finalName = rawName.trim();
    if (!finalName) {
      rawNameInputRef.current?.focus();
      return;
    }
    const payload = {
      stockType: 'raw',
      name: finalName,
      category: rawCategory,
      categoryLabel: activeRawCatInfo.label,
      quantity: rawQuantity,
      unit: rawUnit,
      quantityText: `${rawQuantity} ${rawUnit}`,
      storage: rawStorage,
      storageLabel: `${rawQuantity} ${rawUnit} · ${rawStorageLabelText}`,
      expiryDays: rawExpiryDays,
      weightKg: 0.3,
      notes: rawNotes.trim()
    };
    try {
      await fetchFromBackend('/foods', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      // Tetap lanjutkan jika offline
    }

    if (resetAfter) {
      setRawName('');
      setRawNotes('');
      setRawQuantity(1);
      setSavedCount((c) => c + 1);
      setShowSuccessDialog(true);
    } else {
      setSavedCount(1);
      setShowSuccessDialog(true);
    }
  };

  const handleSaveLeftover = async () => {
    const finalName = leftoverName.trim();
    if (!finalName) return;
    const payload = {
      stockType: 'leftover',
      name: finalName,
      category: 'leftover',
      categoryLabel: leftoverSubCat,
      quantity: leftoverQuantity,
      unit: leftoverUnit,
      quantityText: `${leftoverQuantity} ${leftoverUnit}`,
      cookedDate: cookedDateIso || cookedDateText,
      cookedTime: cookedTimeIso || cookedTimeText,
      storage: leftoverStorage,
      storageLabel: `${leftoverQuantity} ${leftoverUnit} · ${leftoverStorageLabelText}`,
      expiryDays: leftoverExpiryDays,
      weightKg: 0.35,
      notes: leftoverNotes.trim()
    };
    try {
      await fetchFromBackend('/foods', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      // Tetap lanjutkan jika offline
    }
    setSavedCount(1);
    setShowSuccessDialog(true);
  };

  return (
    <div className="w-full max-w-[402px] mx-auto bg-[#f8fff4] rounded-[40px] overflow-hidden relative shadow-xl font-['Poppins',sans-serif]">
      {/* =====================================================================
          TAB 1: BAHAN MENTAH (Node 29:2621)
      ===================================================================== */}
      {stockType === 'raw' && (
        <div
          className="bg-[#f8fff4] flex flex-col gap-[22px] items-start px-[24px] pt-[33px] pb-[48px] relative w-full"
          data-node-id="29:2621"
        >
          {/* Navigation & Title Header */}
          <div className="flex gap-[14px] items-center pt-[8px] w-full">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-[rgba(229,231,235,0.8)] cursor-pointer flex items-center justify-center rounded-full size-[44px] shrink-0 hover:bg-gray-50 transition"
            >
              <img alt="Kembali" className="size-[20px]" src={imgRawBackArrow} />
            </button>
            <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
              <h1 className="font-bold text-[#111827] text-[20px] leading-[25px] tracking-[-0.5px]">
                Catat Stok Sendiri
              </h1>
              <p className="font-normal text-[#6b7280] text-[12px] leading-[16px]">
                Tambah bahan atau masakan sisa ke kulkas
              </p>
            </div>
          </div>

          {/* Nav - Tipe Stok */}
          <div className="bg-white border border-[rgba(229,231,235,0.9)] flex items-start p-[5px] rounded-full w-full">
            <button
              type="button"
              onClick={() => setStockType('raw')}
              className="bg-[#0e7f3d] cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex-1 py-[10px] rounded-full font-bold text-[12px] leading-[16px] text-center text-white"
            >
              Bahan Mentah
            </button>
            <button
              type="button"
              onClick={() => setStockType('leftover')}
              className="flex-1 cursor-pointer py-[10px] rounded-full font-bold text-[#374151] text-[12px] leading-[16px] text-center hover:text-[#0e7f3d] transition"
            >
              Masakan Sisa
            </button>
          </div>

          {/* Section - Input: Nama Bahan */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Nama bahan
            </label>
            <div className="bg-white border border-[rgba(229,231,235,0.9)] focus-within:border-[#0e7f3d] flex items-center px-[17px] py-[14px] rounded-[16px] w-full transition">
              <input
                ref={rawNameInputRef}
                type="text"
                value={rawName}
                onChange={(e) => setRawName(e.target.value)}
                placeholder="cth. Bayam hijau"
                className="w-full bg-transparent outline-none font-normal text-[#111827] placeholder-[#9ca3af] text-[14px]"
              />
            </div>
          </div>

          {/* Section - Selection: Kategori */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Kategori
            </span>
            <div className="flex flex-wrap gap-[8px] items-start w-full">
              {RAW_CATEGORIES.map((cat) => {
                const active = rawCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setRawCategory(cat.id)}
                    className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                      active
                        ? 'bg-[#0e7f3d] text-white font-bold'
                        : 'bg-white border border-[rgba(229,231,235,0.9)] text-[#374151] font-normal'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section - Selection: Jumlah Counter */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Jumlah
            </span>
            <div className="flex gap-[24px] items-center">
              <button
                type="button"
                onClick={() => setRawQuantity((q) => Math.max(1, q - 1))}
                className="bg-white border border-[rgba(229,231,235,0.9)] cursor-pointer flex items-center justify-center rounded-full size-[40px] active:scale-95"
              >
                <img alt="Kurangi" className="size-[16px]" src={imgRawMinus} />
              </button>
              <span className="font-normal text-[#111827] text-[16px] leading-[24px] min-w-[16px] text-center">
                {rawQuantity}
              </span>
              <button
                type="button"
                onClick={() => setRawQuantity((q) => q + 1)}
                className="bg-white border border-[rgba(229,231,235,0.9)] cursor-pointer flex items-center justify-center rounded-full size-[40px] active:scale-95"
              >
                <img alt="Tambah" className="size-[16px]" src={imgRawPlus} />
              </button>
            </div>
          </div>

          {/* Section - Selection: Satuan */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Satuan
            </span>
            <div className="flex flex-wrap gap-[8px] items-start w-full">
              {RAW_UNITS.map((unit) => {
                const active = rawUnit === unit;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setRawUnit(unit)}
                    className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                      active
                        ? 'bg-[#0e7f3d] text-white font-bold'
                        : 'bg-white border border-[rgba(229,231,235,0.9)] text-[#374151] font-normal'
                    }`}
                  >
                    {unit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section - Selection: Perkiraan Masa Simpan */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Perkiraan masa simpan
            </span>
            <div className="flex flex-wrap gap-[8px] items-start w-full">
              {RAW_EXPIRY_OPTIONS.map((days) => {
                const active = rawExpiryDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRawExpiryDays(days)}
                    className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                      active
                        ? 'bg-[#0e7f3d] text-white font-bold'
                        : 'bg-white border border-[rgba(229,231,235,0.9)] text-[#374151] font-normal'
                    }`}
                  >
                    {days} hari
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section - AI Suggestion Callout Card */}
          <div className="bg-[#e4f8e9] border border-[#c5eccf] flex items-center justify-between gap-[10px] p-[15px] rounded-[16px] w-full">
            <div className="flex gap-[12px] items-center min-w-0 flex-1">
              <div className="bg-white flex items-center justify-center rounded-[12px] size-[36px] shrink-0">
                <img alt="Saran AI" className="size-[20px]" src={imgSparkleAi} />
              </div>
              <p className="text-[12px] leading-[16.5px] text-[#1f2937] flex-1">
                <span className="font-bold text-[#111827]">Saran AI:</span>{' '}
                {activeRawCatInfo.label} biasanya tahan sekitar {activeRawCatInfo.suggestedDays} hari.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRawExpiryDays(activeRawCatInfo.suggestedDays)}
              className="bg-white border border-[#0e5c2f] cursor-pointer px-[15px] py-[7px] rounded-full font-normal text-[#0e5c2f] text-[12px] leading-[16px] shrink-0 active:scale-95 hover:bg-green-50 transition"
            >
              Pakai
            </button>
          </div>

          {/* Section - Selection: Tempat Penyimpanan */}
          <div className="flex flex-col gap-[10px] items-start w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Penyimpanan
            </span>
            <div className="flex flex-wrap gap-[8px] items-start w-full">
              {STORAGE_OPTIONS.map((opt) => {
                const active = rawStorage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRawStorage(opt.id)}
                    className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                      active
                        ? 'bg-[#0e7f3d] text-white font-bold'
                        : 'bg-white border border-[rgba(229,231,235,0.9)] text-[#374151] font-normal'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section - Input: Catatan (opsional) */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Catatan (opsional)
            </label>
            <div className="bg-white border border-[rgba(229,231,235,0.9)] flex items-center px-[17px] py-[14px] rounded-[16px] w-full">
              <input
                type="text"
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="cth. dibeli di pasar, sudah dicuci"
                className="w-full bg-transparent outline-none font-normal text-[#111827] placeholder-[#9ca3af] text-[14px]"
              />
            </div>
          </div>

          {/* Live Card Preview Section */}
          <div className="flex flex-col gap-[8px] items-start pt-[4px] w-full">
            <span className="font-normal text-[#111827] text-[12px] leading-[16px] tracking-[0.3px]">
              Pratinjau kartu
            </span>
            <div className="bg-white border border-[rgba(229,231,235,0.8)] flex flex-col gap-[10px] items-start p-[17px] rounded-[16px] w-full">
              <div className="flex items-start justify-between gap-2 w-full">
                <span className="font-bold text-[#111827] text-[16px] leading-[24px]">
                  {rawName.trim() || 'Nama bahan'}
                </span>
                <div className="bg-[#dcfce7] px-[10px] py-[2px] rounded-full shrink-0">
                  <span className="font-normal text-[#0e5c2f] text-[11px] leading-[16.5px]">
                    {rawExpiryDays} Hari Lagi
                  </span>
                </div>
              </div>
              <span className="font-normal text-[#6b7280] text-[12px] leading-[16px]">
                {activeRawCatInfo.label} · {rawQuantity} {rawUnit} · {rawStorageLabelText}
              </span>
              <div className="bg-[#f3f4f6] h-[6px] rounded-full w-full overflow-hidden relative">
                <div className="bg-[#10b981] h-[6px] rounded-full w-[72%]" />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-[14px] items-center w-full pt-[8px]">
            <button
              type="button"
              onClick={() => handleSaveRaw(false)}
              className={`cursor-pointer flex h-[42px] items-center justify-center rounded-full w-full font-bold text-[14px] leading-[20px] tracking-[0.35px] transition-colors ${
                rawName.trim()
                  ? 'bg-[#0e7f3d] text-white hover:bg-[#0b6623]'
                  : 'bg-[#e5e7eb] text-[#4b5563] hover:bg-[#d1d5db]'
              }`}
            >
              {rawName.trim() ? 'Simpan' : 'Isi nama dulu'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveRaw(true)}
              className="bg-[#0e7f3d] hover:bg-[#0b6623] cursor-pointer transition-colors flex gap-[6px] items-center justify-center py-[12px] rounded-full w-full"
            >
              <img alt="Tambah" className="size-[16px]" src={imgPlusWhite} />
              <span className="font-bold text-[12px] leading-[16px] text-white tracking-[0.3px]">
                Simpan &amp; Tambah Stok Lagi
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-[#0b6623] cursor-pointer flex h-[38px] items-center justify-center rounded-full w-full font-normal text-[#0b6623] text-[14px] leading-[20px] hover:bg-green-50 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: INPUT MASAKAN SISA (Node 58:132)
      ===================================================================== */}
      {stockType === 'leftover' && (
        <div
          className="bg-[#f8fff4] flex flex-col gap-[24px] items-start pb-[60px] pt-[41px] px-[24px] relative w-full"
          data-node-id="58:132"
        >
          {/* Navigasi input stok */}
          <div className="flex flex-col gap-[24px] items-start w-full">
            <div className="flex gap-[14px] items-center w-full">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#e5e7eb] cursor-pointer flex items-center justify-center rounded-full size-[44px] shrink-0 hover:bg-gray-50 transition"
              >
                <img alt="Kembali" className="size-[20px]" src={imgLeftoverBackArrow} />
              </button>
              <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
                <h1 className="font-bold leading-[25px] text-[#111827] text-[20px] tracking-[-0.5px]">
                  Catat Stok Sendiri
                </h1>
                <p className="font-normal leading-[16px] text-[#6b7280] text-[12px]">
                  Tambah bahan atau masakan sisa ke kulkas
                </p>
              </div>
            </div>

            {/* Tipe stok switcher */}
            <div className="bg-white border border-[#e5e7eb] flex items-start p-[4px] rounded-full w-full">
              <button
                type="button"
                onClick={() => setStockType('raw')}
                className="bg-white cursor-pointer flex-1 py-[10px] rounded-full font-bold text-[#374151] text-[12px] leading-[16px] text-center hover:text-[#0e7f3d] transition"
              >
                Bahan Mentah
              </button>
              <button
                type="button"
                onClick={() => setStockType('leftover')}
                className="bg-[#0e7f3d] cursor-pointer flex-1 py-[10px] rounded-full font-bold text-white text-[12px] leading-[16px] text-center"
              >
                Masakan Sisa
              </button>
            </div>
          </div>

          {/* Formulir masakan sisa */}
          <div className="flex flex-col gap-[22px] items-start w-full">
            {/* Nama masakan */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <label className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Nama masakan
              </label>
              <div className="bg-white border border-[#e5e7eb] flex h-[50px] items-center px-[16px] rounded-[16px] w-full">
                <input
                  type="text"
                  value={leftoverName}
                  onChange={(e) => setLeftoverName(e.target.value)}
                  placeholder="Sayur sop"
                  className="w-full bg-transparent outline-none font-normal text-[#111827] text-[14px]"
                />
              </div>
            </div>

            {/* Kategori masakan */}
            <div className="flex flex-col gap-[10px] items-start w-full">
              <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Kategori masakan
              </span>
              <div className="flex flex-wrap gap-[8px] items-start w-full">
                {LEFTOVER_CATEGORIES.map((cat) => {
                  const active = leftoverSubCat === cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLeftoverSubCat(cat.label)}
                      className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                        active
                          ? 'bg-[#0e7f3d] text-white font-bold'
                          : 'bg-white border border-[#e5e7eb] text-[#374151] font-normal'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jumlah dan satuan */}
            <div className="flex items-start justify-between gap-[16px] w-full">
                {/* Jumlah */}
              <div className="flex flex-col gap-[10px] items-start">
                <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                  Jumlah
                </span>
                <div className="flex gap-[16px] items-center">
                  <button
                    type="button"
                    onClick={() => setLeftoverQuantity((q) => Math.max(1, q - 1))}
                    className="bg-white border border-[#e5e7eb] cursor-pointer flex items-center justify-center rounded-full size-[40px] active:scale-95 text-[#111827]"
                    aria-label="Kurangi jumlah"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3.33334 8H12.6667"
                        stroke="#111827"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="font-semibold leading-[24px] text-[#111827] text-[16px] min-w-[16px] text-center">
                    {leftoverQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLeftoverQuantity((q) => q + 1)}
                    className="bg-white border border-[#e5e7eb] cursor-pointer flex items-center justify-center rounded-full size-[40px] active:scale-95 text-[#111827]"
                    aria-label="Tambah jumlah"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3.33334V12.6667M3.33334 8H12.6667"
                        stroke="#111827"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Satuan */}
              <div className="flex flex-col gap-[10px] items-start">
                <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                  Satuan
                </span>
                <div className="flex gap-[8px] items-center">
                  {['porsi', 'wadah'].map((u) => {
                    const active = leftoverUnit === u;
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setLeftoverUnit(u)}
                        className={`cursor-pointer h-[40px] px-[16px] rounded-full text-[12px] leading-[16px] transition-colors ${
                          active
                            ? 'bg-[#0e7f3d] text-white font-bold'
                            : 'bg-white border border-[#e5e7eb] text-[#374151] font-normal'
                        }`}
                      >
                        {u}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tanggal & waktu dimasak */}
            <div className="flex flex-col gap-[10px] items-start w-full">
              <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Tanggal &amp; waktu dimasak
              </span>
              <div className="flex gap-[10px] items-start w-full">
                {/* Pilih tanggal */}
                <div
                  onClick={() => datePickerRef.current?.showPicker?.()}
                  className="bg-white border border-[#e5e7eb] hover:border-[#0e7f3d] cursor-pointer flex flex-1 h-[48px] items-center justify-between px-[14px] rounded-[16px] min-w-0 relative transition"
                >
                  <div className="flex gap-[8px] items-center min-w-0 flex-1 pointer-events-none">
                    <img alt="" className="size-[16px] shrink-0" src={imgCalendarDays} />
                    <span className="font-medium text-[#111827] text-[13px] truncate">
                      {cookedDateText}
                    </span>
                  </div>
                  <img
                    alt=""
                    className="h-[15px] w-[9px] shrink-0 pointer-events-none"
                    src={imgSortIndicator}
                  />
                  <input
                    ref={datePickerRef}
                    type="date"
                    value={cookedDateIso}
                    onChange={handleDateChange}
                    aria-label="Pilih tanggal dimasak"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Pilih waktu */}
                <div
                  onClick={() => timePickerRef.current?.showPicker?.()}
                  className="bg-white border border-[#e5e7eb] hover:border-[#0e7f3d] cursor-pointer flex h-[48px] items-center justify-between px-[14px] rounded-[16px] w-[124px] shrink-0 relative transition"
                >
                  <div className="flex gap-[8px] items-center pointer-events-none">
                    <img alt="" className="size-[16px] shrink-0" src={imgClock} />
                    <span className="font-medium text-[#111827] text-[13px]">
                      {cookedTimeText}
                    </span>
                  </div>
                  <img
                    alt=""
                    className="h-[15px] w-[9px] shrink-0 pointer-events-none"
                    src={imgSortIndicator}
                  />
                  <input
                    ref={timePickerRef}
                    type="time"
                    value={cookedTimeIso}
                    onChange={handleTimeChange}
                    aria-label="Pilih waktu dimasak"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Penyimpanan */}
            <div className="flex flex-col gap-[10px] items-start w-full">
              <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Penyimpanan
              </span>
              <div className="flex flex-wrap gap-[8px] items-start w-full">
                {STORAGE_OPTIONS.map((opt) => {
                  const active = leftoverStorage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLeftoverStorage(opt.id)}
                      className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                        active
                          ? 'bg-[#0e7f3d] text-white font-bold'
                          : 'bg-white border border-[#e5e7eb] text-[#374151] font-normal'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perkiraan masa simpan */}
            <div className="flex flex-col gap-[10px] items-start w-full">
              <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Perkiraan masa simpan
              </span>
              <div className="flex flex-wrap gap-[8px] items-start w-full">
                {[1, 2, 3].map((days) => {
                  const active = !customExpiryMode && leftoverExpiryDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setCustomExpiryMode(false);
                        setLeftoverExpiryDays(days);
                      }}
                      className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                        active
                          ? 'bg-[#0e7f3d] text-white font-bold'
                          : 'bg-white border border-[#e5e7eb] text-[#374151] font-normal'
                      }`}
                    >
                      {days} hari
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCustomExpiryMode((v) => !v)}
                  className={`cursor-pointer px-[16px] py-[9px] rounded-full text-[12px] leading-[16px] transition-colors ${
                    customExpiryMode
                      ? 'bg-[#0e7f3d] text-white font-bold'
                      : 'bg-white border border-[#e5e7eb] text-[#374151] font-normal'
                  }`}
                >
                  Atur sendiri
                </button>
              </div>

              {customExpiryMode && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[#374151]">Jumlah hari:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={leftoverExpiryDays}
                    onChange={(e) =>
                      setLeftoverExpiryDays(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-20 px-3 py-1.5 rounded-xl bg-white border border-[#e5e7eb] text-sm font-semibold text-[#111827]"
                  />
                </div>
              )}

              {/* Catatan perkiraan */}
              <div className="bg-[#eff5f0] border border-[#dce8df] flex gap-[8px] items-center px-[12px] py-[10px] rounded-[12px] w-full">
                <img alt="" className="size-[15px] shrink-0" src={imgInfo} />
                <p className="flex-1 font-normal leading-[16px] text-[#4b5563] text-[11px]">
                  Masakan sisa di {leftoverStorageLabelText.toLowerCase()} umumnya baik dikonsumsi
                  dalam 1–2 hari.
                </p>
              </div>
            </div>

            {/* Catatan (opsional) */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <label className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Catatan (opsional)
              </label>
              <div className="bg-white border border-[#e5e7eb] flex flex-col items-start p-[16px] rounded-[16px] w-full">
                <textarea
                  rows={2}
                  value={leftoverNotes}
                  onChange={(e) => setLeftoverNotes(e.target.value)}
                  className="w-full bg-transparent outline-none resize-none font-normal leading-[21px] text-[#111827] text-[14px]"
                />
              </div>
            </div>
          </div>

          {/* Pratinjau dan aksi */}
          <div className="flex flex-col gap-[30px] items-start w-full">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <span className="font-normal leading-[16px] text-[#111827] text-[12px] tracking-[0.3px]">
                Pratinjau kartu
              </span>
              <div className="bg-white border border-[#e5e7eb] flex flex-col gap-[10px] items-start p-[16px] rounded-[16px] w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="font-bold leading-[24px] text-[#111827] text-[16px]">
                    {leftoverName.trim() || 'Sayur sop'}
                  </span>
                  <div className="bg-[#dcfce7] px-[10px] py-[3px] rounded-full shrink-0">
                    <span className="font-normal leading-[16px] text-[#0e5c2f] text-[11px]">
                      Perkiraan {leftoverExpiryDays} hari
                    </span>
                  </div>
                </div>
                <div className="flex flex-col font-normal gap-[4px] items-start text-[#6b7280] w-full">
                  <p className="leading-[18px] text-[12px]">
                    {leftoverSubCat} · {leftoverQuantity} {leftoverUnit} ·{' '}
                    {leftoverStorageLabelText}
                  </p>
                  <p className="leading-[17px] text-[11px]">
                    Dimasak {cookedDateText}, {cookedTimeText}
                  </p>
                </div>
                <div className="bg-[#f3f4f6] h-[6px] overflow-hidden relative rounded-full w-full">
                  <div className="bg-[#10b981] h-[6px] rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[20px] items-start w-full">
              <button
                type="button"
                onClick={handleSaveLeftover}
                className="bg-[#0e7f3d] hover:bg-[#0b6623] cursor-pointer transition-colors flex h-[42px] items-center justify-center rounded-full w-full font-bold leading-[20px] text-[14px] text-white tracking-[0.35px]"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#0b6623] cursor-pointer flex h-[38px] items-center justify-center rounded-full w-full font-normal leading-[20px] text-[#0b6623] text-[14px] hover:bg-green-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DIALOG MAKANAN BERHASIL DISIMPAN (Node 45:1304 & 66:16)
      ===================================================================== */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 bg-[rgba(16,39,29,0.5)] flex items-center justify-center p-4">
          <div
            className="bg-white flex flex-col gap-[24px] items-center overflow-hidden pb-[24px] pt-[28px] px-[24px] relative rounded-[32px] shadow-[0px_12px_36px_0px_rgba(22,59,34,0.08)] w-full max-w-[358px]"
            data-node-id="45:1304"
          >
            <div className="flex flex-col gap-[12px] items-center w-full">
              <div className="bg-[#d7f5e4] flex items-center justify-center rounded-full size-[60px]">
                <div className="relative size-[30px]">
                  <img
                    alt="Berhasil"
                    className="size-full object-contain"
                    src={imgDialogCheckIcon}
                  />
                </div>
              </div>
              <div className="font-bold text-[#111827] text-[22px] leading-[29px] text-center tracking-[-0.4px]">
                <p>Makanan berhasil</p>
                <p>disimpan!</p>
              </div>
              <p className="font-normal text-[#6b7280] text-[14px] leading-[22px] text-center">
                {savedCount} bahan makanan sudah ditambahkan ke kulkasmu.
              </p>
            </div>

            <div className="flex flex-col gap-[12px] items-start w-full">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessDialog(false);
                  onSavedToFridge?.();
                }}
                className="bg-[#0e7f3d] hover:bg-[#0b6623] cursor-pointer transition-colors flex h-[48px] items-center justify-center rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] w-full font-bold text-[15px] leading-[22.5px] text-white"
              >
                Lihat Kulkas
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessDialog(false);
                }}
                className="border border-[#0b6623] cursor-pointer flex h-[40px] items-center justify-center rounded-[25px] w-full font-semibold text-[#0e7f3d] text-[14px] leading-[21px] hover:bg-green-50 transition"
              >
                Tambah Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
