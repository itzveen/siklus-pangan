import React, { useState, useEffect } from 'react';
import * as store from '../backend/services/storageService.js';
import { fetchFromBackend } from './config/api.js';

// Auth
import SplashScreen from './features/auth/SplashScreen.jsx';
import LoginScreen from './features/auth/LoginScreen.jsx';
import LogoutDialog from './features/auth/LogoutDialog.jsx';

// Shared UI
import TopHeader from './shared/components/TopHeader.jsx';
import BottomNavBar from './shared/components/BottomNavBar.jsx';

// Pantry & Scan
import PantryDashboardPage from './features/pantry/PantryDashboardPage.jsx';
import NotificationPage from './features/pantry/NotificationPage.jsx';
import AiScanModal from './features/pantry/AiScanModal.jsx';
import ManualStockModal from './features/pantry/ManualStockModal.jsx';

// AI Assistant
import AskAiPage from './features/ai-assistant/AskAiPage.jsx';
import AiHistoryPage from './features/ai-assistant/AiHistoryPage.jsx';
import RescueRecipeModal from './features/ai-assistant/RescueRecipeModal.jsx';

// Compost
import CompostCyclePage from './features/compost/CompostCyclePage.jsx';
import CompostGuideModal from './features/compost/CompostGuideModal.jsx';

// Settings
import SettingsPage from './features/settings/SettingsPage.jsx';

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
    store.checkDailyReminderNotification();
    refreshAllData();
    const timer = setInterval(() => {
      if (store.checkDailyReminderNotification()) {
        refreshAllData();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const handleLoginSuccess = async (updatedUser) => {
    const res = await fetchFromBackend('/auth/google', {
      method: 'POST',
      body: JSON.stringify(updatedUser)
    });
    const syncedUser = res?.user || updatedUser;
    store.saveUserProfile(syncedUser);
    setUser(syncedUser);
    refreshAllData();
    setCurrentTab('pantry');
  };

  const handleConfirmLogout = async () => {
    const res = await fetchFromBackend('/auth/logout', { method: 'POST' });
    setUser(res?.user || store.getUserProfile());
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
          /* 2. Login Screen with Google OAuth (Figma 8:10) */
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentTab === 'notifications' ? (
          /* 4. Notification Screen (Figma 43:195) */
          <NotificationPage
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
                <PantryDashboardPage
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
                <AskAiPage
                  user={user}
                  foodItems={foodItems}
                  onOpenRiwayat={() => setCurrentTab('ai-riwayat')}
                  onOpenScan={() => setShowScanModal(true)}
                  onOpenManual={() => {
                    setManualInitialTab('raw');
                    setShowManualModal(true);
                  }}
                  onOpenCompostTab={() => {
                    refreshAllData();
                    setCurrentTab('compost');
                  }}
                  onHistoryUpdated={() => refreshAllData()}
                />
              )}

              {/* Tab 2b: Riwayat Chat (Figma 54:905) */}
              {currentTab === 'ai-riwayat' && (
                <AiHistoryPage
                  chats={aiChats}
                  onOpenChat={() => setCurrentTab('ai')}
                  onBack={() => setCurrentTab('ai')}
                />
              )}

              {/* Tab 3: Siklus Kompos & Panen (Figma 32:3581, 45:1108, 62:75, 55:63) */}
              {currentTab === 'compost' && (
                <CompostCyclePage
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenScan={() => setShowScanModal(true)}
                  onDataUpdated={() => refreshAllData()}
                />
              )}

              {/* Tab 4: Pengaturan (Figma 30:2902) */}
              {currentTab === 'settings' && (
                <SettingsPage
                  user={user}
                  onProfileUpdated={() => refreshAllData()}
                  onOpenLogoutDialog={() => setShowLogoutDialog(true)}
                />
              )}
            </main>

            {/* Shared BottomNavBar across all authenticated tabs */}
            <BottomNavBar
              activeTab={currentTab === 'ai-riwayat' ? 'ai' : currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onOpenScan={() => setShowScanModal(true)}
            />
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
            <AiScanModal
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
            <ManualStockModal
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
            <RescueRecipeModal
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
            <CompostGuideModal
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
