import React, { useState, useEffect } from 'react';
import * as store from './services/storageService.js';

// Screens & Components (Focused on Splash, Landing, and Dashboard)
import SplashScreen from './components/SplashScreen.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import TopHeader from './components/TopHeader.jsx';
import BottomNavBar from './components/BottomNavBar.jsx';
import DashboardScreen from './components/DashboardScreen.jsx';

// Modals from Teammate (Scan & Manual Input)
import ScanModal from './components/ScanModal.jsx';
import ManualInputModal from './components/ManualInputModal.jsx';

export default function App() {
  // App Navigation & Session States
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(store.getUserProfile());
  const [currentTab, setCurrentTab] = useState('pantry'); // 'pantry' | 'ai' | 'compost' | 'settings'

  // Modals
  const [showScanModal, setShowScanModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualInitialTab, setManualInitialTab] = useState('raw'); // 'raw' | 'leftover'

  // Live Reactive Data from Storage
  const [foodItems, setFoodItems] = useState(store.getFoodItems());
  const [impactStats, setImpactStats] = useState(store.getImpactStats());
  const [notifications, setNotifications] = useState(store.getNotifications());
  const [compostBatches, setCompostBatches] = useState(store.getCompostBatches());

  // Reload data from storage whenever needed
  const refreshAllData = () => {
    setFoodItems(store.getFoodItems());
    setImpactStats(store.getImpactStats());
    setNotifications(store.getNotifications());
    setCompostBatches(store.getCompostBatches());
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

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Mobile Application Frame: 402px wide, matching Figma screen size */}
      <div className="w-full max-w-[402px] bg-[#f8fff4] min-h-screen shadow-2xl relative flex flex-col border-x border-[#cdebd3]/40 overflow-hidden">
        {showSplash ? (
          /* 1. Splash Screen */
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : !user?.isLoggedIn ? (
          /* 2. Landing Screen */
          <LandingScreen onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* 3. Dashboard Screen with Top Header & Bottom Nav */
          <>
            <TopHeader
              user={user}
              unreadCount={unreadNotifCount}
              onOpenNotifications={() => {}}
              onOpenSettings={() => {
                // If user clicks avatar, toggle quick logout for testing
                if (window.confirm('Ingin keluar akun (Logout) untuk menguji Landing Screen?')) {
                  const updated = store.logoutUser();
                  setUser(updated);
                }
              }}
            />

            <main className="flex-1">
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
                onOpenRescueAi={() => {}}
                onOpenCompostAi={() => {}}
                onFoodItemsUpdated={() => refreshAllData()}
                onSwitchToCompost={() => {}}
              />
            </main>

            <BottomNavBar
              activeTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onOpenScan={() => setShowScanModal(true)}
            />
          </>
        )}

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
