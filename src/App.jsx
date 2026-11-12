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

// Modals from Teammate (Scan & Manual Input)
import ScanModal from './components/ScanModal.jsx';
import ManualInputModal from './components/ManualInputModal.jsx';

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
    // User requested: When logging in fresh, start with empty fridge so user scans or inputs manually
    store.saveFoodItems([]);
    refreshAllData();
    setCurrentTab('pantry');
  };

  const handleConfirmLogout = () => {
    const updated = store.logoutUser();
    setUser(updated);
    setShowLogoutDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Mobile Application Frame: 402px wide, matching Figma screen size */}
      <div className="w-full max-w-[402px] bg-[#f8fff4] min-h-screen shadow-2xl relative flex flex-col border-x border-[#cdebd3]/40 overflow-hidden">
        {showSplash ? (
          /* 1. Splash Screen */
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : !user?.isLoggedIn ? (
          /* 2. Landing Screen with Google OAuth */
          <LandingScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentTab === 'notifications' ? (
          /* 4. Notification Screen */
          <NotificationScreen
            notifications={notifications}
            onBack={() => setCurrentTab('pantry')}
            onNotificationsUpdated={() => refreshAllData()}
          />
        ) : (
          /* 3. Main Authenticated Views with Top Header & Bottom Nav */
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
              {/* Tab 1: Pantry / Dashboard */}
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
                  onOpenRescueAi={() => setCurrentTab('ai')}
                  onOpenCompostAi={() => setCurrentTab('ai')}
                  onFoodItemsUpdated={() => refreshAllData()}
                  onSwitchToCompost={() => setCurrentTab('compost')}
                />
              )}

              {/* Tab 2: Tanya AI */}
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
                />
              )}

              {/* Tab 2b: Riwayat Chat */}
              {currentTab === 'ai-riwayat' && (
                <RiwayatChatScreen
                  chats={aiChats}
                  onOpenChat={() => setCurrentTab('ai')}
                  onBack={() => setCurrentTab('ai')}
                />
              )}

              {/* Tab 3: Pengaturan */}
              {currentTab === 'settings' && (
                <PengaturanScreen
                  user={user}
                  onProfileUpdated={() => refreshAllData()}
                  onOpenLogoutDialog={() => setShowLogoutDialog(true)}
                />
              )}

              {/* Tab 4: Kompos */}
              {currentTab === 'compost' && (
                <div className="p-6 text-center space-y-4 pt-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                    🌿
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Siklus Kompos Aktif
                  </h2>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Bagian kompos dikerjakan oleh rekan tim. Kamu bisa meninjau kartu kompos dari Dashboard Pantry atau bertanya di menu Tanya AI!
                  </p>
                  <button
                    onClick={() => setCurrentTab('pantry')}
                    className="px-6 py-2.5 bg-[#0e7a37] text-white rounded-full font-bold text-sm shadow-sm"
                  >
                    Kembali ke Pantry
                  </button>
                </div>
              )}
            </main>

            <BottomNavBar
              activeTab={
                currentTab === 'ai-riwayat' ? 'ai' : currentTab
              }
              onSelectTab={(tab) => {
                if (tab === 'ai') {
                  setCurrentTab('ai');
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenScan={() => setShowScanModal(true)}
            />
          </>
        )}

        {/* Dialog Logout (Figma node 45:921 - 45:942) */}
        <LogoutDialog
          isOpen={showLogoutDialog}
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={handleConfirmLogout}
        />

        {/* Teammate Modals */}
        {showScanModal && (
          <ScanModal
            isOpen={showScanModal}
            onClose={() => setShowScanModal(false)}
            onItemsAdded={() => refreshAllData()}
          />
        )}

        {showManualModal && (
          <ManualInputModal
            isOpen={showManualModal}
            initialTab={manualInitialTab}
            onClose={() => setShowManualModal(false)}
            onItemAdded={() => refreshAllData()}
          />
        )}
      </div>
    </div>
  );
}
