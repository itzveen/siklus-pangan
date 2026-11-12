import React from 'react';
import { Home, Sparkles, Camera, Sprout, Settings } from 'lucide-react';

export default function BottomNavBar({ activeTab, onSelectTab, onOpenScan }) {
  const tabs = [
    { id: 'pantry', label: 'Pantry', icon: Home },
    { id: 'ai', label: 'Tanya AI', icon: Sparkles },
    { id: 'scan', label: 'Scan', icon: Camera, isCenter: true },
    { id: 'compost', label: 'Kompos', icon: Sprout },
    { id: 'settings', label: 'Atur', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 max-w-[440px] mx-auto shadow-lg">
      <div className="flex items-center justify-around px-2 py-1.5 h-16 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <div key={tab.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={onOpenScan}
                  className="w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 ring-4 ring-white active:scale-95 transition-all"
                  aria-label="Scan Struk / AI"
                >
                  <Icon className="w-7 h-7" />
                </button>
                <span className="text-[10px] font-bold text-emerald-800 mt-1">Scan</span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
                isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
