import React, { useState } from "react";
import ScanModal from "./components/ScanModal.jsx";
import ManualInputModal from "./components/ManualInputModal.jsx";
import RecipeModal from "./components/RecipeModal.jsx";
import CompostModal from "./components/CompostModal.jsx";
import CompostPage from "./pages/CompostPage.jsx";

export default function App() {
  // Fokus khusus bagian tugas: Scan & Input (ScanModal, ManualInputModal) dan Rescue & Kompos (RecipeModal, CompostModal, CompostPage)
  const [activeScreen, setActiveScreen] = useState("compost-cycle");
  const [manualInitialTab, setManualInitialTab] = useState("raw");

  return (
    <div className="min-h-screen bg-[#f8fff4] w-full max-w-[402px] mx-auto font-['Poppins',sans-serif]">
      {activeScreen === "scan-capture" && (
        <ScanModal
          initialStep="capture"
          onClose={() => setActiveScreen("compost-cycle")}
          onOpenManual={(tab = "raw") => {
            setManualInitialTab(tab);
            setActiveScreen("manual-input");
          }}
          onSavedToFridge={() => setActiveScreen("compost-cycle")}
        />
      )}

      {activeScreen === "manual-input" && (
        <ManualInputModal
          initialTab={manualInitialTab}
          onClose={() => setActiveScreen("compost-cycle")}
          onSavedToFridge={() => setActiveScreen("compost-cycle")}
        />
      )}

      {activeScreen === "rescue-recipe" && (
        <RecipeModal
          isOpen={true}
          onClose={() => setActiveScreen("compost-cycle")}
          onSuccess={() => setActiveScreen("compost-cycle")}
        />
      )}

      {activeScreen === "compost-guide" && (
        <CompostModal
          isOpen={true}
          onClose={() => setActiveScreen("compost-cycle")}
          onSuccess={() => setActiveScreen("compost-cycle")}
        />
      )}

      {activeScreen === "compost-cycle" && (
        <CompostPage
          initialView="cycle"
          onOpenScan={() => setActiveScreen("scan-capture")}
          onNavigateTab={(tab) => {
            if (tab === "pantry") {
              setManualInitialTab("raw");
              setActiveScreen("manual-input");
            } else if (tab === "ai") {
              setActiveScreen("rescue-recipe");
            } else if (tab === "compost") {
              setActiveScreen("compost-cycle");
            } else if (tab === "settings") {
              setActiveScreen("compost-guide");
            }
          }}
        />
      )}
    </div>
  );
}
