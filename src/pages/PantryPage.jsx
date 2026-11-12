import React, { useState, useEffect } from "react";
import * as store from "../services/storageService.js";
import { fetchFromBackend } from "../config/api.js";

// Figma Assets for Dashboard (16:523)
import imgLeaf from "../assets/figma/2353e.png";
import imgLeaf1 from "../assets/figma/40188.png";
import imgCloud from "../assets/figma/250fe.png";
import imgError from "../assets/figma/1ac8c.png";
import imgImage1 from "../assets/figma/97ad2.png";
import imgImage2 from "../assets/figma/29efb.png";
import imgImage3 from "../assets/figma/8b842.png";
import imgImage4 from "../assets/figma/2fb6d.png";
import imgRecycle from "../assets/figma/afcb3.png";
import imgChatBubble from "../assets/figma/d9083.png";
import imgEatwiseIcon from "../assets/figma/b91d1.svg";
import imgEllipse1 from "../assets/figma/fb35c.svg";
import imgBellIcon from "../assets/figma/17732.svg";
import imgEllipse2 from "../assets/figma/60521.svg";
import imgLine1 from "../assets/figma/06397.svg";
import imgScanSvg from "../assets/figma/d3841.svg";
import imgManualSvg from "../assets/figma/59ffb.svg";
import imgSortSvg from "../assets/figma/e6c70.svg";
import imgArrowRightSvg from "../assets/figma/cc8ad.svg";
import imgNavPantryActive from "../assets/figma/9a0b8.svg";
import imgNavKomposSvg from "../assets/figma/17245.svg";
import imgNavSettingsSvg from "../assets/figma/5c27b.svg";
import imgNavCenterScanSvg from "../assets/figma/1950b.svg";

function getFoodIllustration(item) {
  const nameLower = (item.name || "").toLowerCase();
  if (nameLower.includes("bayam") || nameLower.includes("sayur") || nameLower.includes("sop")) {
    return { src: imgImage1, type: "cover" };
  }
  if (nameLower.includes("wortel") || nameLower.includes("tomat")) {
    return { src: imgImage2, type: "cover" };
  }
  if (nameLower.includes("telur") || item.category === "meat") {
    return { src: imgImage3, type: "box-yellow" };
  }
  if (nameLower.includes("tahu") || item.status === "spoiled" || item.category === "plant_protein") {
    return { src: imgImage4, type: "box-red" };
  }
  return { src: imgImage1, type: "cover" };
}

