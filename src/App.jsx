import React, { useState } from "react";
import * as store from "./services/storageService.js";
import ScanModal from "./components/ScanModal.jsx";
import ManualInputModal from "./components/ManualInputModal.jsx";
import RecipeModal from "./components/RecipeModal.jsx";
import CompostModal from "./components/CompostModal.jsx";
import CompostPage from "./pages/CompostPage.jsx";

const SCREEN_GROUPS = [
  {
    section: "Section 1: Scan & Input",
    screens: [
      { id: "scan-capture", label: "1. AI Scan Step 1 (Ambil Foto)" },
      { id: "scan-scanning", label: "2. AI Scan Step 2 (Memindai)" },
      { id: "scan-failed", label: "3. Scan Gagal" },
      { id: "scan-result", label: "4. AI Scan Result" },
      { id: "manual-raw", label: "5. Catat Stok (Bahan Mentah)" },
      { id: "manual-leftover", label: "6. Catat Stok (Masakan Sisa)" }
    ]
  },
  {
    section: "Section 2: Rescue & Kompos",
    screens: [
      { id: "rescue-recipe", label: "7. Rescue Resep AI" },
      { id: "rescue-recipe-success", label: "8. Dialog Masakan Selesai" },
      { id: "compost-guide", label: "9. Alihkan ke Kompos" },
      { id: "compost-guide-success", label: "10. Dialog Simpan Kompos" },
      { id: "compost-cycle", label: "11. Siklus Kompos" },
      { id: "compost-harvest", label: "12. Panen Kompos" },
      { id: "compost-harvest-success", label: "13. Dialog Panen Tercatat" },
      { id: "compost-detail", label: "14. Detail Riwayat Panen" }
    ]
  }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState("scan-capture");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetDemo = () => {
    store.resetAllDataToDummy();
    setRefreshKey((k) => k + 1);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      // --- SECTION 1: SCAN & INPUT ---
      case "scan-capture":
        return (
          <ScanModal
            key={`scan-capture-${refreshKey}`}
            initialStep="capture"
            onClose={() => setActiveScreen("compost-cycle")}
            onOpenManual={() => setActiveScreen("manual-raw")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );
      case "scan-scanning":
        return (
          <ScanModal
            key={`scan-scanning-${refreshKey}`}
            initialStep="scanning"
            onClose={() => setActiveScreen("scan-capture")}
            onOpenManual={() => setActiveScreen("manual-raw")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );
      case "scan-failed":
        return (
          <ScanModal
            key={`scan-failed-${refreshKey}`}
            initialStep="failed"
            onClose={() => setActiveScreen("scan-capture")}
            onOpenManual={() => setActiveScreen("manual-raw")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );
      case "scan-result":
        return (
          <ScanModal
            key={`scan-result-${refreshKey}`}
            initialStep="result"
            onClose={() => setActiveScreen("scan-capture")}
            onOpenManual={() => setActiveScreen("manual-raw")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );
      case "manual-raw":
        return (
          <ManualInputModal
            key={`manual-raw-${refreshKey}`}
            initialTab="raw"
            onClose={() => setActiveScreen("scan-capture")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );
      case "manual-leftover":
        return (
          <ManualInputModal
            key={`manual-leftover-${refreshKey}`}
            initialTab="leftover"
            onClose={() => setActiveScreen("scan-capture")}
            onSavedToFridge={() => setActiveScreen("rescue-recipe")}
          />
        );

      // --- SECTION 2: RESCUE & KOMPOS ---
      case "rescue-recipe":
        return (
          <RecipeModal
            key={`rescue-recipe-${refreshKey}`}
            isOpen={true}
            initialShowSuccess={false}
            onClose={() => setActiveScreen("compost-cycle")}
            onSuccess={() => setActiveScreen("compost-cycle")}
          />
        );
      case "rescue-recipe-success":
        return (
          <RecipeModal
            key={`rescue-recipe-success-${refreshKey}`}
            isOpen={true}
            initialShowSuccess={true}
            onClose={() => setActiveScreen("rescue-recipe")}
            onSuccess={() => setActiveScreen("compost-cycle")}
          />
        );
      case "compost-guide":
        return (
          <CompostModal
            key={`compost-guide-${refreshKey}`}
            isOpen={true}
            initialShowSuccess={false}
            onClose={() => setActiveScreen("compost-cycle")}
            onSuccess={() => setActiveScreen("compost-cycle")}
          />
        );
      case "compost-guide-success":
        return (
          <CompostModal
            key={`compost-guide-success-${refreshKey}`}
            isOpen={true}
            initialShowSuccess={true}
            onClose={() => setActiveScreen("compost-guide")}
            onSuccess={() => setActiveScreen("compost-cycle")}
          />
        );
      case "compost-cycle":
        return (
          <CompostPage
            key={`compost-cycle-${refreshKey}`}
            initialView="cycle"
            onOpenScan={() => setActiveScreen("scan-capture")}
            onNavigateTab={(tab) => {
              if (tab === "ai") setActiveScreen("rescue-recipe");
              else if (tab === "pantry") setActiveScreen("manual-raw");
            }}
          />
        );
      case "compost-harvest":
        return (
          <CompostPage
            key={`compost-harvest-${refreshKey}`}
            initialView="harvest"
            onOpenScan={() => setActiveScreen("scan-capture")}
          />
        );
      case "compost-harvest-success":
        return (
          <CompostPage
            key={`compost-harvest-success-${refreshKey}`}
            initialView="harvest-success"
            onOpenScan={() => setActiveScreen("scan-capture")}
          />
        );
      case "compost-detail":
        return (
          <CompostPage
            key={`compost-detail-${refreshKey}`}
            initialView="detail"
            onOpenScan={() => setActiveScreen("scan-capture")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef5ea] py-6 px-3 font-['Poppins',sans-serif]">
      {/* Preview Navigation Control Bar */}
      <div className="max-w-[920px] mx-auto mb-6 bg-white/95 backdrop-blur border border-[#dcf0e2] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
          <div>
            <h1 className="font-bold text-[#14281d] text-base">
              EatWise (SiklusPangan) — UI Slicing: Scan &amp; Input + Rescue &amp; Kompos
            </h1>
            <p className="text-xs text-[#64748b]">
              Branch: <code className="text-[#0e7f3d] font-semibold">feature/ui-scan-compost</code> · Terintegrasi dengan <code className="text-[#0e7f3d]">storageService.js</code> &amp; <code className="text-[#0e7f3d]">geminiService.js</code>
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDemo}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] transition cursor-pointer"
          >
            Reset Data Dummy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCREEN_GROUPS.map((group) => (
            <div key={group.section} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                {group.section}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.screens.map((scr) => {
                  const isActive = activeScreen === scr.id;
                  return (
                    <button
                      key={scr.id}
                      type="button"
                      onClick={() => setActiveScreen(scr.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        isActive
                          ? "bg-[#0e7f3d] text-white shadow-xs"
                          : "bg-gray-100 text-[#334155] hover:bg-gray-200"
                      }`}
                    >
                      {scr.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Mobile Frame Viewport */}
      <div className="flex justify-center items-start">{renderScreen()}</div>
    </div>
  );
}
