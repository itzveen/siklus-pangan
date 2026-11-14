import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo.jsx';
import dashBell from '../../assets/figma/dash_bell.svg';

export default function TopHeader({
  user,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSettings
}) {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);
  return (
    <header className="w-full flex items-center justify-between py-4 px-5 bg-[#f8fff4] sticky top-0 z-30">
      {/* ── Brand Logo ── */}
      <BrandLogo />

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
          {user?.picture && !avatarError ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{(user?.name || 'U')[0].toUpperCase()}</span>
          )}
        </button>
      </div>
    </header>
  );
}