export default function PantryPage({
  onOpenScan,
  onOpenManual,
  onOpenRescueRecipe,
  onOpenCompostGuide,
  onNavigateTab
}) {
  const [foods, setFoods] = useState([]);
  const [impact, setImpact] = useState({ savedKg: 3.8, co2PreventedKg: 9.5 });
  const [batches, setBatches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);

  const loadDashboardData = async () => {
    const localFoods = store.getFoodItems();
    const localImpact = store.getImpactStats();
    const localBatches = store.getCompostBatches();
    setFoods(localFoods);
    setImpact(localImpact);
    setBatches(localBatches);

    try {
      const apiRes = await fetchFromBackend("/dashboard");
      const data = apiRes?.data || apiRes;
      if (Array.isArray(data?.foodItems) && data.foodItems.length > 0) {
        setFoods(data.foodItems);
      }
      if (data?.impactStats) {
        setImpact(data.impactStats);
      }
      if (Array.isArray(data?.compostBatches) && data.compostBatches.length > 0) {
        setBatches(data.compostBatches);
      }
    } catch {
      // Gunakan data localStorage jika offline
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleMarkCooked = async (id) => {
    const updated = store.markFoodAsCooked(id);
    setFoods(updated);
    setImpact(store.getImpactStats());
    try {
      await fetchFromBackend(`/foods/${id}/cook`, { method: "PATCH" });
    } catch {
      // Abaikan jika offline
    }
  };

  const handleDeleteFood = async (id) => {
    const updated = store.removeFoodItem(id);
    setFoods(updated);
    try {
      await fetchFromBackend(`/foods/${id}`, { method: "DELETE" });
    } catch {
      // Abaikan jika offline
    }
  };

  const warningItems = foods.filter((f) => f.status === "warning" || (f.expiryDays > 0 && f.expiryDays <= 2));
  const vegCount = foods.filter((f) => f.category === "vegetable").length;
  const meatCount = foods.filter((f) => f.category === "meat").length;
  const leftoverCount = foods.filter((f) => f.stockType === "leftover" || f.category === "leftover").length;

  const filteredFoods = foods
    .filter((f) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "vegetable") return f.category === "vegetable";
      if (selectedCategory === "meat") return f.category === "meat";
      if (selectedCategory === "leftover") return f.stockType === "leftover" || f.category === "leftover";
      return true;
    })
    .sort((a, b) => {
      const daysA = Number(a.expiryDays ?? 5);
      const daysB = Number(b.expiryDays ?? 5);
      return sortAsc ? daysA - daysB : daysB - daysA;
    });

  const activeFillingBatch = batches.find((b) => b.stage === "filling") || {
    title: "Batch Kompos #01",
    subtitle: "Fase Pengisian (Ember A)",
    fillPercentage: 60
  };

  return (
    <div
      className="bg-[#f8fff4] overflow-x-hidden relative w-full max-w-[402px] min-h-screen mx-auto font-['Poppins',sans-serif] pb-[100px]"
      data-node-id="16:523"
      data-name="Dashboard"
    >
      {/* Top App Bar */}
      <div className="flex items-center justify-between px-[24px] pt-[23px]">
        <div className="flex items-center gap-[10px]">
          <div className="relative flex items-center justify-center h-[36px] w-[38.103px]">
            <div className="-rotate-90 flex-none">
              <div className="bg-gradient-to-b from-[#28c92a] from-[51.442%] to-[#0b6623] to-[94.722%] via-[#006d2c] via-[94.712%] h-[38.103px] w-[36px] rounded-[10px]" />
            </div>
            <img
              alt="EatWise"
              className="absolute h-[27.225px] w-[28.339px]"
              src={imgEatwiseIcon}
            />
          </div>
          <p className="font-bold text-[21px] leading-none">
            <span className="text-[#006d2c]">Eat</span>
            <span className="text-[#28c92a]">Wise</span>
          </p>
        </div>

        <div className="flex items-center gap-[12px]">
          {/* Notification Bell */}
          <div className="relative size-[50px] flex items-center justify-center">
            <img alt="" className="absolute inset-0 size-full" src={imgEllipse1} />
            <img alt="Notifikasi" className="relative h-[28px] w-[25px]" src={imgBellIcon} />
            <div className="absolute bg-[#ba1a1a] right-[10px] top-[8px] rounded-full size-[10px] ring-2 ring-[#f9f9ff]" />
          </div>

          {/* Profile Avatar */}
          <div className="relative h-[42px] w-[41px] flex items-center justify-center rounded-full shadow-[0px_0px_0px_1px_rgba(0,101,44,0.2)]">
            <img alt="Profil" className="absolute inset-0 size-full" src={imgEllipse2} />
            <span className="relative font-bold text-[24px] text-white leading-none">B</span>
          </div>
        </div>
      </div>

      {/* Greeting & Tags */}
      <div className="px-[28px] pt-[20px]">
        <h1 className="font-bold text-[24px] text-black leading-normal">Halo, Budi!</h1>
        <p className="font-normal text-[#4b5563] text-[12px] leading-normal mt-[4px]">
          Pantry cerdas mendeteksi {foods.length} bahan aktif.
        </p>

        <div className="flex items-center gap-[11px] mt-[16px]">
          <div className="bg-[rgba(40,201,42,0.32)] h-[22px] rounded-[17px] px-[10px] flex items-center gap-[6px]">
            <img alt="" className="h-[17px] w-[19px] object-contain" src={imgLeaf} />
            <span className="font-bold text-[#00652c] text-[12px] leading-none">Zero Waste</span>
          </div>
          <div className="bg-white border border-[#cdebd3] h-[22px] rounded-[17px] px-[14px] flex items-center justify-center">
            <span className="font-bold text-[#00652c] text-[12px] leading-none">
              Rumah (Kompos Ember)
            </span>
          </div>
        </div>
      </div>

      {/* Impact Stats Card */}
      <div className="px-[25px] mt-[22px]">
        <div
          className="bg-white border border-[#cdebd3] h-[90px] rounded-[25px] w-full flex items-center justify-between px-[16px] relative"
          data-node-id="16:894"
        >
          {/* Bahan Terselamatkan */}
          <div className="flex items-center gap-[14px] flex-1">
            <div className="bg-[rgba(40,201,42,0.32)] h-[35px] w-[34px] rounded-[12px] flex items-center justify-center shrink-0">
              <img alt="" className="h-[26px] w-[31px] object-contain" src={imgLeaf1} />
            </div>
            <div className="flex flex-col">
              <span className="font-normal text-[#4b5563] text-[11px] leading-[14px]">
                Bahan
                <br />
                Terselamatkan
              </span>
              <span className="font-bold text-[17px] text-black leading-normal mt-[4px]">
                {impact.savedKg ?? 3.8} Kg
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[59px] w-[2px] flex items-center justify-center mx-[8px]">
            <img alt="" className="h-full w-[2px] object-cover" src={imgLine1} />
          </div>

          {/* Emisi Dicegah */}
          <div className="flex items-center gap-[14px] flex-1 pl-[8px]">
            <div className="bg-[rgba(247,225,126,0.56)] h-[35px] w-[34px] rounded-[12px] flex items-center justify-center shrink-0">
              <img alt="" className="h-[27px] w-[25px] object-contain" src={imgCloud} />
            </div>
            <div className="flex flex-col">
              <span className="font-normal text-[#4b5563] text-[11px] leading-[14px]">
                Emisi Dicegah
              </span>
              <span className="font-bold text-[17px] text-black leading-[20px] mt-[4px]">
                {impact.co2PreventedKg ?? 9.5} Kg
                <br />
                CO₂e
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section - Emergency Alert Card */}
      <div className="px-[26px] mt-[24px]">
        <div
          className="bg-[#fef3c7] border border-[#f59e0b] rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-[16px] w-full relative overflow-hidden"
          data-node-id="16:962"
          data-name="Section - Emergency Alert Card"
        >
          <div className="flex items-center gap-[8px]">
            <img alt="Perhatian" className="h-[20px] w-[29px] object-contain" src={imgError} />
            <span className="font-extrabold text-[#92400e] text-[12px] tracking-[0.55px] uppercase leading-[16.5px]">
              PERHATIAN SEGERA
            </span>
          </div>
          <p className="font-normal text-[#78350f] text-[14px] leading-[20.63px] mt-[10px]">
            {warningItems.length || 2} bahan makanan harus segera dihabiskan dalam 24 jam!
          </p>
          <button
            type="button"
            onClick={() => onOpenRescueRecipe && onOpenRescueRecipe(warningItems)}
            className="bg-[#b45309] hover:bg-[#92400e] transition cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[31px] px-[20px] rounded-full mt-[14px] flex items-center justify-center"
            data-node-id="16:970"
          >
            <span className="font-bold text-[13px] text-white leading-[19.5px]">
              Rescue Masakan
            </span>
          </button>
        </div>
      </div>

      {/* ADD MY STOCK */}
      <div className="px-[28px] mt-[28px]">
        <p className="font-bold text-[#4b5563] text-[12px] tracking-[0.6px] uppercase leading-[18px] pl-[9px]">
          ADD MY STOCK
        </p>

        <div className="grid grid-cols-2 gap-[18px] mt-[10px]">
          {/* Button - Scan AI */}
          <button
            type="button"
            onClick={() => onOpenScan && onOpenScan()}
            className="cursor-pointer h-[116px] rounded-[24px] p-[16px] flex flex-col justify-between text-left shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] active:scale-[0.98] transition"
            style={{
              backgroundImage:
                "linear-gradient(145.22deg, rgb(22, 163, 74) 0%, rgb(11, 102, 35) 100%)"
            }}
            data-node-id="16:973"
            data-name="Button - Scan AI"
          >
            <div className="backdrop-blur-[4px] bg-[rgba(255,255,255,0.2)] rounded-[16px] size-[40px] flex items-center justify-center">
              <img alt="" className="size-[20px]" src={imgScanSvg} />
            </div>
            <div>
              <p className="font-extrabold text-[17px] text-white leading-[21.25px]">Scan AI</p>
              <p className="font-medium text-[12px] text-[rgba(255,255,255,0.85)] leading-[18px]">
                Struk belanja/isi kulkas
              </p>
            </div>
          </button>

          {/* Button - Manual Input */}
          <button
            type="button"
            onClick={() => onOpenManual && onOpenManual("raw")}
            className="bg-white border border-[#cdebd3] cursor-pointer h-[116px] rounded-[24px] p-[16px] flex flex-col justify-between text-left shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] active:scale-[0.98] transition"
            data-node-id="16:984"
            data-name="Button - Manual Input"
          >
            <div className="bg-[#dcfce7] rounded-[16px] size-[40px] flex items-center justify-center">
              <img alt="" className="size-[20px]" src={imgManualSvg} />
            </div>
            <div>
              <p className="font-extrabold text-[#1f2937] text-[17px] leading-[21.25px]">Manual</p>
              <p className="font-medium text-[#4b5563] text-[12px] leading-[18px]">
                Catat stok sendiri
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* DAFTAR BAHAN MAKANAN Header & Category Pills */}
      <div className="px-[26px] mt-[32px]">
        <div className="flex items-center justify-between px-[9px]">
          <span className="font-bold text-[#4b5563] text-[12px] tracking-[0.6px] uppercase leading-[18px]">
            DAFTAR BAHAN MAKANAN
          </span>
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="flex items-center gap-[6px] cursor-pointer"
          >
            <img alt="" className="size-[16px]" src={imgSortSvg} />
            <span className="font-bold text-[#0b6623] text-[12px] leading-[18px]">Urutkan</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-[7px] mt-[14px] overflow-x-auto no-scrollbar px-[4px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`cursor-pointer h-[22px] px-[10px] rounded-full text-[8.5px] whitespace-nowrap transition ${
              selectedCategory === "all"
                ? "bg-[#0b6623] border border-[#0b6623] text-white font-bold"
                : "bg-white border border-[#cdebd3] text-[#4b5563] font-semibold"
            }`}
          >
            Semua ({foods.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("vegetable")}
            className={`cursor-pointer h-[22px] px-[10px] rounded-full text-[8.5px] whitespace-nowrap transition ${
              selectedCategory === "vegetable"
                ? "bg-[#0b6623] border border-[#0b6623] text-white font-bold"
                : "bg-white border border-[#cdebd3] text-[#4b5563] font-semibold"
            }`}
          >
            Sayur &amp; Buah ({vegCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("meat")}
            className={`cursor-pointer h-[22px] px-[10px] rounded-full text-[8.5px] whitespace-nowrap transition ${
              selectedCategory === "meat"
                ? "bg-[#0b6623] border border-[#0b6623] text-white font-bold"
                : "bg-white border border-[#cdebd3] text-[#4b5563] font-semibold"
            }`}
          >
            Lauk Hewani ({meatCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("leftover")}
            className={`cursor-pointer h-[22px] px-[10px] rounded-full text-[8.5px] whitespace-nowrap transition ${
              selectedCategory === "leftover"
                ? "bg-[#0b6623] border border-[#0b6623] text-white font-bold"
                : "bg-white border border-[#cdebd3] text-[#4b5563] font-semibold"
            }`}
          >
            Masakan Sisa ({leftoverCount})
          </button>
        </div>

        {/* Food Cards List */}
        <div className="flex flex-col gap-[18px] mt-[22px]">
          {filteredFoods.map((item) => {
            const isSpoiled = item.status === "spoiled" || Number(item.expiryDays) <= 0;
            const isWarning = !isSpoiled && (item.status === "warning" || Number(item.expiryDays) <= 2);
            const illust = getFoodIllustration(item);

            const borderColor = isSpoiled
              ? "border-[rgba(239,68,68,0.3)]"
              : isWarning
              ? "border-[#fef3c7]"
              : "border-[#cdebd3]";

            return (
              <div
                key={item.id}
                className={`bg-white border ${borderColor} rounded-[30px] p-[16px] flex items-center gap-[16px] w-full min-h-[127px] shadow-[0px_1px_2px_rgba(0,0,0,0.02)]`}
              >
                {/* Thumbnail */}
                {illust.type === "box-yellow" ? (
                  <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[18px] size-[72px] shrink-0 overflow-hidden flex items-center justify-center">
                    <img alt={item.name} className="h-[72px] w-[110px] object-cover" src={illust.src} />
                  </div>
                ) : illust.type === "box-red" ? (
                  <div className="bg-[#fef3c7] border border-[#fecaca] rounded-[18px] size-[72px] shrink-0 overflow-hidden flex items-center justify-center">
                    <img alt={item.name} className="h-[72px] w-[110px] object-cover" src={illust.src} />
                  </div>
                ) : (
                  <div className="border border-[#cdebd3] rounded-[18px] size-[76px] shrink-0 overflow-hidden">
                    <img alt={item.name} className="size-full object-cover" src={illust.src} />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
                  <div className="flex items-center justify-between gap-[6px]">
                    <h3 className="font-bold text-[#1f2937] text-[16px] leading-[24px] truncate">
                      {item.name}
                    </h3>
                    {isSpoiled ? (
                      <div className="bg-[#fee2e2] border border-[#fca5a5] px-[8px] py-[1px] rounded-full shrink-0">
                        <span className="font-bold text-[#991b1b] text-[9px] leading-[15px]">
                          Basi / Lewat Waktu
                        </span>
                      </div>
                    ) : isWarning ? (
                      <div className="bg-[#fef3c7] border border-[#fde68a] px-[10px] py-[1px] rounded-full shrink-0">
                        <span className="font-bold text-[#92400e] text-[9px] leading-[15px]">
                          Tinggal {item.expiryDays} Hari!
                        </span>
                      </div>
                    ) : (
                      <div className="bg-[#cdebd3] border border-[#78c28b] px-[10px] py-[1px] rounded-full shrink-0">
                        <span className="font-bold text-[#0b6623] text-[9px] leading-[15px]">
                          {item.expiryDays} Hari Lagi
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-normal text-[#4b5563] text-[10px] leading-[16px] truncate">
                    {item.categoryLabel || "Sayur segar"} · {item.quantityText || `${item.quantity || 1} ${item.unit || "ikat"}`}
                  </p>

                  {/* Progress Shelf-Life Bar */}
                  <div className="bg-[#e6fbe9] h-[6px] rounded-full w-full overflow-hidden">
                    {isSpoiled ? (
                      <div className="bg-[#ef4444] h-full w-full rounded-full" />
                    ) : isWarning ? (
                      <div
                        className="bg-[#f59e0b] h-full rounded-full"
                        style={{ width: item.expiryDays === 1 ? "80%" : "62%" }}
                      />
                    ) : (
                      <div className="bg-[#0b6623] h-full w-[30%] rounded-full" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isSpoiled ? (
                    <button
                      type="button"
                      onClick={() => onOpenCompostGuide && onOpenCompostGuide(item)}
                      className="bg-gradient-to-r from-[#0b6623] to-[#16cc46] hover:opacity-95 cursor-pointer h-[28px] rounded-[14px] w-full flex items-center justify-center gap-[6px] mt-[2px] transition"
                      data-node-id="19:1305"
                    >
                      <img alt="" className="h-[16px] w-[24px] object-contain" src={imgRecycle} />
                      <span className="font-bold text-[11px] text-white leading-[18px]">
                        Alihkan Ke Kompos
                      </span>
                    </button>
                  ) : isWarning ? (
                    <div className="flex items-center gap-[12px] mt-[2px]">
                      <button
                        type="button"
                        onClick={() => onOpenRescueRecipe && onOpenRescueRecipe([item])}
                        className="bg-[#b45309] hover:bg-[#92400e] cursor-pointer h-[22px] w-[106px] rounded-[14px] flex items-center justify-center transition"
                      >
                        <span className="font-bold text-[10px] text-white leading-[18px]">
                          Rescue Resep
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFood(item.id)}
                        className="bg-white border border-[#cdebd3] hover:bg-gray-50 cursor-pointer h-[22px] w-[76px] rounded-[14px] flex items-center justify-center transition"
                      >
                        <span className="font-semibold text-[#4b5563] text-[10px] leading-[18px]">
                          Habis
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-[12px] mt-[2px]">
                      <button
                        type="button"
                        onClick={() => handleMarkCooked(item.id)}
                        className="bg-[#0b6623] hover:bg-[#09521c] cursor-pointer h-[22px] w-[106px] rounded-[14px] flex items-center justify-center transition"
                      >
                        <span className="font-bold text-[10px] text-white leading-[18px]">
                          Dimasak
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section - Mini Widget: Kompos Aktif */}
      <div className="px-[26px] mt-[24px]">
        <div
          className="bg-[#dcfce7] border border-[#cdebd3] rounded-[24px] p-[16px] w-full flex flex-col gap-[12px]"
          data-node-id="16:1097"
          data-name="Section - Mini Widget: Kompos Aktif"
        >
          <div className="flex items-center gap-[12px]">
            <div className="bg-white rounded-[16px] size-[40px] flex items-center justify-center shrink-0">
              <img alt="" className="h-[26px] w-[31px] object-contain" src={imgLeaf1} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[#1f2937] text-[15px] leading-[18.75px]">
                {activeFillingBatch.title === "Batch #1" ? "Batch Kompos #01" : activeFillingBatch.title}
              </h4>
              <p className="font-normal text-[#4b5563] text-[11px] leading-[18px]">
                Fase Pengisian (Ember A)
              </p>
            </div>
            <span className="font-extrabold text-[#0b6623] text-[24px] tracking-[-0.6px] leading-[36px]">
              {activeFillingBatch.fillPercentage || 60}%
            </span>
          </div>

          <div className="bg-white h-[8px] rounded-full w-full overflow-hidden p-[2px]">
            <div
              className="bg-gradient-to-r from-[#16a34a] to-[#0b6623] h-full rounded-full"
              style={{ width: `${activeFillingBatch.fillPercentage || 60}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("compost")}
            className="flex items-center gap-[4px] cursor-pointer self-start"
          >
            <span className="font-bold text-[#0b6623] text-[11px] leading-[18px]">
              Detail Kompos
            </span>
            <img alt="" className="size-[16px]" src={imgArrowRightSvg} />
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] bg-white h-[71px] border-t border-gray-100 flex items-center justify-between px-[24px] z-40">
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("pantry")}
          className="cursor-pointer flex flex-col gap-[4px] items-center justify-center w-[56px]"
          data-node-id="30:3102"
        >
          <img alt="Pantry" className="size-[32px]" src={imgNavPantryActive} />
          <span className="font-extrabold text-[#0e7a37] text-[10px] tracking-[-0.25px] leading-[15px]">
            Pantry
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("ai")}
          className="cursor-pointer flex flex-col gap-[4px] items-center justify-center w-[56px]"
          data-node-id="30:3107"
        >
          <img alt="Tanya AI" className="h-[26px] w-[32px] object-cover" src={imgChatBubble} />
          <span className="font-bold text-[#4b5563] text-[10px] tracking-[-0.25px] leading-[15px]">
            Tanya AI
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenScan && onOpenScan()}
          className="cursor-pointer flex flex-col items-center -mt-[28px]"
          data-node-id="30:3125"
        >
          <div className="bg-[#0e7a37] border-[3px] border-solid border-white flex items-center justify-center p-[3px] rounded-full size-[56px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <img alt="Scan" className="size-[24px]" src={imgNavCenterScanSvg} />
          </div>
          <span className="font-bold text-[#0e7a37] text-[10px] tracking-[-0.25px] leading-[15px] pt-[2px]">
            Scan
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("compost")}
          className="cursor-pointer flex flex-col gap-[4px] items-center justify-center w-[56px]"
          data-node-id="30:3112"
        >
          <img alt="Kompos" className="size-[24px]" src={imgNavKomposSvg} />
          <span className="font-bold text-[#4b5563] text-[10px] tracking-[-0.25px] leading-[15px]">
            Kompos
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("settings")}
          className="cursor-pointer flex flex-col gap-[4px] items-center justify-center w-[56px]"
          data-node-id="30:3121"
        >
          <img alt="Atur" className="size-[24px]" src={imgNavSettingsSvg} />
          <span className="font-bold text-[#4b5563] text-[10px] tracking-[-0.25px] leading-[15px]">
            Atur
          </span>
        </button>
      </div>
    </div>
  );
}
