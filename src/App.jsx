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
  const [showNavPanel, setShowNavPanel] = useState(true);

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
    <div className="min-h-screen bg-[#eef5ea] py-4 px-2 sm:px-4 font-['Poppins',sans-serif]">
      {/* Collapsible Top Navigation Control Bar */}
      <div className="max-w-[402px] mx-auto mb-4">
        {!showNavPanel ? (
          <div className="flex justify-between items-center bg-white/95 backdrop-blur border border-[#dcf0e2] rounded-full px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold text-[#14281d]">
              EatWise Preview ({activeScreen})
            </span>
            <button
              type="button"
              onClick={() => setShowNavPanel(true)}
              className="text-xs font-bold text-[#0e7f3d] cursor-pointer"
            >
              Pilih Layar (14)
            </button>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur border border-[#dcf0e2] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-100">
              <div>
                <h1 className="font-bold text-[#14281d] text-xs sm:text-sm">
                  EatWise — Scan &amp; Input + Rescue &amp; Kompos
                </h1>
                <p className="text-[11px] text-[#64748b]">
                  Branch: <code className="text-[#0e7f3d] font-semibold">feature/ui-scan-compost</code>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] transition cursor-pointer"
                >
                  Reset Data
                </button>
                <button
                  type="button"
                  onClick={() => setShowNavPanel(false)}
                  className="text-[11px] font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {SCREEN_GROUPS.map((group) => (
                <div key={group.section} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                    {group.section}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.screens.map((scr) => {
                      const isActive = activeScreen === scr.id;
                      return (
                        <button
                          key={scr.id}
                          type="button"
                          onClick={() => setActiveScreen(scr.id)}
                          className={`text-[11px] px-2 py-1 rounded-lg font-medium transition cursor-pointer ${
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
        )}
      </div>

      {/* Active Mobile Frame Viewport (Locked to 402px max width, 100% width) */}
      <div className="w-full max-w-[402px] mx-auto">{renderScreen()}</div>
    </div>
  );
}
