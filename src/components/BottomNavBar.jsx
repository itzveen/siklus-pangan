import React from 'react';

// Navigation assets from Figma node 16:523
import navPantry from '../assets/figma/nav_pantry.svg';
import navChat from '../assets/figma/nav_chat.png';
import navScan from '../assets/figma/nav_scan.svg';
import navKompos from '../assets/figma/nav_kompos.svg';
import navSettings from '../assets/figma/nav_settings.svg';

export default function BottomNavBar({ activeTab, onSelectTab, onOpenScan }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#cdebd3]/60 max-w-[402px] mx-auto shadow-md">
      <div className="flex items-center justify-between px-4 h-[71px] relative">
        {/* 1. Pantry */}
        <button
          onClick={() => onSelectTab('pantry')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className="w-[30px] h-[30px] flex items-center justify-center">
            <img src={navPantry} alt="Pantry" className="w-[24px] h-[24px]" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'pantry' ? 'font-extrabold text-[#0e7a37]' : 'font-bold text-[#4b5563]'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Pantry
          </span>
        </button>

        {/* 2. Tanya AI */}
        <button
          onClick={() => onSelectTab('ai')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className="w-[30px] h-[26px] flex items-center justify-center">
            <img src={navChat} alt="Tanya AI" className="w-[26px] h-[22px] object-contain" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'ai' ? 'font-extrabold text-[#0e7a37]' : 'font-bold text-[#4b5563]'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Tanya AI
          </span>
        </button>

        {/* 3. Scan (Center Elevated Action Button) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenScan}
            className="w-[56px] h-[56px] rounded-full bg-[#0e7a37] border-3 border-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
            style={{
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)'
            }}
            aria-label="Scan AI"
          >
            <img src={navScan} alt="Scan" className="w-[24px] h-[24px]" />
          </button>
          <span
            className="text-[10px] font-bold text-[#0e7a37] mt-1"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Scan
          </span>
        </div>

        {/* 4. Kompos */}
        <button
          onClick={() => onSelectTab('compost')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className="w-[30px] h-[30px] flex items-center justify-center">
            <img src={navKompos} alt="Kompos" className="w-[22px] h-[22px]" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'compost' ? 'font-extrabold text-[#0e7a37]' : 'font-bold text-[#4b5563]'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Kompos
          </span>
        </button>

        {/* 5. Atur */}
        <button
          onClick={() => onSelectTab('settings')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className="w-[30px] h-[30px] flex items-center justify-center">
            <img src={navSettings} alt="Atur" className="w-[22px] h-[22px]" />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'settings' ? 'font-extrabold text-[#0e7a37]' : 'font-bold text-[#4b5563]'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Atur
          </span>
        </button>
      </div>
    </nav>
  );
}
