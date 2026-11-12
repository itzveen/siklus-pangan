import React, { useState, useEffect } from "react";
import * as store from "../services/storageService.js";
import { generateRescueRecipe } from "../services/geminiService.js";

// Figma Assets for Rescue Resep (31:3285) & Konfirmasi Masakan Selesai (59:518)
import imgBackSvg from "../assets/figma/d20c9.svg";
import imgSparkleSvg from "../assets/figma/14466.svg";
import imgClockSvg from "../assets/figma/a381f.svg";
import imgDifficultySvg from "../assets/figma/4c6d8.svg";
import imgPortionsSvg from "../assets/figma/8d32b.svg";
import imgCheckCircleSvg from "../assets/figma/64562.svg";
import imgLockSvg from "../assets/figma/35e86.svg";
import imgSuccessCheckSvg from "../assets/figma/c4268.svg";

export default function RecipeModal({
  isOpen = true,
  expiringItems = null,
  initialShowSuccess = false,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(initialShowSuccess);
  const [targetItems, setTargetItems] = useState([]);
  const [recipe, setRecipe] = useState({
    introText: "Siap! Bayam Hijau tinggal 1 hari, jadi yuk dimasak sekarang bareng Telur Ayam.",
    title: "Sup Bening Bayam Telur Gurih",
    cookingTimeMinutes: 12,
    difficulty: "Sangat Mudah",
    servings: 2,
    matchedItems: ["Bayam Hijau", "Telur Ayam"],
    additionalIngredients: ["Bumbu dapur dasar (bawang putih, garam, air)"],
    steps: [
      "Rebus air bersama irisan bawang putih hingga mendidih.",
      "Kocok telur, tuang perlahan ke dalam kuah sambil diaduk membentuk serabut.",
      "Masukkan bayam, masak sebentar selama 2 menit, angkat dan sajikan."
    ]
  });

  useEffect(() => {
    setShowSuccessDialog(initialShowSuccess);
  }, [initialShowSuccess]);

  useEffect(() => {
    if (!isOpen) return;

    const allFoods = store.getFoodItems();
    const candidates =
      expiringItems && expiringItems.length > 0
        ? expiringItems
        : allFoods.filter((f) => f.status === "warning" || f.status === "safe").slice(0, 2);

    const resolvedItems =
      candidates.length > 0
        ? candidates
        : [
            { id: "food-1", name: "Bayam Hijau", expiryDays: 1, weightKg: 0.25 },
            { id: "food-2", name: "Telur Ayam", expiryDays: 2, weightKg: 0.5 }
          ];

    setTargetItems(resolvedItems);

    let cancelled = false;
    async function loadRecipe() {
      setLoading(true);
      try {
        const res = await generateRescueRecipe(resolvedItems);
        if (!cancelled && res) {
          setRecipe(res);
          store.addAiHistoryEntry({
            type: "rescue-recipe",
            title: res.title || "Sup Bening Bayam Telur Gurih",
            subtitle: `Bahan kulkas: ${resolvedItems.map((i) => i.name).join(" + ")}`,
            badgeLabel: "Resep",
            badgeColor: "green",
            userPrompt: "Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.",
            autoTags: resolvedItems.map((i) => i.name),
            aiResponse: res
          });
        }
      } catch {
        // Fallback recipe already in state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecipe();
    return () => {
      cancelled = true;
    };
  }, [isOpen, expiringItems]);

  if (!isOpen) return null;

  const handleFinishCooking = () => {
    targetItems.forEach((item) => {
      if (item.id) {
        store.markFoodAsCooked(item.id);
      }
    });
    setShowSuccessDialog(true);
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    if (onSuccess) onSuccess(recipe);
    if (onClose) onClose();
  };

  const matchedTags =
    recipe.matchedItems && recipe.matchedItems.length > 0
      ? recipe.matchedItems
      : targetItems.map((i) => i.name);

  return (
    <div
      className="bg-[#f8fff4] overflow-x-hidden relative rounded-[40px] w-full max-w-[402px] min-h-[980px] mx-auto shadow-xl font-['Poppins',sans-serif] pb-[32px]"
      data-node-id="31:3285"
      data-name="Rescue Resep"
    >
      {/* Header Section */}
      <div
        className="flex gap-[14px] items-center px-[26px] pt-[35px]"
        data-node-id="31:3174"
        data-name="HeaderSection"
      >
        <button
          type="button"
          onClick={onClose}
          className="bg-white border border-[rgba(243,244,246,0.8)] border-solid cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[44px] hover:bg-gray-50 transition"
          data-node-id="31:3175"
          data-name="Button - Kembali"
        >
          <div className="relative shrink-0 size-[20px]">
            <img alt="Kembali" className="block inset-0 max-w-none size-full" src={imgBackSvg} />
          </div>
        </button>
        <div className="flex flex-col gap-px items-start" data-node-id="31:3179">
          <h1 className="font-bold text-[#1a2e21] text-[19px] tracking-[-0.475px] leading-[23.75px]">
            Resep Penyelamat Dapur
          </h1>
          <p className="font-normal text-[#64748b] text-[13px] leading-[16.25px]">
            Dibuat AI dari bahan kritis
          </p>
        </div>
      </div>

      {/* User Prompt Section */}
      <div
        className="flex flex-col items-end px-[26px] mt-[24px]"
        data-node-id="31:3184"
        data-name="UserPromptSection"
      >
        <div
          className="bg-[#0e7f3d] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start max-w-[325px] pl-[16px] pr-[31.5px] py-[16px] rounded-bl-[16px] rounded-br-[16px] rounded-tl-[16px] rounded-tr-[2px]"
          data-node-id="31:3185"
          data-name="Prompt Bubble"
        >
          <p className="font-medium text-[13.5px] text-white leading-[18.9px]">
            Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.
          </p>
        </div>

        {/* Detected Ingredients Tags */}
        <div className="flex flex-wrap gap-[8px] items-center pt-[10px]" data-node-id="31:3188">
          {matchedTags.map((tag, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#bbf7d0] border-solid flex flex-col items-start px-[15px] py-[5px] rounded-[9999px]"
            >
              <span className="font-semibold text-[#146c38] text-[12px] leading-[18px]">
                {tag}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-[4px] pr-[2px]" data-node-id="31:3193">
          <p className="font-normal text-[#6b7280] text-[11.5px] leading-[17.25px]">
            Terkirim otomatis
          </p>
        </div>
      </div>

      {/* AI Response Section */}
      <div
        className="flex gap-[10px] items-start px-[26px] mt-[18px]"
        data-node-id="31:3195"
        data-name="AIResponseSection"
      >
        <div className="flex flex-col h-[36px] items-start pt-[4px] shrink-0 w-[32px]">
          <div className="bg-[#d7f5e4] flex items-center justify-center rounded-[9999px] size-[32px]">
            <div className="relative size-[16px]">
              <img alt="AI" className="block size-full" src={imgSparkleSvg} />
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-[#dcf2e4] border-solid drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-1 flex-col gap-[14px] items-start min-w-0 pb-[17px] pt-[16px] px-[17px] rounded-[24px]"
          data-node-id="31:3200"
          data-name="Response Content Wrapper"
        >
          {/* AI Introductory Text */}
          <p className="font-normal text-[#2c3e35] text-[13.5px] leading-[18.56px]">
            {loading ? "Sedang meracik resep penyelamat terbaik untukmu..." : recipe.introText}
          </p>

          {/* Recipe Inner Card */}
          <div
            className="bg-[#f8fdf9] border border-[#e1f5e8] border-solid rounded-[16px] w-full p-[17px] flex flex-col gap-[10px]"
            data-node-id="31:3203"
            data-name="RecipeInnerCard"
          >
            <h2 className="font-bold text-[#14281d] text-[16px] tracking-[-0.4px] leading-[22px]">
              {recipe.title}
            </h2>

            {/* Meta Information: Time, Difficulty, Servings */}
            <div className="flex flex-col gap-[6px] w-full" data-node-id="31:3206">
              <div className="flex items-center gap-[18px]">
                <div className="flex gap-[4px] items-center">
                  <img alt="" className="size-[14px]" src={imgClockSvg} />
                  <span className="font-medium text-[#4b5563] text-[11.5px] leading-[17.25px]">
                    {recipe.cookingTimeMinutes || 12} Menit
                  </span>
                </div>
                <div className="flex gap-[4px] items-center">
                  <img alt="" className="size-[12px]" src={imgDifficultySvg} />
                  <span className="font-medium text-[#4b5563] text-[11.5px] leading-[17.25px]">
                    {recipe.difficulty || "Sangat Mudah"}
                  </span>
                </div>
              </div>
              <div className="flex gap-[4px] items-center">
                <img alt="" className="size-[14px]" src={imgPortionsSvg} />
                <span className="font-medium text-[#4b5563] text-[11.5px] leading-[17.25px]">
                  {recipe.servings || 2} Porsi
                </span>
              </div>
            </div>

            {/* Ingredients Header */}
            <div className="pt-[6px] w-full">
              <p className="font-bold text-[#6b7280] text-[11px] tracking-[0.55px] uppercase leading-[16.5px]">
                BAHAN
              </p>
            </div>

            {/* Ingredients List */}
            <div className="flex flex-col gap-[10px] w-full" data-node-id="31:3226">
              {matchedTags.map((itemName, index) => (
                <div key={index} className="flex items-center justify-between w-full">
                  <div className="flex gap-[8px] items-center">
                    <div className="bg-[#1aa053] flex items-center justify-center rounded-[9999px] size-[16px] shrink-0">
                      <img alt="" className="size-[10px]" src={imgCheckCircleSvg} />
                    </div>
                    <span className="font-medium text-[#263238] text-[12.5px] leading-[18.75px]">
                      {itemName}
                    </span>
                  </div>
                  <div className="bg-[#d4f3e2] px-[10px] py-[2px] rounded-[9999px] shrink-0">
                    <span className="font-semibold text-[#1b663e] text-[10px] leading-[15px]">
                      dari kulkasmu
                    </span>
                  </div>
                </div>
              ))}

              {(recipe.additionalIngredients || ["Bumbu dapur dasar (bawang putih, garam, air)"]).map(
                (extra, index) => (
                  <div key={`extra-${index}`} className="flex gap-[8px] items-start pt-[2px] w-full">
                    <div className="pt-[2px] shrink-0">
                      <div className="bg-[#1aa053] flex items-center justify-center rounded-[9999px] size-[16px]">
                        <img alt="" className="size-[10px]" src={imgCheckCircleSvg} />
                      </div>
                    </div>
                    <p className="font-normal text-[#263238] text-[12.5px] leading-[17.19px]">
                      {extra}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Cooking Steps Header */}
            <div className="pt-[10px] w-full">
              <p className="font-bold text-[#6b7280] text-[11px] tracking-[0.55px] uppercase leading-[16.5px]">
                {(recipe.steps || []).length} LANGKAH MEMASAK
              </p>
            </div>

            {/* Cooking Steps List */}
            <div className="flex flex-col gap-[12px] w-full" data-node-id="31:3254">
              {(recipe.steps || []).map((stepText, idx) => (
                <div key={idx} className="flex gap-[10px] items-start w-full">
                  <div className="pt-[2px] shrink-0">
                    <div className="bg-[#d4f3e2] flex items-center justify-center rounded-[9999px] size-[20px]">
                      <span className="font-bold text-[#146c38] text-[11px] leading-[17.88px]">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <p className="font-normal text-[#263238] text-[12.5px] leading-[20.31px] flex-1">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Section */}
      <div className="px-[26px] mt-[24px] flex flex-col items-center gap-[14px]">
        <div
          className="flex gap-[6px] items-center justify-center"
          data-node-id="31:3274"
          data-name="Read-Only Notice"
        >
          <img alt="" className="size-[14px]" src={imgLockSvg} />
          <span className="font-normal text-[#6b7280] text-[11.5px] leading-[17.25px]">
            Balasan AI ini tidak bisa dibalas lagi
          </span>
        </div>

        <button
          type="button"
          onClick={handleFinishCooking}
          className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center px-[16px] py-[14px] rounded-[16px] w-full"
          data-node-id="31:3280"
          data-name="Primary Action Button"
        >
          <span className="font-semibold text-[15px] text-center text-white leading-[22.5px]">
            Masakan Selesai &amp; Dihabiskan
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer flex items-center justify-center pb-[4px]"
          data-node-id="31:3282"
          data-name="Secondary Action Button"
        >
          <span className="font-bold text-[#1f2937] text-[14px] text-center leading-[21px]">
            Batal
          </span>
        </button>
      </div>

      {/* Confirmation Dialog Overlay (Figma Frame 59:518) */}
      {showSuccessDialog && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(16,39,29,0.5)] rounded-[40px] p-[26px]"
          data-node-id="59:519"
          data-name="Lapisan konfirmasi"
        >
          <div
            className="bg-[#fffef8] flex flex-col gap-[20px] items-center p-[24px] rounded-[28px] shadow-[0px_16px_48px_0px_rgba(7,28,36,0.2)] w-full max-w-[350px]"
            data-node-id="59:520"
            data-name="Dialog sukses"
          >
            <div
              className="bg-[#d7f5e4] flex items-center justify-center rounded-[999px] size-[60px]"
              data-node-id="59:521"
            >
              <div className="relative size-[30px] flex items-center justify-center">
                <img alt="Berhasil" className="size-[24px]" src={imgSuccessCheckSvg} />
              </div>
            </div>

            <div className="flex flex-col gap-[12px] items-center text-center w-full" data-node-id="59:523">
              <p className="font-bold text-[#1a2e21] text-[22px] tracking-[-0.4px] leading-[29px]">
                Berhasil!
              </p>
              <p className="font-semibold text-[#0e7f3d] text-[14px] leading-[21px] max-w-[220px]">
                {recipe.title}
              </p>
              <p className="font-normal text-[#637269] text-[13.5px] leading-[21px]">
                Hidangan sudah dicatat selesai dan dihabiskan. Terima kasih!
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccessDialog}
              className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer flex h-[52px] items-center justify-center rounded-[16px] w-full"
              data-node-id="59:528"
              data-name="Tutup"
            >
              <span className="font-semibold text-[14px] text-white">Tutup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
