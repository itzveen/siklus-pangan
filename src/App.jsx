import React, { useState, useEffect } from 'react';
import * as store from './services/storageService.js';

// Screens & Components
import SplashScreen from './components/SplashScreen.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import TopHeader from './components/TopHeader.jsx';
import BottomNavBar from './components/BottomNavBar.jsx';
import DashboardScreen from './components/DashboardScreen.jsx';
import NotificationScreen from './components/NotificationScreen.jsx';
import TanyaAiScreen from './components/TanyaAiScreen.jsx';
import RiwayatChatScreen from './components/RiwayatChatScreen.jsx';
import PengaturanScreen from './components/PengaturanScreen.jsx';
import LogoutDialog from './components/LogoutDialog.jsx';
import CompostPage from './pages/CompostPage.jsx';

// Modals (Scan, Manual Input, Rescue Recipe, Compost Guide)
import ScanModal from './components/ScanModal.jsx';
import ManualInputModal from './components/ManualInputModal.jsx';
import RecipeModal from './components/RecipeModal.jsx';
import CompostModal from './components/CompostModal.jsx';

export default function App() {
  // App Navigation & Session States
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(store.getUserProfile());
  const [currentTab, setCurrentTab] = useState('pantry'); // 'pantry' | 'notifications' | 'ai' | 'ai-riwayat' | 'settings' | 'compost'

  // Dialogs & Modals
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualInitialTab, setManualInitialTab] = useState('raw'); // 'raw' | 'leftover'
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeTargetItems, setRecipeTargetItems] = useState(null);
  const [showCompostModal, setShowCompostModal] = useState(false);
  const [compostTargetFood, setCompostTargetFood] = useState(null);

  // Live Reactive Data from Storage
  const [foodItems, setFoodItems] = useState(store.getFoodItems());
  const [impactStats, setImpactStats] = useState(store.getImpactStats());
  const [notifications, setNotifications] = useState(store.getNotifications());
  const [compostBatches, setCompostBatches] = useState(store.getCompostBatches());
  const [aiChats, setAiChats] = useState(store.getAiHistory());

  // Reload data from storage whenever needed
  const refreshAllData = () => {
    setFoodItems(store.getFoodItems());
    setImpactStats(store.getImpactStats());
    setNotifications(store.getNotifications());
    setCompostBatches(store.getCompostBatches());
    setAiChats(store.getAiHistory());
    setUser(store.getUserProfile());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleLoginSuccess = (updatedUser) => {
    setUser(updatedUser);
    refreshAllData();
    setCurrentTab('pantry');
  };

  const handleConfirmLogout = () => {
    const updated = store.logoutUser();
    setUser(updated);
    setShowLogoutDialog(false);
  };

  const handleOpenRescueModal = (items) => {
    const resolved = Array.isArray(items) && items.length > 0
      ? items
      : foodItems.filter((f) => f.status === 'warning');
    setRecipeTargetItems(resolved.length > 0 ? resolved : null);
    setShowRecipeModal(true);
  };

  const handleOpenCompostModal = (food) => {
    setCompostTargetFood(food || null);
    setShowCompostModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Mobile Application Frame: 402px wide, matching Figma screen size */}
      <div className="w-full max-w-[402px] bg-[#f8fff4] min-h-screen shadow-2xl relative flex flex-col border-x border-[#cdebd3]/40 overflow-hidden">
        {showSplash ? (
          /* 1. Splash Screen (Figma 1:2) */
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : !user?.isLoggedIn ? (
          /* 2. Landing Screen with Google OAuth (Figma 8:10) */
          <LandingScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentTab === 'notifications' ? (
          /* 4. Notification Screen (Figma 43:195) */
          <NotificationScreen
            notifications={notifications}
            onBack={() => setCurrentTab('pantry')}
            onNotificationsUpdated={() => refreshAllData()}
          />
        ) : (
          /* 3. Main Authenticated Views */
          <>
            {/* TopHeader only rendered on Pantry / Dashboard screen to prevent duplicate headers */}
            {currentTab === 'pantry' && (
              <TopHeader
                user={user}
                unreadCount={unreadNotifCount}
                onOpenNotifications={() => setCurrentTab('notifications')}
                onOpenSettings={() => setShowLogoutDialog(true)}
              />
            )}

            <main className="flex-1 overflow-y-auto">
              {/* Tab 1: Pantry / Dashboard (Figma 16:523 & 44:476) */}
              {currentTab === 'pantry' && (
                <DashboardScreen
                  user={user}
                  foodItems={foodItems}
                  impact={impactStats}
                  compostBatches={compostBatches}
                  onOpenScan={() => setShowScanModal(true)}
                  onOpenManual={() => {
                    setManualInitialTab('raw');
                    setShowManualModal(true);
                  }}
                  onOpenRescueAi={handleOpenRescueModal}
                  onOpenCompostAi={handleOpenCompostModal}
                  onFoodItemsUpdated={() => refreshAllData()}
                  onSwitchToCompost={() => setCurrentTab('compost')}
                />
              )}

              {/* Tab 2: Tanya AI (Figma 32:3707) */}
              {currentTab === 'ai' && (
                <TanyaAiScreen
                  user={user}
                  foodItems={foodItems}
                  onOpenRiwayat={() => setCurrentTab('ai-riwayat')}
                  onOpenScan={() => setShowScanModal(true)}
                  onOpenManual={() => {
                    setManualInitialTab('raw');
                    setShowManualModal(true);
                  }}
                  onHistoryUpdated={() => refreshAllData()}
                />
              )}

              {/* Tab 2b: Riwayat Chat (Figma 54:905) */}
              {currentTab === 'ai-riwayat' && (
                <RiwayatChatScreen
                  chats={aiChats}
                  onOpenChat={() => setCurrentTab('ai')}
                  onBack={() => setCurrentTab('ai')}
                />
              )}

              {/* Tab 3: Siklus Kompos & Panen (Figma 32:3581, 45:1108, 62:75, 55:63) */}
              {currentTab === 'compost' && (
                <CompostPage
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenScan={() => setShowScanModal(true)}
                  onDataUpdated={() => refreshAllData()}
                />
              )}

              {/* Tab 4: Pengaturan (Figma 30:2902) */}
              {currentTab === 'settings' && (
                <PengaturanScreen
                  user={user}
                  onProfileUpdated={() => refreshAllData()}
                  onOpenLogoutDialog={() => setShowLogoutDialog(true)}
                />
              )}
            </main>

            {/* BottomNavBar: CompostPage already renders its own Figma-exact BottomNavBar */}
            {currentTab !== 'compost' && (
              <BottomNavBar
                activeTab={currentTab === 'ai-riwayat' ? 'ai' : currentTab}
                onSelectTab={(tab) => setCurrentTab(tab)}
                onOpenScan={() => setShowScanModal(true)}
              />
            )}
          </>
        )}

        {/* Dialog Logout (Figma 45:942) */}
        <LogoutDialog
          isOpen={showLogoutDialog}
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={handleConfirmLogout}
        />

        {/* Modal: AI Scan Struk / Isi Kulkas (Figma 22:2306, 23:2426, 22:1954, 45:615, 66:16) */}
        {showScanModal && (
          <div className="fixed inset-0 z-50 bg-[#f8fff4] overflow-y-auto max-w-[402px] mx-auto shadow-2xl">
            <ScanModal
              initialStep="capture"
              onClose={() => setShowScanModal(false)}
              onOpenManual={(tab = 'raw') => {
                setShowScanModal(false);
                setManualInitialTab(tab);
                setShowManualModal(true);
              }}
              onSavedToFridge={() => {
                setShowScanModal(false);
                refreshAllData();
                setCurrentTab('pantry');
              }}
            />
          </div>
        )}

        {/* Modal: Catat Stok Manual - Bahan Mentah & Masakan Sisa (Figma 29:2621, 58:132) */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-[#f8fff4] overflow-y-auto max-w-[402px] mx-auto shadow-2xl">
            <ManualInputModal
              initialTab={manualInitialTab}
              onClose={() => setShowManualModal(false)}
              onSavedToFridge={() => {
                setShowManualModal(false);
                refreshAllData();
                setCurrentTab('pantry');
              }}
            />
          </div>
        )}

        {/* Modal: Rescue Resep & Konfirmasi Masakan Selesai (Figma 31:3285, 59:518) */}
        {showRecipeModal && (
          <div className="fixed inset-0 z-50 bg-[#f8fff4] overflow-y-auto max-w-[402px] mx-auto shadow-2xl">
            <RecipeModal
              isOpen={showRecipeModal}
              expiringItems={recipeTargetItems}
              onClose={() => setShowRecipeModal(false)}
              onOpenCompostGuide={() => {
                setShowRecipeModal(false);
                handleOpenCompostModal(recipeTargetItems?.[0] || null);
              }}
              onSuccess={() => {
                setShowRecipeModal(false);
                refreshAllData();
              }}
            />
          </div>
        )}

        {/* Modal: Alih ke Kompos & Konfirmasi Simpan ke Wadah (Figma 32:3286, 61:514) */}
        {showCompostModal && (
          <div className="fixed inset-0 z-50 bg-[#f8fff4] overflow-y-auto max-w-[402px] mx-auto shadow-2xl">
            <CompostModal
              isOpen={showCompostModal}
              foodItem={compostTargetFood}
              onClose={() => setShowCompostModal(false)}
              onSuccess={() => {
                setShowCompostModal(false);
                refreshAllData();
                setCurrentTab('compost');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
