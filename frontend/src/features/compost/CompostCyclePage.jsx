import React, { useState, useEffect } from "react";
import { fetchFromBackend } from "../../config/api.js";
import BrandLogo from "../../shared/components/BrandLogo.jsx";

// Figma Assets for Siklus Kompos (32:3581)
import imgHarvestBoxIcon from "../../assets/figma/b1eb8.svg";
import imgChevronDown from "../../assets/figma/efb9e.svg";

// Figma Assets for Panen Kompos (45:1108) & Panen Berhasil Dicatat (62:75)
import imgCompostHeap from "../../assets/figma/5c2ff.png";
import imgHarvestBack from "../../assets/figma/c5d53.svg";
import imgMinusIcon from "../../assets/figma/50249.svg";
import imgPlusIcon from "../../assets/figma/d719b.svg";
import imgHarvestSuccessCheck from "../../assets/figma/4f3f3.svg";

// Figma Assets for Detail Riwayat Panen (55:63)
import imgDetailBack from "../../assets/figma/7e07e.svg";
import imgDetailStatusCheck from "../../assets/figma/73b40.svg";
import imgDetailHarvestSymbol from "../../assets/figma/af096.svg";
import imgDetailCalendar from "../../assets/figma/f78d2.svg";
import imgDetailSprout from "../../assets/figma/9d7e9.svg";
import imgDetailArchive from "../../assets/figma/0f57c.svg";
import imgDetailCircleCheck from "../../assets/figma/21f64.svg";
import imgDetailBackGreen from "../../assets/figma/bae43.svg";

const getMethodRules = (title = "") => {
  const lower = title.toLowerCase();
  if (lower.includes("poc") || lower.includes("cair")) {
    return {
      badge: "POC",
      rule: "Ketentuan POC: Campur sisa organik dengan air cucian beras & sedikit gula merah di wadah tertutup. Buka tutup tiap 2 hari untuk buang gas (±14 hari)."
    };
  }
  if (lower.includes("eco") || lower.includes("enzyme") || lower.includes("enzim")) {
    return {
      badge: "Eco-Enzyme",
      rule: "Ketentuan Eco-Enzyme: Perbandingan 1 gula merah : 3 sisa organik : 10 air dalam botol kedap udara. Buka tutup sebentar di minggu awal agar gas keluar."
    };
  }
  if (lower.includes("bokashi")) {
    return {
      badge: "Bokashi",
      rule: "Ketentuan Bokashi: Taburkan starter EM4/dedak secara berlapis dan tutup ember rapat agar fermentasi bebas bau."
    };
  }
  return {
    badge: "Kompos",
    rule: "Ketentuan Kompos: Seimbangkan bahan basah & bahan cokelat (daun kering/sekam 1:2) dan jaga tetap lembap tapi tidak tergenang."
  };
};

