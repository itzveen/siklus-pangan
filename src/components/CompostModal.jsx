import React, { useState, useEffect } from "react";
import { fetchFromBackend } from "../config/api.js";

// Figma Assets for Alih ke kompos (32:3286) & Konfirmasi simpan ke wadah kompos (61:514)
import imgBackSvg from "../assets/figma/4d9b8.svg";
import imgLockFooterSvg from "../assets/figma/af4a0.svg";
import imgSparkleSvg from "../assets/figma/a9580.svg";
import imgWarningSvg from "../assets/figma/95872.svg";
import imgLockedBatchSvg from "../assets/figma/a4d63.svg";
import imgSproutDialogSvg from "../assets/figma/8bfaf.svg";

export default function CompostModal({
  isOpen = true,
  foodItem = null,
  initialShowSuccess = false,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(initialShowSuccess);
  const [targetFood, setTargetFood] = useState(
    foodItem || {
      id: "",
      name: "",
      status: "spoiled",
      weightKg: 0.3
    }
  );
  const [batches, setBatches] = useState([]);
  const [selectedBatchOption, setSelectedBatchOption] = useState("active");
  const [savedBatchLabel, setSavedBatchLabel] = useState("");
  const [analysis, setAnalysis] = useState({
    wasteType: "",
    recommendedMethod: "",
    why: "",
    safetyWarning: "",
    steps: [],
    estimatedDays: 14
  });

  useEffect(() => {
    setShowSuccessDialog(initialShowSuccess);
  }, [initialShowSuccess]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function loadCompostGuide() {
      setLoading(true);
      try {
        // Ambil bahan basi & batch kompos langsung dari Backend
        let resolvedFood = foodItem;
        if (!resolvedFood || !resolvedFood.name) {
          const foodsRes = await fetchFromBackend("/foods");
          const beFoods = foodsRes?.foods || foodsRes?.data?.foods || [];
          resolvedFood = beFoods.find((f) => f.status === "spoiled") || beFoods[0] || {
            id: "",
            name: "Bahan Makanan",
            status: "spoiled",
            weightKg: 0.3
          };
        }
        if (!cancelled) {
          setTargetFood(resolvedFood);
        }

        const profileRes = await fetchFromBackend("/profile").catch(() => null);
        const householdType = profileRes?.householdType || "house";

        // Hit Backend API POST /api/ai/compost-guide
        const apiRes = await fetchFromBackend("/ai/compost-guide", {
          method: "POST",
          body: JSON.stringify({
            foodName: resolvedFood.name,
            householdType
          })
        });
        const guideData = apiRes?.guide || apiRes?.data || apiRes?.analysis || apiRes;
        if (Array.isArray(apiRes?.availableBatches)) {
          setBatches(apiRes.availableBatches);
          const hasFilling = apiRes.availableBatches.some((b) => b.stage === "filling");
          setSelectedBatchOption(hasFilling ? "active" : "new");
        }
        if (!cancelled && guideData?.steps) {
          setAnalysis(guideData);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback jika API gagal
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCompostGuide();
    return () => {
      cancelled = true;
    };
  }, [isOpen, foodItem]);

  if (!isOpen) return null;

  const activeFillingBatch = batches.find((b) => b.stage === "filling");
  const curingBatches = batches.filter((b) => b.stage === "curing");

  const handleSaveToCompost = async () => {
    if (selectedBatchOption === "active" && activeFillingBatch) {
      const label = `${activeFillingBatch.title} (${activeFillingBatch.subtitle || "Wadah Dapur"})`;
      setSavedBatchLabel(label);
      try {
        const apiRes = await fetchFromBackend("/compost/add-item", {
          method: "POST",
          body: JSON.stringify({
            foodId: targetFood.id,
            foodName: targetFood.name,
            weightKg: targetFood.weightKg || 0.3,
            batchId: activeFillingBatch.id,
            option: "existing"
          })
        });
        if (apiRes?.batch) {
          setSavedBatchLabel(`${apiRes.batch.title} (${apiRes.batch.subtitle || "Wadah Dapur"})`);
        }
      } catch {
        // Abaikan jika offline
      }
    } else {
      const nextNum = batches.length + 1;
      const newTitle = `Batch #${nextNum}`;
      setSavedBatchLabel(`${newTitle} (Wadah Dapur Baru)`);
      try {
        const apiRes = await fetchFromBackend("/compost/add-item", {
          method: "POST",
          body: JSON.stringify({
            foodId: targetFood.id,
            foodName: targetFood.name,
            weightKg: targetFood.weightKg || 0.3,
            option: "new"
          })
        });
        if (apiRes?.batch) {
          setSavedBatchLabel(`${apiRes.batch.title} (${apiRes.batch.subtitle || "Wadah Dapur Baru"})`);
        }
      } catch {
        // Abaikan jika offline
      }
    }
    setShowSuccessDialog(true);
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    if (onSuccess) onSuccess(targetFood, savedBatchLabel);
    if (onClose) onClose();
  };

  return (
    <div
      className="bg-[#f8fff4] overflow-x-hidden relative w-full max-w-[402px] min-h-screen mx-auto font-['Poppins',sans-serif] pb-[28px]"
      data-node-id="32:3286"
      data-name="Alih ke kompos"
    >
      {/* Header Section */}
      <div className="flex items-center gap-[12px] px-[21px] pt-[32px]">
        <button
          type="button"
          onClick={onClose}
          className="bg-white border border-[#f3f4f6] border-solid cursor-pointer drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center p-px rounded-[9999px] size-[44px] shrink-0 hover:bg-gray-50 transition"
          data-node-id="32:3400"
          data-name="Button - Kembali"
        >
          <div className="relative shrink-0 size-[20px]">
            <img alt="Kembali" className="block size-full" src={imgBackSvg} />
          </div>
        </button>

        <div className="flex flex-col items-start" data-node-id="32:3403">
          <h1 className="font-bold text-[#0f172a] text-[17px] leading-[21.25px]">
            Alihkan ke Kompos
          </h1>
          <p className="font-medium text-[#64748b] text-[12px] tracking-[-0.3px] leading-[18px]">
            {targetFood.name} · Basi / Lewat Waktu
          </p>
        </div>
      </div>

      {/* User Message Section */}
      <div
        className="flex flex-col items-end px-[21px] mt-[24px]"
        data-node-id="32:3409"
        data-name="UserMessageSection"
      >
        <div
          className="bg-[#0e7f3d] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start max-w-[310px] pb-[14.285px] pl-[14px] pr-[38.12px] pt-[13.095px] rounded-bl-[16px] rounded-br-[16px] rounded-tl-[16px] rounded-tr-[2px]"
          data-node-id="32:3410"
          data-name="Chat Bubble"
        >
          <p className="font-medium text-[13px] text-white leading-[18.2px]">
            {targetFood.name} ku sudah basi. Gimana cara mengolahnya jadi kompos?
          </p>
        </div>

        <div className="pt-[8px]" data-node-id="32:3412">
          <div className="bg-white border border-[#e5e7eb] border-solid flex items-start px-[13px] py-[5px] rounded-[9999px]">
            <span className="font-semibold text-[#147a3e] text-[11px] leading-[16.5px]">
              {targetFood.name}
            </span>
          </div>
        </div>

        <div className="pr-[2px] pt-[4px]" data-node-id="32:3415">
          <p className="font-medium text-[#94a3b8] text-[10px] leading-[15px]">
            Terkirim otomatis
          </p>
        </div>
      </div>

      {/* AI Response Section */}
      <div className="flex gap-[10px] items-start px-[21px] mt-[16px]">
        <div className="pt-[2px] shrink-0" data-node-id="32:3430">
          <div className="bg-[#d7f7de] flex items-center justify-center rounded-[9999px] size-[32px]">
            <img alt="AI" className="size-[16px]" src={imgSparkleSvg} />
          </div>
        </div>

        {/* Main White Response Card */}
        <div
          className="bg-white border border-[#e2ece2] border-solid drop-shadow-[0px_2px_6px_rgba(0,0,0,0.03)] flex flex-1 flex-col gap-[14px] items-start min-w-0 p-[17px] rounded-[24px]"
          data-node-id="32:3435"
          data-name="Main White Response Card"
        >
          {/* Warning / Hazard Alert Box */}
          <div
            className="bg-[#fee8e8] border border-[#fca5a5] border-solid rounded-[12px] w-full p-[13px] flex gap-[8px] items-start"
            data-node-id="32:3436"
            data-name="Warning / Hazard Alert Box"
          >
            <div className="pt-[2px] shrink-0">
              <img alt="Peringatan" className="size-[16px]" src={imgWarningSvg} />
            </div>
            <p className="font-bold text-[#991b1b] text-[11px] leading-[14.85px]">
              {analysis.safetyWarning ||
                "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan pupuk."}
            </p>
          </div>

          {/* Description Paragraph */}
          <p
            className="font-normal text-[#334155] text-[12px] leading-[19.5px] w-full"
            data-node-id="32:3442"
          >
            {loading ? "Sedang menganalisis kandungan organik bahan..." : analysis.why}
          </p>

          {/* Recommendation Banner */}
          <div
            className="bg-[#dcfce7] rounded-[12px] w-full px-[14px] py-[9.5px]"
            data-node-id="32:3444"
            data-name="Recommendation Banner"
          >
            <p className="font-bold text-[#147a3e] text-[11.5px] leading-[15.81px]">
              Rekomendasi: {analysis.recommendedMethod || "Kompos Padat Wadah / Pupuk Organik Cair"}
            </p>
          </div>

          {/* Guide Steps Section */}
          <div className="flex flex-col gap-[8px] items-start pt-[2px] w-full" data-node-id="32:3448">
            <p className="font-bold text-[#64748b] text-[10.5px] tracking-[0.525px] uppercase leading-[15.75px]">
              PANDUAN {(analysis.steps || []).length} LANGKAH
            </p>

            {(analysis.steps || []).map((stepText, idx) => (
              <div key={idx} className="flex gap-[10px] items-start w-full">
                <div className="pt-[2px] shrink-0">
                  <div className="bg-[#dcfce7] flex items-center justify-center rounded-[9999px] size-[20px]">
                    <span className="font-bold text-[#147a3e] text-[10.5px] leading-[15.75px]">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <p className="font-normal text-[#334155] text-[11.5px] leading-[15.81px] flex-1">
                  {stepText}
                </p>
              </div>
            ))}
          </div>

          {/* Compost Batch Selection */}
          <div className="flex flex-col gap-[8px] items-start pt-[4px] w-full" data-node-id="32:3468">
            <p className="font-bold text-[#64748b] text-[10.5px] tracking-[0.525px] uppercase leading-[15.75px]">
              PILIH BATCH KOMPOS
            </p>

            {/* Option 1: Active Filling Batch */}
            {activeFillingBatch && (
              <button
                type="button"
                onClick={() => setSelectedBatchOption("active")}
                className={`w-full text-left cursor-pointer flex gap-[12px] items-center p-[13px] rounded-[16px] border border-solid transition ${
                  selectedBatchOption === "active"
                    ? "bg-[#e6fbe9] border-[#16a34a]"
                    : "bg-white border-[#e5e7eb]"
                }`}
                data-node-id="32:3471"
              >
                <div
                  className={`rounded-[9999px] shrink-0 size-[16px] flex items-center justify-center ${
                    selectedBatchOption === "active"
                      ? "border-2 border-[#16a34a]"
                      : "border border-[#9ca3af]"
                  }`}
                >
                  {selectedBatchOption === "active" && (
                    <div className="bg-[#16a34a] rounded-[9999px] size-[8px]" />
                  )}
                </div>
                <p
                  className={`${
                    selectedBatchOption === "active" ? "font-semibold" : "font-medium"
                  } text-[#1e293b] text-[11.5px] leading-[14.38px]`}
                >
                  Tambahkan ke {activeFillingBatch.title} (
                  {activeFillingBatch.subtitle || "Wadah Dapur"}) yang sedang berjalan
                </p>
              </button>
            )}

            {/* Option 2: New Batch */}
            <button
              type="button"
              onClick={() => setSelectedBatchOption("new")}
              className={`w-full text-left cursor-pointer flex gap-[12px] items-center p-[13px] rounded-[16px] border border-solid transition ${
                selectedBatchOption === "new"
                  ? "bg-[#e6fbe9] border-[#16a34a]"
                  : "bg-white border-[#e5e7eb]"
              }`}
              data-node-id="32:3476"
            >
              <div
                className={`rounded-[9999px] shrink-0 size-[16px] flex items-center justify-center ${
                  selectedBatchOption === "new"
                    ? "border-2 border-[#16a34a]"
                    : "border border-[#9ca3af]"
                }`}
              >
                {selectedBatchOption === "new" && (
                  <div className="bg-[#16a34a] rounded-[9999px] size-[8px]" />
                )}
              </div>
              <p
                className={`${
                  selectedBatchOption === "new" ? "font-semibold" : "font-medium"
                } text-[#1e293b] text-[11.5px] leading-[14.38px]`}
              >
                Buka Wadah / Batch Kompos Baru
              </p>
            </button>

            {/* Option 3: Locked Batch Info */}
            {curingBatches.map((lockedBatch) => (
              <div
                key={lockedBatch.id}
                className="bg-[#eef2f6] flex gap-[8px] items-start p-[10px] rounded-[12px] w-full"
                data-node-id="32:3480"
              >
                <div className="pt-[2px] shrink-0">
                  <img alt="" className="size-[14px]" src={imgLockedBatchSvg} />
                </div>
                <p className="font-normal text-[#475569] text-[10.5px] leading-[14.44px]">
                  {lockedBatch.title} sedang fase pematangan (tidak boleh ditambah sampai panen).
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Bottom Action Area */}
      <div
        className="flex flex-col items-center gap-[12px] px-[21px] pt-[16px] mt-[8px]"
        data-node-id="32:3417"
        data-name="Footer - BottomActionArea"
      >
        <div className="flex gap-[6px] items-center justify-center" data-node-id="32:3419">
          <img alt="" className="size-[12px]" src={imgLockFooterSvg} />
          <span className="font-medium text-[#475569] text-[11px] leading-[16.5px]">
            Balasan AI ini tidak bisa dibalas lagi
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveToCompost}
          className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center px-[16px] py-[14px] rounded-[16px] w-full"
          data-node-id="32:3424"
          data-name="Main Action Submit Button"
        >
          <span className="font-bold text-[14px] text-center text-white leading-[21px]">
            Simpan ke Wadah Kompos
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer flex items-center justify-center pb-[4px] pt-[2px]"
          data-node-id="32:3426"
          data-name="Cancel Button"
        >
          <span className="font-bold text-[#1e293b] text-[13px] text-center leading-[19.5px]">
            Batal
          </span>
        </button>
      </div>

      {/* Confirmation Dialog Overlay (Figma Frame 61:514) */}
      {showSuccessDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-[24px]"
          data-node-id="61:515"
          data-name="Lapisan konfirmasi"
        >
          <div
            className="bg-white flex flex-col gap-[24px] items-center p-[24px] rounded-[24px] shadow-[0px_12px_40px_0px_rgba(15,41,28,0.15)] w-full max-w-[354px]"
            data-node-id="61:516"
            data-name="Dialog konfirmasi"
          >
            <div className="flex flex-col gap-[16px] items-center w-full" data-node-id="61:517">
              <div
                className="bg-[#dcfce7] flex items-center justify-center rounded-[999px] size-[64px]"
                data-node-id="61:518"
              >
                <img alt="Kompos" className="size-[30px]" src={imgSproutDialogSvg} />
              </div>

              <div className="flex flex-col gap-[8px] items-center text-center w-full" data-node-id="61:520">
                <p className="font-bold text-[#0f172a] text-[20px] leading-[28px]">
                  Berhasil disimpan!
                </p>
                <p className="font-normal text-[#475569] text-[13px] leading-[21px]">
                  {targetFood.name} berhasil disimpan ke {savedBatchLabel}. Penyimpanan ke wadah kompos selesai.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccessDialog}
              className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer flex h-[49px] items-center justify-center rounded-[16px] w-full"
              data-node-id="61:524"
              data-name="Tutup"
            >
              <span className="font-bold text-[14px] text-white leading-[21px]">Tutup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
