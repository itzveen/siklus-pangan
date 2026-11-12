import React from 'react';
import EatWiseLogo from './EatWiseLogo.jsx';
import { Bell } from 'lucide-react';

export default function TopHeader({
  user,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSettings
}) {
  return (
    <header className="w-full flex items-center justify-between py-3 px-4 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
      {/* Brand Logo */}
      <EatWiseLogo size="md" />

      {/* Right Controls: Notification Bell + Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-700 border border-slate-200/80"
          title="Notifikasi"
          aria-label="Lihat Notifikasi"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* User Avatar */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-800 text-white font-bold text-sm shadow-sm overflow-hidden border-2 border-emerald-600 hover:opacity-90 active:scale-95 transition-all"
          title="Pengaturan Profil"
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