export default function CompostPage({
  initialView = "cycle",
  onNavigateTab,
  onOpenScan,
  onDataUpdated
}) {
  const [subView, setSubView] = useState(
    initialView === "harvest-success" ? "harvest" : initialView
  );
  const [showHarvestSuccessModal, setShowHarvestSuccessModal] = useState(
    initialView === "harvest-success"
  );
  const [batches, setBatches] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [expandedHarvestId, setExpandedHarvestId] = useState("batch-0");
  const [selectedBatchForHarvest, setSelectedBatchForHarvest] = useState(null);
  const [harvestWeight, setHarvestWeight] = useState(3.5);
  const [selectedHarvestDetail, setSelectedHarvestDetail] = useState(null);
  const [showAddSpoiledModal, setShowAddSpoiledModal] = useState(false);
  const [spoiledFoodName, setSpoiledFoodName] = useState("");
  const [spoiledWeightKg, setSpoiledWeightKg] = useState("0.3");
  const [selectedProcessMethod, setSelectedProcessMethod] = useState("Pupuk Organik Cair (POC)");
  const [selectedTargetBatchId, setSelectedTargetBatchId] = useState("new");
  const [isSubmittingSpoiled, setIsSubmittingSpoiled] = useState(false);

  const findMatchingFillingBatch = (methodLabel, batchList = batches) => {
    const filling = batchList.filter((b) => b.stage === "filling");
    const m = methodLabel.toLowerCase();
    return filling.find((b) => {
      const text = `${b.title || ""} ${b.method || ""}`.toLowerCase();
      if (m.includes("eco-enzyme")) return text.includes("eco-enzyme") || text.includes("eco enzyme");
      if (m.includes("poc") || m.includes("cair")) return text.includes("poc") || text.includes("organik cair");
      if (m.includes("bokashi")) return text.includes("bokashi");
      return (
        (text.includes("kompos") || text.includes("biopori") || text.includes("takakura") || text.includes("batch")) &&
        !text.includes("eco-enzyme") &&
        !text.includes("poc") &&
        !text.includes("bokashi")
      );
    });
  };

  const refreshData = async () => {
    try {
      // Hit Backend API GET /api/compost/batches secara langsung
      const apiRes = await fetchFromBackend("/compost/batches");
      const activeBatches = apiRes?.activeBatches ?? apiRes?.data?.activeBatches;
      const harvestHistory = apiRes?.harvestHistory ?? apiRes?.data?.harvestHistory;
      if (Array.isArray(activeBatches)) {
        setBatches(activeBatches);
      }
      if (Array.isArray(harvestHistory)) {
        setHarvests(harvestHistory);
        if (harvestHistory.length > 0 && !selectedHarvestDetail) {
          setSelectedHarvestDetail(harvestHistory[0]);
        }
      }
      onDataUpdated?.();
    } catch {
      setBatches([]);
      setHarvests([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (initialView === "harvest-success") {
      setSubView("harvest");
      setShowHarvestSuccessModal(true);
    } else {
      setSubView(initialView);
      setShowHarvestSuccessModal(false);
    }
  }, [initialView]);

  const handleLockBatch = async (batchId) => {
    try {
      await fetchFromBackend(`/compost/${batchId}/lock`, { method: "POST" });
      await refreshData();
    } catch {
      // Abaikan jika gagal
    }
  };

  const handleAddDirectSpoiledToCompost = async (e) => {
    e.preventDefault();
    const cleanName = spoiledFoodName.trim();
    if (!cleanName || isSubmittingSpoiled) return;
    setIsSubmittingSpoiled(true);
    try {
      const useExisting =
        selectedTargetBatchId &&
        selectedTargetBatchId !== "new" &&
        batches.some((b) => b.id === selectedTargetBatchId && b.stage === "filling");
      await fetchFromBackend("/compost/add-item", {
        method: "POST",
        body: JSON.stringify({
          foodName: cleanName,
          weightKg: Math.max(0.1, Number(spoiledWeightKg || 0.3)),
          option: useExisting ? "existing" : "new",
          batchId: useExisting ? selectedTargetBatchId : null,
          newBatchTitle: `${selectedProcessMethod} • ${cleanName}`
        })
      });
      setSpoiledFoodName("");
      setSpoiledWeightKg("0.3");
      setShowAddSpoiledModal(false);
      await refreshData();
    } finally {
      setIsSubmittingSpoiled(false);
    }
  };

  const handleFastForwardBatch = async (batch) => {
    try {
      const apiRes = await fetchFromBackend(`/compost/${batch.id}/simulate`, { method: "POST" });
      const updatedBatch = apiRes?.batch || batch;
      await refreshData();
      setSelectedBatchForHarvest(updatedBatch);
      setHarvestWeight(3.5);
      setSubView("harvest");
    } catch {
      setSelectedBatchForHarvest(batch);
      setHarvestWeight(3.5);
      setSubView("harvest");
    }
  };

  const handleRecordHarvest = async () => {
    const targetId = selectedBatchForHarvest?.id || "batch-2";
    try {
      const apiRes = await fetchFromBackend(`/compost/${targetId}/harvest`, {
        method: "POST",
        body: JSON.stringify({ weightKg: harvestWeight })
      });
      await refreshData();
      if (apiRes?.harvest) {
        setSelectedHarvestDetail(apiRes.harvest);
      }
      setShowHarvestSuccessModal(true);
    } catch {
      setShowHarvestSuccessModal(true);
    }
  };

  const handleFinishHarvestModal = () => {
    setShowHarvestSuccessModal(false);
    setSubView("cycle");
  };

  const handleOpenDetail = async (harvestItem) => {
    setSelectedHarvestDetail(harvestItem);
    setSubView("detail");
    try {
      const apiRes = await fetchFromBackend(`/compost/harvests/${harvestItem?.id || "batch-0"}`);
      const detailData = apiRes?.data || apiRes;
      if (detailData?.title) {
        setSelectedHarvestDetail(detailData);
      }
    } catch {
      // Gunakan item yang diklik
    }
  };

  // ============================================================================
  // SUB-VIEW 3: DETAIL RIWAYAT PANEN (Figma Frame 55:63)
  // ============================================================================
  if (subView === "detail") {
    const detail = selectedHarvestDetail ||
      harvests[0] || {
        id: "batch-0",
        title: "Batch #0",
        harvestDate: "28 Okt",
        weightKg: 3.5,
        status: "Selesai",
        logs: [
          { id: "log-h1", item: "Kulit pisang", date: "—" },
          { id: "log-h2", item: "Tahu basi", date: "—" }
        ]
      };

    return (
      <div
        className="bg-[#f8fff4] flex flex-col gap-[16px] items-start overflow-x-hidden px-[26px] pt-[30px] pb-[130px] relative w-full max-w-[402px] min-h-screen mx-auto font-['Poppins',sans-serif]"
        data-node-id="55:63"
        data-name="Detail Riwayat Panen"
      >
        {/* Header dan kembali */}
        <div
          className="flex gap-[12px] items-center pb-[6px] w-full"
          data-node-id="55:64"
          data-name="Header dan kembali"
        >
          <button
            type="button"
            onClick={() => setSubView("cycle")}
            className="bg-white border border-[#dcf0e2] border-solid cursor-pointer flex items-center justify-center rounded-[999px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.02)] shrink-0 size-[44px] hover:bg-gray-50 transition"
            data-node-id="55:65"
            data-name="Kembali"
          >
            <img alt="Kembali" className="size-[20px]" src={imgDetailBack} />
          </button>
          <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0" data-node-id="55:67">
            <h1 className="font-bold leading-[27px] text-[#171717] text-[18px] tracking-[-0.45px] w-full">
              Detail Riwayat Panen
            </h1>
            <p className="font-normal text-[#475569] text-[11px] w-full">Siklus Kompos</p>
          </div>
        </div>

        {/* Ringkasan panen */}
        <div
          className="bg-white border border-[#dcf0e2] border-solid flex flex-col gap-[16px] items-start p-[20px] rounded-[26px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.02)] w-full"
          data-node-id="55:70"
          data-name="Ringkasan panen"
        >
          <div className="flex items-center justify-between w-full" data-node-id="55:71">
            <p className="font-bold text-[#171717] text-[17px]">{detail.title || "Batch #0"}</p>
            <div
              className="bg-[#dcfce7] flex gap-[5px] items-center px-[12px] py-[4px] rounded-[999px]"
              data-node-id="55:73"
            >
              <img alt="" className="size-[12px]" src={imgDetailStatusCheck} />
              <span className="font-bold text-[#15803d] text-[11px]">
                {detail.status || "Selesai"}
              </span>
            </div>
          </div>

          <div
            className="bg-[#dcfce7] flex flex-col gap-[4px] items-start p-[18px] rounded-[18px] w-full"
            data-node-id="55:76"
            data-name="Hasil panen"
          >
            <p className="font-semibold text-[#15803d] text-[11px] w-full">HASIL PANEN</p>
            <div className="flex items-center justify-between w-full" data-node-id="55:78">
              <p className="font-bold text-[#0e7f3d] tracking-[-1.2px]">
                <span className="leading-[55px] text-[42px]">{detail.weightKg ?? 3.5}</span>
                <span className="leading-[55px] text-[21px]"> kg</span>
              </p>
              <div className="relative shrink-0 size-[50px]" data-node-id="55:80">
                <img alt="" className="block size-full" src={imgDetailHarvestSymbol} />
              </div>
            </div>
            <p className="font-medium text-[#15803d] text-[12.5px] w-full">
              Pupuk organik siap pakai
            </p>
          </div>

          <div className="flex gap-[8px] items-center w-full" data-node-id="55:83">
            <img alt="" className="size-[16px]" src={imgDetailCalendar} />
            <p className="font-normal text-[#475569] text-[12.5px]">Tanggal panen</p>
            <p className="flex-1 font-semibold text-[#171717] text-[13px] text-right">
              {detail.harvestDate || "28 Okt"}
            </p>
          </div>
        </div>

        {/* Riwayat bahan */}
        <div
          className="bg-white border border-[#dcf0e2] border-solid flex flex-col gap-[8px] items-start p-[20px] rounded-[26px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.02)] w-full"
          data-node-id="55:87"
          data-name="Riwayat bahan"
        >
          <p className="font-bold text-[#171717] text-[14.5px] w-full">Riwayat bahan</p>
          <div
            className="flex font-semibold items-start justify-between pt-[4px] text-[#64748b] text-[10px] tracking-[0.4px] w-full"
            data-node-id="55:89"
          >
            <span>BAHAN</span>
            <span>TANGGAL MASUK</span>
          </div>

          <div className="flex flex-col items-start w-full" data-node-id="55:92">
            {(
              detail.logs || [
                { id: "log-h1", item: "Kulit pisang", date: "—" },
                { id: "log-h2", item: "Tahu basi", date: "—" }
              ]
            ).map((log, idx, arr) => (
              <React.Fragment key={log.id || idx}>
                <div className="flex font-normal items-center justify-between py-[9px] text-[13px] w-full">
                  <span className="text-[#475569]">{log.item}</span>
                  <span className="text-[#64748b]">{log.date || "—"}</span>
                </div>
                {idx < arr.length - 1 && <div className="bg-[#e7f0e8] h-px w-full" />}
              </React.Fragment>
            ))}
          </div>

          <p className="font-normal leading-[17px] text-[#64748b] text-[11px] w-full">
            Tanggal masuk belum diketahui.
          </p>
        </div>

        {/* Panduan pemakaian */}
        <div
          className="bg-white border border-[#dcf0e2] border-solid flex flex-col gap-[16px] items-start p-[20px] rounded-[26px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.02)] w-full"
          data-node-id="55:101"
          data-name="Panduan pemakaian"
        >
          <p className="font-bold text-[#171717] text-[14.5px] w-full">Panduan pemakaian</p>

          <div className="flex gap-[12px] items-start w-full" data-node-id="55:103">
            <div className="bg-[#dcfce7] flex items-center justify-center rounded-[14px] shrink-0 size-[34px]">
              <img alt="" className="size-[18px]" src={imgDetailSprout} />
            </div>
            <div className="flex flex-1 flex-col gap-[4px] items-start min-w-0">
              <p className="font-semibold leading-[19.5px] text-[#171717] text-[13px] w-full">
                Nutrisi untuk tanaman
              </p>
              <p className="font-normal leading-[20px] text-[#475569] text-[12.5px] w-full">
                Taburkan tipis di sekitar tanaman atau campur ke media tanam.
              </p>
            </div>
          </div>

          <div className="flex gap-[12px] items-start w-full" data-node-id="55:109">
            <div className="bg-[#dcfce7] flex items-center justify-center rounded-[14px] shrink-0 size-[34px]">
              <img alt="" className="size-[18px]" src={imgDetailArchive} />
            </div>
            <div className="flex flex-1 flex-col gap-[4px] items-start min-w-0">
              <p className="font-semibold leading-[19.5px] text-[#171717] text-[13px] w-full">
                Simpan sisanya
              </p>
              <p className="font-normal leading-[20px] text-[#475569] text-[12.5px] w-full">
                Simpan di wadah kering dan tertutup.
              </p>
            </div>
          </div>
        </div>

        {/* Navigasi kembali */}
        <div
          className="flex flex-col gap-[12px] items-center pt-[2px] w-full"
          data-node-id="55:115"
          data-name="Navigasi kembali"
        >
          <div className="flex gap-[6px] items-center" data-node-id="55:116">
            <img alt="" className="size-[14px]" src={imgDetailCircleCheck} />
            <span className="font-normal text-[#475569] text-[11px]">Panen sudah tercatat.</span>
          </div>

          <button
            type="button"
            onClick={() => setSubView("cycle")}
            className="bg-white border border-[#15803d] border-solid cursor-pointer flex gap-[8px] h-[48px] items-center justify-center rounded-[999px] w-full hover:bg-green-50 transition"
            data-node-id="55:119"
            data-name="Kembali ke Siklus Kompos"
          >
            <img alt="" className="size-[17px]" src={imgDetailBackGreen} />
            <span className="font-bold text-[#15803d] text-[13.5px]">
              Kembali ke Siklus Kompos
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SUB-VIEW 2: PANEN KOMPOS (Figma Frame 45:1108) & DIALOG SUKSES (62:75)
  // ============================================================================
  if (subView === "harvest") {
    const batchTitle = selectedBatchForHarvest?.title || "Batch #2";

    return (
      <div
        className="bg-[#f8fff4] overflow-x-hidden relative w-full max-w-[402px] min-h-screen mx-auto font-['Poppins',sans-serif] px-[21px] py-[30px] flex flex-col justify-between"
        data-node-id="45:1108"
        data-name="Panen kompos"
      >
        <div className="flex flex-col gap-[16px]">
          {/* Header */}
          <div className="flex items-center py-[4px]" data-node-id="45:1045" data-name="Header">
            <button
              type="button"
              onClick={() => setSubView("cycle")}
              className="bg-white border border-[#d5e5d5] border-solid cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center p-px rounded-[9999px] shrink-0 size-[44px] hover:bg-gray-50 transition"
              data-node-id="45:1046"
              data-name="Button - Kembali"
            >
              <img alt="Kembali" className="size-[20px]" src={imgHarvestBack} />
            </button>
            <div className="flex flex-col items-start pl-[14px]" data-node-id="45:1050">
              <h1 className="font-bold text-[#1a2421] text-[19px] tracking-[-0.475px] leading-[23.75px]">
                Panen Kompos
              </h1>
              <p className="font-medium text-[#586761] text-[12.5px] leading-[18.75px]">
                {batchTitle} · Fase Pematangan
              </p>
            </div>
          </div>

          {/* Section - CelebrationCard */}
          <div
            className="bg-[#dcfce7] flex flex-col items-center px-[24px] py-[28px] rounded-[28px] w-full"
            data-node-id="45:1056"
            data-name="Section - CelebrationCard"
          >
            <div className="pb-[16px]">
              <div
                className="bg-[#0e7f3d] relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[66px] flex items-center justify-center"
                data-node-id="45:1058"
              >
                <img
                  alt="Compost Heap"
                  className="h-[50px] w-[38px] object-contain pointer-events-none"
                  src={imgCompostHeap}
                />
              </div>
            </div>

            <div className="flex flex-col items-center max-w-[280px]" data-node-id="45:1062">
              <h2 className="font-extrabold text-[#0d682a] text-[20px] text-center tracking-[-0.5px] leading-[26px]">
                Kompos Matang &amp; Siap
                <br />
                Panen Jadi Pupuk!
              </h2>
            </div>

            <div className="pt-[10px] max-w-[270px]" data-node-id="45:1064">
              <p className="font-normal text-[#384c40] text-[13px] text-center leading-[21.13px]">
                14 hari pematangan selesai. Catat hasil panenmu.
              </p>
            </div>
          </div>

          {/* Section - HarvestQuantityCard */}
          <div
            className="bg-white border border-[#deede0] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-[12px] items-start p-[21px] rounded-[24px] w-full"
            data-node-id="45:1068"
            data-name="Section - HarvestQuantityCard"
          >
            <p className="font-bold text-[#4a5d54] text-[12px] tracking-[0.6px] uppercase leading-[18px] w-full">
              HASIL PANEN
            </p>

            <div
              className="flex items-center justify-between px-[4px] w-full"
              data-node-id="45:1071"
              data-name="Counter Control Row"
            >
              <button
                type="button"
                onClick={() =>
                  setHarvestWeight((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))
                }
                className="border border-[#cfdfd3] border-solid cursor-pointer flex items-center justify-center p-px rounded-[9999px] shrink-0 size-[48px] hover:bg-gray-50 transition"
                data-node-id="45:1072"
                data-name="Button - Kurangi jumlah"
              >
                <img alt="Kurangi" className="size-[20px]" src={imgMinusIcon} />
              </button>

              <div className="flex items-baseline gap-[6px]" data-node-id="45:1075">
                <span className="font-extrabold text-[#1f2d27] text-[38px] tracking-[-0.95px] leading-[57px]">
                  {harvestWeight.toFixed(1)}
                </span>
                <span className="font-semibold text-[#4f6358] text-[15px] leading-[22.5px]">
                  Kg
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setHarvestWeight((prev) => Math.round((prev + 0.5) * 10) / 10)
                }
                className="border border-[#cfdfd3] border-solid cursor-pointer flex items-center justify-center p-px rounded-[9999px] shrink-0 size-[48px] hover:bg-gray-50 transition"
                data-node-id="45:1079"
                data-name="Button - Tambah jumlah"
              >
                <img alt="Tambah" className="size-[20px]" src={imgPlusIcon} />
              </button>
            </div>

            <div className="flex flex-col items-center w-full" data-node-id="45:1082">
              <p className="font-normal text-[#55695e] text-[13px] text-center leading-[19.5px]">
                Pupuk organik siap pakai
              </p>
            </div>
          </div>

          {/* Section - HowToUseCard */}
          <div
            className="bg-white border border-[#deede0] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-[16px] items-start p-[21px] rounded-[24px] w-full"
            data-node-id="45:1085"
            data-name="Section - HowToUseCard"
          >
            <p className="font-bold text-[#4a5d54] text-[12px] tracking-[0.6px] uppercase leading-[18px] w-full">
              CARA PAKAI
            </p>

            <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="45:1088">
              <div className="flex items-start gap-[14px] w-full" data-node-id="45:1089">
                <div className="pt-[2px] shrink-0">
                  <div className="bg-[#dcfce7] flex items-center justify-center rounded-[9999px] size-[28px]">
                    <span className="font-bold text-[#0d682a] text-[13px] leading-[19.5px]">1</span>
                  </div>
                </div>
                <p className="font-normal text-[#2b3b33] text-[13px] leading-[18.85px] flex-1">
                  Taburkan tipis di sekitar tanaman, atau campur ke media tanam.
                </p>
              </div>

              <div className="flex items-start gap-[14px] w-full" data-node-id="45:1095">
                <div className="pt-[2px] shrink-0">
                  <div className="bg-[#dcfce7] flex items-center justify-center rounded-[9999px] size-[28px]">
                    <span className="font-bold text-[#0d682a] text-[13px] leading-[19.5px]">2</span>
                  </div>
                </div>
                <p className="font-normal text-[#2b3b33] text-[13px] leading-[18.85px] flex-1">
                  Simpan sisanya di wadah kering dan tertutup.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-[18px] mt-[24px]">
          <button
            type="button"
            onClick={handleRecordHarvest}
            className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex h-[56px] items-center justify-center rounded-[16px] w-full"
            data-node-id="45:1102"
            data-name="Primary Action Button"
          >
            <span className="font-bold text-[16px] text-center text-white leading-[24px]">
              Catat Panen
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("cycle")}
            className="cursor-pointer font-bold text-[#0e7f3d] text-[15px] text-center leading-[22.5px]"
            data-node-id="45:1106"
          >
            Nanti saja
          </button>
        </div>

        {/* Panen Berhasil Dicatat Dialog (Figma Frame 62:75) */}
        {showHarvestSuccessModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,41,31,0.5)] p-[24px]"
            data-node-id="62:75"
            data-name="Panen berhasil dicatat"
          >
            <div
              className="bg-white flex flex-col gap-[24px] items-center p-[24px] rounded-[28px] shadow-[0px_16px_48px_0px_rgba(12,41,31,0.15)] w-full max-w-[350px]"
              data-node-id="62:135"
              data-name="Dialog sukses"
            >
              <div
                className="bg-[#dcfce7] flex items-center justify-center rounded-[999px] size-[64px]"
                data-node-id="62:136"
              >
                <img alt="Berhasil" className="size-[32px]" src={imgHarvestSuccessCheck} />
              </div>

              <div
                className="flex flex-col gap-[8px] items-center text-center w-full"
                data-node-id="62:138"
              >
                <p className="font-bold leading-[28px] text-[#1a2421] text-[20px] tracking-[-0.4px] w-full">
                  Panen berhasil dicatat!
                </p>
                <p className="font-normal leading-[22px] text-[#586761] text-[14px] w-full">
                  Hasil panen komposmu telah tersimpan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinishHarvestModal}
                className="bg-[#0e7f3d] hover:bg-[#0b6831] transition cursor-pointer flex h-[56px] items-center justify-center rounded-[16px] w-full"
                data-node-id="62:141"
                data-name="Selesai"
              >
                <span className="font-bold leading-[24px] text-[16px] text-white">Selesai</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // SUB-VIEW 1: SIKLUS KOMPOS RUMAH TANGGA (Figma Frame 32:3581)
  // ============================================================================
  const fillingBatches = batches.filter((b) => b.stage === "filling");
  const curingOrReadyBatches = batches.filter((b) => b.stage === "curing" || b.stage === "ready");

  return (
    <div
      className="bg-[#f8fff4] overflow-x-hidden relative w-full max-w-[402px] min-h-screen mx-auto font-['Poppins',sans-serif] pb-[100px]"
      data-node-id="32:3581"
      data-name="Siklus Kompos"
    >
      {/* Top App Brand Bar */}
      <div className="px-5 pt-4 pb-4 space-y-4">
        <BrandLogo />
        <div>
          <h1 className="text-[26px] font-extrabold text-[#11231b] tracking-tight leading-tight">
            Zero-Waste Upcycle
          </h1>
          <p className="text-[14px] font-medium text-[#65796c] mt-0.5">
            Pantau POC, Eco-Enzyme &amp; Kompos
          </p>
        </div>
      </div>

      {/* Active Batches List */}
      <div className="flex flex-col gap-[16px] px-5">
        <button
          type="button"
          onClick={() => {
            const matched = findMatchingFillingBatch(selectedProcessMethod);
            setSelectedTargetBatchId(matched ? matched.id : "new");
            setShowAddSpoiledModal(true);
          }}
          className="w-full py-3 px-4 rounded-[18px] bg-[#0e7f3d] hover:bg-[#0b6831] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>+ Catat Bahan ke Upcycle</span>
        </button>

        {batches.length === 0 && (
          <div className="bg-white border border-[#dcf0e2] rounded-[26px] p-[24px] text-center space-y-2">
            <p className="font-bold text-[#171717] text-[15px]">
              Belum Ada Olahan Aktif
            </p>
            <p className="text-[#475569] text-[12.5px] leading-relaxed">
              Punya makanan yang sudah basi atau ingin buat POC / Eco-Enzyme? Tekan tombol di atas atau mulai dari Tanya AI untuk memantaunya di sini.
            </p>
          </div>
        )}

        {/* Stage: Filling Batches (e.g. Batch #1) */}
        {fillingBatches.map((batch) => {
          const methodInfo = getMethodRules(batch.title);
          return (
          <div
            key={batch.id}
            className="bg-white border border-[#dcf0e2] border-solid drop-shadow-[0px_2px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[7px] items-start p-[21px] rounded-[26px] w-full"
            data-node-id="32:3495"
            data-name="Section - BatchCard1"
          >
            <div className="flex flex-col gap-1.5 pb-[4px] w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                <span className="inline-block text-[10px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Metode: {methodInfo.badge}
                </span>
                <span className="bg-[#dcfce7] font-bold text-[#15803d] text-[10.5px] leading-tight px-[10px] py-[4px] rounded-[9999px] whitespace-nowrap">
                  Fase Pengisian · Hari ke-{batch.dayCount || 1}
                </span>
              </div>
              <h2 className="font-bold text-[#171717] text-[16px] tracking-[-0.4px] leading-snug">
                {batch.title}
              </h2>
            </div>

            <div className="w-full bg-[#f8fff4] border border-[#dcf0e2] rounded-[14px] px-3 py-2 mb-1">
              <p className="text-[11px] text-[#334155] leading-relaxed">
                {methodInfo.rule}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-[rgba(209,250,229,0.6)] h-[5px] relative rounded-[9999px] w-full overflow-hidden">
              <div
                className="bg-[#22c55e] h-[5px] rounded-[9999px] transition-all"
                style={{ width: `${batch.fillPercentage || 60}%` }}
              />
            </div>

            <p className="font-normal text-[#475569] text-[12.5px] leading-[18.75px] pb-[0.75px]">
              Kapasitas {batch.fillPercentage || 60}% terisi
            </p>

            {/* Waste Log Item List */}
            <div className="flex flex-col gap-[8px] items-start pb-[13px] pt-[9px] w-full">
              <p className="font-bold text-[#334155] text-[11px] tracking-[0.55px] uppercase leading-[16.5px]">
                LOG SAMPAH MASUK
              </p>
              <div className="flex flex-col gap-[6px] items-start w-full">
                {(batch.logs || []).map((log, idx) => (
                  <div key={log.id || idx} className="flex items-center justify-between w-full">
                    <span className="font-normal text-[#334155] text-[13px] leading-[19.5px]">
                      {log.item}
                    </span>
                    <span className="font-normal text-[#475569] text-[12.5px] leading-[18.75px]">
                      {log.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLockBatch(batch.id)}
              className="bg-white border border-[#15803d] border-solid hover:bg-green-50 transition cursor-pointer flex items-center justify-center pb-[13.25px] pt-[12px] px-[17px] rounded-[9999px] w-full"
              data-node-id="32:3519"
            >
              <span className="font-bold text-[#15803d] text-[13.5px] text-center leading-[20.25px]">
                Kunci Wadah &amp; Mulai Pematangan
              </span>
            </button>
          </div>
          );
        })}

        {/* Stage: Curing or Ready Batches (e.g. Batch #2) */}
        {curingOrReadyBatches.map((batch) => {
          const isReady = batch.stage === "ready" || (batch.curingDaysLeft ?? 9) <= 0;
          const methodInfo = getMethodRules(batch.title);
          return (
            <div
              key={batch.id}
              className="bg-white border border-[#dcf0e2] border-solid drop-shadow-[0px_2px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[8px] items-start p-[21px] rounded-[26px] w-full"
              data-node-id="32:3521"
              data-name="Section - BatchCard2"
            >
              <div className="flex flex-col gap-1.5 pb-[2px] w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <span className="inline-block text-[10px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    Metode: {methodInfo.badge}
                  </span>
                  <span
                    className={`font-bold text-[10.5px] leading-tight px-[10px] py-[4px] rounded-[9999px] whitespace-nowrap ${
                      isReady ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#92400e]"
                    }`}
                  >
                    {isReady
                      ? "Matang & Siap Panen (14/14)"
                      : `Pematangan · Hari ${batch.dayCount || 1}/14`}
                  </span>
                </div>
                <h2 className="font-bold text-[#171717] text-[16px] tracking-[-0.4px] leading-snug">
                  {batch.title}
                </h2>
              </div>

              <div className="w-full bg-[#f8fff4] border border-[#dcf0e2] rounded-[14px] px-3 py-2">
                <p className="text-[11px] text-[#334155] leading-relaxed">
                  {methodInfo.rule}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="bg-[#f1f5f9] h-[5px] relative rounded-[9999px] w-full overflow-hidden">
                <div
                  className={`${
                    isReady ? "bg-[#22c55e]" : "bg-[#f59e0b]"
                  } h-[5px] rounded-[9999px] transition-all`}
                  style={{ width: `${isReady ? 100 : batch.fillPercentage || 35}%` }}
                />
              </div>

              <p className="font-normal text-[#475569] text-[12.5px] leading-[20.31px] pb-[8.8px]">
                {isReady
                  ? "Kompos sudah matang sempurna dan siap dipanen menjadi pupuk."
                  : "Jangan masukkan sampah baru. Aduk 3 hari sekali."}
              </p>

              <button
                type="button"
                onClick={() => handleFastForwardBatch(batch)}
                className={`${
                  isReady ? "bg-[#0e7f3d] hover:bg-[#0b6831]" : "bg-[#b45309] hover:bg-[#92400e]"
                } transition cursor-pointer drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center pb-[14.25px] pt-[13px] px-[16px] rounded-[9999px] w-full`}
                data-node-id="32:3531"
              >
                <span className="font-bold text-[13.5px] text-center text-white leading-[20.25px]">
                  {isReady ? "Panen Kompos Sekarang" : "Simulasi Demo: Lompat 14 Hari"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Harvesting History Section */}
      <div
        className="flex flex-col gap-[12px] items-start px-[26px] pt-[20px]"
        data-node-id="32:3533"
        data-name="HarvestingHistorySection"
      >
        <div className="px-[4px] w-full">
          <p className="font-bold text-[#334155] text-[11px] tracking-[0.55px] uppercase leading-[16.5px]">
            RIWAYAT PANEN
          </p>
        </div>

        {harvests.length === 0 && (
          <div className="bg-white border border-[#dcf0e2] rounded-[24px] p-[18px] w-full text-center">
            <p className="text-[#64748b] text-[12.5px]">
              Belum ada riwayat panen kompos.
            </p>
          </div>
        )}

        {harvests.map((harvestItem) => {
          const isExpanded = expandedHarvestId === harvestItem.id;
          return (
            <React.Fragment key={harvestItem.id}>
              {/* Harvest History Summary Row Card (32:3536) */}
              <div
                onClick={() =>
                  setExpandedHarvestId(isExpanded ? null : harvestItem.id)
                }
                className="bg-white border border-[#dcf0e2] border-solid cursor-pointer drop-shadow-[0px_2px_3px_rgba(0,0,0,0.02)] flex gap-[14px] items-center p-[17px] rounded-[24px] w-full hover:bg-green-50/30 transition"
                data-node-id="32:3536"
                data-name="Harvest History Card"
              >
                <div className="bg-[#dcfce7] flex items-center justify-center rounded-[16px] shrink-0 size-[48px]">
                  <img alt="" className="size-[24px]" src={imgHarvestBoxIcon} />
                </div>

                <div className="flex flex-1 flex-col gap-px items-start min-w-0">
                  <p className="font-bold text-[#171717] text-[14.5px] leading-[19.94px] truncate w-full">
                    {harvestItem.title} · Panen {harvestItem.harvestDate}
                  </p>
                  <p className="font-normal text-[#475569] text-[12.5px] leading-[16px]">
                    {harvestItem.weightKg} Kg Pupuk Organik Siap Pakai
                  </p>
                </div>

                <div className="flex items-center justify-center shrink-0 size-[32px]">
                  <img
                    alt="Expand"
                    className={`size-[16px] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    src={imgChevronDown}
                  />
                </div>
              </div>

              {/* Harvest Dropdown Expanded Card (52:3) */}
              {isExpanded && (
                <div
                  className="bg-white border border-[#dcf0e2] border-solid drop-shadow-[0px_2px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[7px] items-start p-[20px] rounded-[26px] w-full"
                  data-node-id="52:3"
                  data-name="HarvestDropdownCard"
                >
                  <div className="flex items-center justify-between pb-[7px] w-full">
                    <p className="font-bold text-[#171717] text-[17px] tracking-[-0.43px] leading-[25.5px]">
                      {harvestItem.title}
                    </p>
                    <div className="bg-[#dcfce7] flex items-center px-[12px] py-[4px] rounded-[9999px]">
                      <span className="font-bold text-[#15803d] text-[11px] leading-[16.5px]">
                        Sudah selesai
                      </span>
                    </div>
                  </div>

                  {/* 100% Progress Bar */}
                  <div className="bg-[rgba(209,250,229,0.6)] h-[5px] overflow-hidden relative rounded-[9999px] w-full">
                    <div className="bg-[#22c55e] h-[5px] w-full rounded-[9999px]" />
                  </div>

                  <p className="font-normal text-[#475569] text-[12.5px] leading-[18.75px] pb-[0.75px]">
                    {harvestItem.weightKg} Kg Pupuk Organik Siap Pakai
                  </p>

                  {/* Waste Log */}
                  <div className="flex flex-col gap-[8px] items-start pb-[13px] pt-[9px] w-full">
                    <p className="font-bold text-[#334155] text-[11px] tracking-[0.55px] uppercase leading-[16.5px]">
                      LOG SAMPAH MASUK
                    </p>
                    <div className="flex flex-col gap-[6px] items-start w-full">
                      {(
                        harvestItem.logs || [
                          { id: "log-h1", item: "Kulit pisang", date: "—" },
                          { id: "log-h2", item: "Tahu basi", date: "—" }
                        ]
                      ).map((log, idx) => (
                        <div key={log.id || idx} className="flex items-center justify-between w-full">
                          <span className="font-normal text-[#334155] text-[13px] leading-[19.5px]">
                            {log.item}
                          </span>
                          <span className="font-normal text-[#475569] text-[12.5px] leading-[18.75px]">
                            {log.date || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(harvestItem)}
                    className="bg-white border border-[#15803d] border-solid hover:bg-green-50 transition cursor-pointer flex items-center justify-center pb-[12.25px] pt-[11px] px-[16px] rounded-[9999px] w-full"
                    data-node-id="52:27"
                  >
                    <span className="font-bold text-[#15803d] text-[13.5px] text-center leading-[20.25px]">
                      Lihat Detail Panen
                    </span>
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Modal Input Bahan Basi Langsung ke Kompos */}
      {showAddSpoiledModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-5">
          <form
            onSubmit={handleAddDirectSpoiledToCompost}
            className="w-full max-w-[350px] bg-white rounded-[26px] border border-[#cdebd3] p-5 space-y-4 shadow-xl"
          >
            <div>
              <h3 className="font-bold text-[17px] text-[#171717]">Catat ke Siklus Olah Sisa</h3>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Pilih metode pengolahan dan catat bahan sisa agar bisa dipantau progresnya.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">Metode Olahan</label>
                <select
                  value={selectedProcessMethod}
                  onChange={(e) => {
                    const nextMethod = e.target.value;
                    setSelectedProcessMethod(nextMethod);
                    const matched = findMatchingFillingBatch(nextMethod);
                    setSelectedTargetBatchId(matched ? matched.id : "new");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdebd3] text-[13px] bg-white focus:outline-none focus:border-[#0e7f3d]"
                >
                  <option value="Pupuk Organik Cair (POC)">Pupuk Organik Cair (POC)</option>
                  <option value="Eco-Enzyme">Eco-Enzyme</option>
                  <option value="Kompos Padat">Kompos Padat / Biopori</option>
                  <option value="Bokashi">Bokashi Ember Tertutup</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">Target Wadah / Batch</label>
                <select
                  value={selectedTargetBatchId}
                  onChange={(e) => setSelectedTargetBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdebd3] text-[13px] bg-white focus:outline-none focus:border-[#0e7f3d]"
                >
                  {batches
                    .filter((b) => b.stage === "filling")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        Lanjutkan: {b.title} ({b.fillPercentage || 0}%)
                      </option>
                    ))}
                  <option value="new">Buat Wadah Baru ({selectedProcessMethod})</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">Nama Bahan Basi / Sisa</label>
                <input
                  type="text"
                  required
                  value={spoiledFoodName}
                  onChange={(e) => setSpoiledFoodName(e.target.value)}
                  placeholder="Contoh: Nasi Basi / Kulit Pisang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdebd3] text-[13.5px] focus:outline-none focus:border-[#0e7f3d]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">Perkiraan Berat (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={spoiledWeightKg}
                  onChange={(e) => setSpoiledWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cdebd3] text-[13.5px] focus:outline-none focus:border-[#0e7f3d]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSpoiledModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingSpoiled}
                className="flex-1 py-2.5 rounded-xl bg-[#0e7f3d] text-white text-[13px] font-bold"
              >
                {isSubmittingSpoiled ? "Menyimpan..." : "Simpan ke Upcycle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
