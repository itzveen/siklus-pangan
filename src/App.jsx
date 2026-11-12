import React, { useState } from "react";
import ScanModal from "./components/ScanModal.jsx";
import ManualInputModal from "./components/ManualInputModal.jsx";
import RecipeModal from "./components/RecipeModal.jsx";
import CompostModal from "./components/CompostModal.jsx";
import CompostPage from "./pages/CompostPage.jsx";

export default function App() {
  // Default layar utama bagian Kompos & Scan: Siklus Kompos (dilengkapi Bottom Nav Figma)
  const [activeScreen, setActiveScreen] = useState("compost-cycle");

  return (
    <div className="min-h-screen bg-[#f8fff4] w-full max-w-[402px] mx-auto font-['Poppins',sans-serif]">
      {activeScreen === "scan-capture" && (
        <ScanModal
          initialStep="capture"
          onClose={() => setActiveScreen("compost-cycle")}
          onOpenManual={() => setActiveScreen("manual-raw")}
          onSavedToFridge={() => setActiveScreen("rescue-recipe")}
        />
      )}

      {activeScreen === "manual-raw" && (
        <ManualInputModal
          initialTab="raw"
          onClose={() => setActiveScreen("compost-cycle")}
          onSavedToFridge={() => setActiveScreen("rescue-recipe")}
        />
      )}

      {activeScreen === "rescue-recipe" && (
        <RecipeModal
          isOpen={true}
          onClose={() => setActiveScreen("compost-cycle")}
          onOpenCompostGuide={() => setActiveScreen("compost-guide")}
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
            if (tab === "pantry") setActiveScreen("manual-raw");
            else if (tab === "ai") setActiveScreen("rescue-recipe");
            else if (tab === "settings") setActiveScreen("compost-guide");
          }}
        />
      )}
    </div>
  );
}
