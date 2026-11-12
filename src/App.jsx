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
import ChatHistoryScreen from './components/ChatHistoryScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import LogoutDialog from './components/LogoutDialog.jsx';
import CompostPreviewScreen from './components/CompostPreviewScreen.jsx';

// Teammate's Scan & Input Modals
import ScanModal from './components/ScanModal.jsx';
import ManualInputModal from './components/ManualInputModal.jsx';

export default function App() {
  // App Navigation & Session States
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(store.getUserProfile());
  const [currentTab, setCurrentTab] = useState('pantry'); // 'pantry' | 'ai' | 'history' | 'compost' | 'settings' | 'notifications'
  const [previousTab, setPreviousTab] = useState('pantry');

  // Modals
  const [showScanModal, setShowScanModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualInitialTab, setManualInitialTab] = useState('raw'); // 'raw' | 'leftover'
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [aiInitialTopic, setAiInitialTopic] = useState(null);

  // Live Reactive Data from Storage
  const [foodItems, setFoodItems] = useState(store.getFoodItems());
  const [impactStats, setImpactStats] = useState(store.getImpactStats());
  const [notifications, setNotifications] = useState(store.getNotifications());
  const [compostBatches, setCompostBatches] = useState(store.getCompostBatches());
  const [harvestHistory, setHarvestHistory] = useState(store.getHarvestHistory());
  const [aiHistory, setAiHistory] = useState(store.getAiHistory());

  // Reload data from storage whenever needed
  const refreshAllData = () => {
    setFoodItems(store.getFoodItems());
    setImpactStats(store.getImpactStats());
    setNotifications(store.getNotifications());
    setCompostBatches(store.getCompostBatches());
    setHarvestHistory(store.getHarvestHistory());
    setAiHistory(store.getAiHistory());
    setUser(store.getUserProfile());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  // Handlers for Navigation
  const navigateTo = (tab) => {
    setPreviousTab(currentTab);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleResetDemoData = () => {
    store.resetAllDataToDummy();
    refreshAllData();
    setCurrentTab('pantry');
  };

  // 1. Splash Screen Display
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Landing Screen (if logged out)
  if (!user?.isLoggedIn) {
    return <LandingScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Main Authenticated Application View
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      <div className="w-full max-w-[402px] bg-[#f8fff4] min-h-screen shadow-2xl relative flex flex-col border-x border-[#cdebd3]/40">
        {/* Top Header (Shown on tabs except notifications subview) */}
        {currentTab !== 'notifications' && (
          <TopHeader
            user={user}
            unreadCount={unreadNotifCount}
            onOpenNotifications={() => navigateTo('notifications')}
            onOpenSettings={() => navigateTo('settings')}
          />
        )}

        {/* Dynamic Screen Content */}
        <main className="flex-1">
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
              onOpenRescueAi={() => {
                setAiInitialTopic('recipe');
                navigateTo('ai');
              }}
              onOpenCompostAi={() => {
                setAiInitialTopic('compost');
                navigateTo('ai');
              }}
              onFoodItemsUpdated={() => refreshAllData()}
              onSwitchToCompost={() => navigateTo('compost')}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationScreen
              notifications={notifications}
              onBack={() => navigateTo(previousTab || 'pantry')}
              onNotificationsUpdated={() => refreshAllData()}
              onTriggerAction={(actionType) => {
                if (actionType === 'recipe') {
                  setAiInitialTopic('recipe');
                  navigateTo('ai');
                } else if (actionType === 'compost') {
                  setAiInitialTopic('compost');
                  navigateTo('ai');
                } else if (actionType === 'scan') {
                  setShowScanModal(true);
                } else if (actionType === 'compost_tab') {
                  navigateTo('compost');
                } else {
                  navigateTo('pantry');
                }
              }}
            />
          )}

          {currentTab === 'ai' && (
            <TanyaAiScreen
              user={user}
              foodItems={foodItems}
              initialTopic={aiInitialTopic}
              onSwitchToHistory={() => navigateTo('history')}
              onFoodItemsUpdated={() => refreshAllData()}
            />
          )}

          {currentTab === 'history' && (
            <ChatHistoryScreen
              history={aiHistory}
              onSwitchToChat={() => {
                setAiInitialTopic(null);
                navigateTo('ai');
              }}
            />
          )}

          {currentTab === 'compost' && (
            <CompostPreviewScreen
              batches={compostBatches}
              harvestHistory={harvestHistory}
              impact={impactStats}
              onBatchesUpdated={() => refreshAllData()}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              user={user}
              onUserUpdate={(updated) => setUser(updated)}
              onRequestLogout={() => setShowLogoutDialog(true)}
              onResetData={handleResetDemoData}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        {currentTab !== 'notifications' && (
          <BottomNavBar
            activeTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'ai') setAiInitialTopic(null);
              navigateTo(tab);
            }}
            onOpenScan={() => setShowScanModal(true)}
          />
        )}

        {/* Logout Confirmation Dialog Modal */}
        <LogoutDialog
          isOpen={showLogoutDialog}
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={handleConfirmLogout}
        />

        {/* Teammate Scan Struk Modal */}
        {showScanModal && (
          <ScanModal
            onClose={() => setShowScanModal(false)}
            onOpenManual={() => {
              setShowScanModal(false);
              setManualInitialTab('raw');
              setShowManualModal(true);
            }}
            onSavedToFridge={() => {
              refreshAllData();
              setShowScanModal(false);
              navigateTo('pantry');
            }}
          />
        )}

        {/* Teammate Manual Input Modal */}
        {showManualModal && (
          <ManualInputModal
            initialTab={manualInitialTab}
            onClose={() => setShowManualModal(false)}
            onSavedToFridge={() => {
              refreshAllData();
              setShowManualModal(false);
              navigateTo('pantry');
            }}
          />
        )}
      </div>
    </div>
  );
}
