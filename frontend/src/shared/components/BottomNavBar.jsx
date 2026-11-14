import React from 'react';

// Navigation assets from Figma node 16:523
import navChat from '../../assets/figma/nav_chat.png';
import navScan from '../../assets/figma/nav_scan.svg';
import navKompos from '../../assets/figma/nav_kompos.svg';
import navSettings from '../../assets/figma/nav_settings.svg';

export default function BottomNavBar({ activeTab, onSelectTab, onOpenScan }) {
  const pillClass = (tab) =>
    activeTab === tab
      ? 'bg-[#dcfce7] h-[28px] w-[52px] rounded-[999px] flex items-center justify-center transition-all'
      : 'h-[28px] w-[52px] rounded-[999px] flex items-center justify-center transition-all';

  const labelClass = (tab) =>
    `text-[10px] tracking-tight mt-0.5 ${
      activeTab === tab ? 'font-extrabold text-[#0e7a37]' : 'font-bold text-[#4b5563]'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#cdebd3]/60 max-w-[402px] mx-auto shadow-md">
      <div className="flex items-center justify-between px-4 h-[71px] relative">
        {/* 1. Pantry */}
        <button
          type="button"
          onClick={() => onSelectTab('pantry')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className={pillClass('pantry')}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 16L9 14M9 14L16 7L23 14M9 14V24C9 24.5519 9.44808 25 10 25H13M23 14L25 16M23 14V24C23 24.5519 22.5519 25 22 25H19M13 25C13.5519 25 14 24.5519 14 24V20C14 19.4481 14.4481 19 15 19H17C17.5519 19 18 19.4481 18 20V24C18 24.5519 18.4481 25 19 25M13 25H19"
                stroke={activeTab === 'pantry' ? '#0e7a37' : '#4b5563'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={labelClass('pantry')} style={{ fontFamily: 'Poppins, sans-serif' }}>
            Pantry
          </span>
        </button>

        {/* 2. Tanya AI */}
        <button
          type="button"
          onClick={() => onSelectTab('ai')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className={pillClass('ai')}>
            <img src={navChat} alt="Tanya AI" className="w-[26px] h-[22px] object-contain" />
          </div>
          <span className={labelClass('ai')} style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tanya AI
          </span>
        </button>

        {/* 3. Scan (Center Elevated Action Button) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenScan}
            className="w-[56px] h-[56px] rounded-full bg-[#0e7a37] border-[3px] border-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
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

        {/* 4. Upcycle */}
        <button
          type="button"
          onClick={() => onSelectTab('compost')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className={pillClass('compost')}>
            <img src={navKompos} alt="Upcycle" className="w-[22px] h-[22px]" />
          </div>
          <span className={`${labelClass('compost')} whitespace-nowrap`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            Upcycle
          </span>
        </button>

        {/* 5. Atur */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className="flex flex-col items-center justify-center w-[56px] transition-all"
        >
          <div className={pillClass('settings')}>
            <img src={navSettings} alt="Atur" className="w-[22px] h-[22px]" />
          </div>
          <span className={labelClass('settings')} style={{ fontFamily: 'Poppins, sans-serif' }}>
            Atur
          </span>
        </button>
      </div>
    </nav>
  );
}
