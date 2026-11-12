import React from 'react';
import EatWiseLogo from './EatWiseLogo.jsx';
import * as store from '../services/storageService.js';

// Figma Notification Screen - node-id=43-195
// - Header: left arrow back + title "Notifikasi" + "Tandai semua dibaca" link (top-right)
// - Sections: HARI INI, SEBELUMNYA
// - Each item: colored icon square, title bold, message text, time small + unread red dot
export default function NotificationScreen({
  notifications = [],
  onBack,
  onNotificationsUpdated,
  onTriggerAction
}) {
  const handleMarkAllRead = () => {
    const updated = store.markAllNotificationsRead();
    if (onNotificationsUpdated) onNotificationsUpdated(updated);
  };

  const handleItemClick = (notif) => {
    if (notif.unread) {
      const all = store.getNotifications();
      const updated = all.map(n => n.id === notif.id ? { ...n, unread: false } : n);
      localStorage.setItem('siklus_notifs_v2', JSON.stringify(updated));
      if (onNotificationsUpdated) onNotificationsUpdated(updated);
    }
    if (onTriggerAction) onTriggerAction(notif.actionType || notif.type);
  };

  const todayNotifs    = notifications.filter(n => n.group === 'HARI INI');
  const earlierNotifs  = notifications.filter(n => n.group !== 'HARI INI');
  const hasUnread      = notifications.some(n => n.unread);

  const renderIcon = (type) => {
    if (type === 'warning') return (
      <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5L16.5 15H1.5L9 1.5Z" stroke="#B45309" strokeWidth="1.6" strokeLinejoin="round"/>
          <line x1="9" y1="7" x2="9" y2="10.5" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="9" cy="12.5" r="0.8" fill="#B45309"/>
        </svg>
      </div>
    );
    if (type === 'spoiled') return (
      <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#DC2626" strokeWidth="1.6"/>
          <line x1="9" y1="6" x2="9" y2="10" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="9" cy="12" r="0.8" fill="#DC2626"/>
        </svg>
      </div>
    );
    if (type === 'compost_progress' || type === 'compost') return (
      <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 3C9 3 6.5 5.5 6.5 9C6.5 10.93 7.93 12.5 10 12.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M9 3C9 3 11.5 5.5 11.5 9C11.5 10.93 10.07 12.5 8 12.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M9 12.5V16" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
    // default reminder/clock
    return (
      <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#6B7280" strokeWidth="1.6"/>
          <path d="M9 5.5V9L11.5 11" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  const NotifItem = ({ notif }) => (
    <div
      onClick={() => handleItemClick(notif)}
      className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-start gap-3 relative cursor-pointer active:scale-[0.99] transition-all hover:border-[#CBD5E1]"
    >
      {renderIcon(notif.type)}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-bold text-sm text-[#111827] leading-snug">{notif.title}</h4>
        <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{notif.message}</p>
        <p className="text-[11px] text-[#9CA3AF] mt-1 font-medium">{notif.time || '08:00 WIB'}</p>
      </div>
      {notif.unread && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#EF4444] rounded-full" />
      )}
    </div>
  );

  return (
    <div className="pb-20 max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center active:scale-95 transition-all shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11.25 14.25L6.75 9L11.25 3.75" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-[#111827] tracking-tight">Notifikasi</h1>
            <p className="text-xs text-[#9CA3AF]">Pengingat bahan dan kompos</p>
          </div>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#15803D] hover:text-[#166534] flex items-center gap-1 active:scale-95 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7L4.5 10.5L13 2.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 7L9 10.5L13 5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
            <span>Tandai semua dibaca</span>
          </button>
        )}
      </div>

      <div className="px-4 space-y-5">
        {/* HARI INI */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#9CA3AF] tracking-widest uppercase">HARI INI</span>
          {todayNotifs.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center text-xs text-[#9CA3AF] border border-[#F1F5F9]">
              Tidak ada notifikasi hari ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayNotifs.map(notif => <NotifItem key={notif.id} notif={notif} />)}
            </div>
          )}
        </div>

        {/* SEBELUMNYA */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#9CA3AF] tracking-widest uppercase">SEBELUMNYA</span>
          {earlierNotifs.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center text-xs text-[#9CA3AF] border border-[#F1F5F9]">
              Belum ada notifikasi sebelumnya.
            </div>
          ) : (
            <div className="space-y-2.5">
              {earlierNotifs.map(notif => <NotifItem key={notif.id} notif={notif} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
