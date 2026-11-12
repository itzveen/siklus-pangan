import React from 'react';
import landingIcon from '../assets/figma/landing_icon.svg';
import dashBell from '../assets/figma/dash_bell.svg';

export default function TopHeader({
  user,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSettings
}) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 bg-[#f8fff4] sticky top-0 z-30">
      {/* ── Brand Logo ── */}
      <div className="flex items-center gap-2">
        <div
          className="w-[38px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #28c92a 0%, #006d2c 51%, #0b6623 100%)'
          }}
        >
          <img
            src={landingIcon}
            alt="EatWise Icon"
            className="w-[28px] h-[27px] block"
          />
        </div>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 21,
            lineHeight: 'normal',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: '#006d2c' }}>Eat</span>
          <span style={{ color: '#28c92a' }}>Wise</span>
        </div>
      </div>

      {/* ── Right Controls: Notification Bell + Avatar ── */}
      <div className="flex items-center gap-2.5">
        {/* Bell Button (50x50 white circle in Figma with shadow) */}
        <button
          onClick={onOpenNotifications}
          className="relative w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center border border-[#cdebd3] shadow-xs active:scale-95 transition-all"
          aria-label="Lihat Notifikasi"
        >
          <img src={dashBell} alt="Notifikasi" className="w-[20px] h-[22px] block" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-[9px] h-[9px] rounded-full border border-white"
              style={{ backgroundColor: '#ba1a1a' }}
            />
          )}
        </button>

        {/* User Avatar (Circle with green background and white bold initial) */}
        <button
          onClick={onOpenSettings}
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-bold text-[20px] shadow-xs overflow-hidden active:scale-95 transition-all"
          style={{
            backgroundColor: '#00652c',
            fontFamily: 'Poppins, sans-serif'
          }}
          aria-label="Buka Pengaturan"
        >
          {user?.picture ? (
            <img src={user.picture} alt={user.name || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span>{(user?.name || 'B')[0].toUpperCase()}</span>
          )}
        </button>
      </div>
    </header>
  );
}
