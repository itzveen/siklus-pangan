import React, { useState } from "react";
import PantryPage from "./pages/PantryPage.jsx";
import ScanModal from "./components/ScanModal.jsx";
import ManualInputModal from "./components/ManualInputModal.jsx";
import RecipeModal from "./components/RecipeModal.jsx";
import CompostModal from "./components/CompostModal.jsx";
import CompostPage from "./pages/CompostPage.jsx";

export default function App() {
  // Default halaman utama: Dashboard (PantryPage) sesuai alur aplikasi
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [selectedExpiringItems, setSelectedExpiringItems] = useState(null);
  const [selectedSpoiledFood, setSelectedSpoiledFood] = useState(null);
  const [manualInitialTab, setManualInitialTab] = useState("raw");

  return (
    <div className="min-h-screen bg-[#f8fff4] w-full max-w-[402px] mx-auto font-['Poppins',sans-serif]">
      {activeScreen === "dashboard" && (
        <PantryPage
          onOpenScan={() => setActiveScreen("scan-capture")}
          onOpenManual={(tab = "raw") => {
            setManualInitialTab(tab);
            setActiveScreen("manual-input");
          }}
          onOpenRescueRecipe={(items) => {
            setSelectedExpiringItems(items || null);
            setActiveScreen("rescue-recipe");
          }}
          onOpenCompostGuide={(foodItem) => {
            setSelectedSpoiledFood(foodItem || null);
            setActiveScreen("compost-guide");
          }}
          onNavigateTab={(tab) => {
            if (tab === "pantry") setActiveScreen("dashboard");
            else if (tab === "ai") {
              setSelectedExpiringItems(null);
              setActiveScreen("rescue-recipe");
            } else if (tab === "compost") setActiveScreen("compost-cycle");
          }}
        />
      )}

      {activeScreen === "scan-capture" && (
        <ScanModal
          initialStep="capture"
          onClose={() => setActiveScreen("dashboard")}
          onOpenManual={(tab = "raw") => {
            setManualInitialTab(tab);
            setActiveScreen("manual-input");
          }}
          onSavedToFridge={() => setActiveScreen("dashboard")}
        />
      )}

      {activeScreen === "manual-input" && (
        <ManualInputModal
          initialTab={manualInitialTab}
          onClose={() => setActiveScreen("dashboard")}
          onSavedToFridge={() => setActiveScreen("dashboard")}
        />
      )}

      {activeScreen === "rescue-recipe" && (
        <RecipeModal
          isOpen={true}
          expiringItems={selectedExpiringItems}
          onClose={() => setActiveScreen("dashboard")}
          onSuccess={() => setActiveScreen("dashboard")}
        />
      )}

      {activeScreen === "compost-guide" && (
        <CompostModal
          isOpen={true}
          foodItem={selectedSpoiledFood}
          onClose={() => setActiveScreen("dashboard")}
          onSuccess={() => setActiveScreen("compost-cycle")}
        />
      )}

      {activeScreen === "compost-cycle" && (
        <CompostPage
          initialView="cycle"
          onOpenScan={() => setActiveScreen("scan-capture")}
          onNavigateTab={(tab) => {
            if (tab === "pantry") setActiveScreen("dashboard");
            else if (tab === "ai") {
              setSelectedExpiringItems(null);
              setActiveScreen("rescue-recipe");
            } else if (tab === "compost") setActiveScreen("compost-cycle");
          }}
        />
      )}
    </div>
  );
}
