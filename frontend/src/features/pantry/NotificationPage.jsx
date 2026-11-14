import React from 'react';
import * as store from '../../../../backend/services/storageService.js';
import { fetchFromBackend } from '../../config/api.js';

// Icons from Figma node 43:195
import notifBack from '../../assets/figma/notif_back.svg';
import notifWarning from '../../assets/figma/notif_warning.svg';
import notifExpired from '../../assets/figma/notif_expired.svg';
import notifLeaf from '../../assets/figma/notif_leaf.svg';
import notifClock from '../../assets/figma/notif_clock.svg';

export default function NotificationScreen({
  notifications = [],
  onBack,
  onNotificationsUpdated
}) {
  const handleMarkAllRead = async () => {
    const res = await fetchFromBackend('/notifications/read-all', { method: 'PATCH' });
    if (onNotificationsUpdated) onNotificationsUpdated(res?.notifications || []);
  };

  const handleItemClick = (notif) => {
    if (notif.unread) {
      const updated = store.markNotificationRead(notif.id);
      if (onNotificationsUpdated) onNotificationsUpdated(updated);
    }
  };

  const todayNotifs = notifications.filter(n => n.group === 'HARI INI');
  const earlierNotifs = notifications.filter(n => n.group !== 'HARI INI');
  const hasUnread = notifications.some(n => n.unread);

  const getNotifIcon = (type) => {
    if (type === 'warning') {
      return (
        <div className="w-[40px] h-[40px] rounded-[16px] bg-[#fef3c7] flex items-center justify-center flex-shrink-0">
          <img src={notifWarning} alt="Warning" className="w-[20px] h-[20px]" />
        </div>
      );
    }
    if (type === 'spoiled' || type === 'expired') {
      return (
        <div className="w-[40px] h-[40px] rounded-[16px] bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
          <img src={notifExpired} alt="Basi" className="w-[20px] h-[20px]" />
        </div>
      );
    }
    if (type === 'compost' || type === 'compost_progress') {
      return (
        <div className="w-[40px] h-[40px] rounded-[16px] bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
          <img src={notifLeaf} alt="Kompos" className="w-[20px] h-[20px]" />
        </div>
      );
    }
    return (
      <div className="w-[40px] h-[40px] rounded-[16px] bg-[#e0f2fe] flex items-center justify-center flex-shrink-0">
        <img src={notifClock} alt="Pengingat" className="w-[20px] h-[20px]" />
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-screen pb-16 pt-6 px-5 space-y-6"
      style={{
        backgroundColor: '#f8fff4',
        fontFamily: 'Poppins, sans-serif'
      }}
      data-node-id="43:195"
      data-name="Notification"
    >
      {/* ── Header: Back button + Title & Subtitle ── */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onBack}
          className="w-[44px] h-[44px] rounded-full bg-white border border-[#e2ece2] flex items-center justify-center shadow-xs active:scale-95 transition-all flex-shrink-0"
          aria-label="Kembali"
        >
          <img src={notifBack} alt="Kembali" className="w-[20px] h-[20px]" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[#1f2937] tracking-tight leading-tight">
            Notifikasi
          </h1>
          <p className="text-[13px] text-[#4b5563] mt-0.5">
            Pengingat bahan dan kompos
          </p>
        </div>
      </div>

      {/* ── Section 1: HARI INI ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[12px] font-extrabold text-[#374151] tracking-[0.6px] uppercase">
            HARI INI
          </h2>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] font-bold text-[#147a39] hover:underline active:scale-95 transition-all"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="space-y-3">
          {todayNotifs.length === 0 ? (
            <div className="bg-white border border-[#dcede0] rounded-[22px] p-4 text-center text-[12px] text-[#4b5563]">
              Tidak ada notifikasi hari ini.
            </div>
          ) : (
            todayNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className="bg-white border border-[#dcede0] rounded-[22px] p-[17px] flex items-start gap-3.5 relative shadow-xs hover:border-[#147a39]/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                {getNotifIcon(notif.type)}

                <div className="flex-1 pr-3 space-y-1">
                  <h3 className="text-[13.5px] font-bold text-[#1e293b] leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-[12px] text-[#475569] leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-[#64748b] pt-0.5">
                    {notif.time || '08:00 WIB'}
                  </p>
                </div>

                {/* Red unread indicator dot (8x8) */}
                {notif.unread && (
                  <span className="absolute top-4 right-4 w-[8px] h-[8px] rounded-full bg-[#ef4444]" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Section 2: SEBELUMNYA ── */}
      <div className="space-y-3">
        <div className="px-0.5">
          <h2 className="text-[12px] font-extrabold text-[#374151] tracking-[0.6px] uppercase">
            SEBELUMNYA
          </h2>
        </div>

        <div className="space-y-3">
          {earlierNotifs.length === 0 ? (
            <div className="bg-white border border-[#dcede0] rounded-[22px] p-4 text-center text-[12px] text-[#4b5563]">
              Belum ada notifikasi sebelumnya.
            </div>
          ) : (
            earlierNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className="bg-white border border-[#dcede0] rounded-[22px] p-[17px] flex items-start gap-3.5 relative shadow-xs hover:border-[#147a39]/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                {getNotifIcon(notif.type)}

                <div className="flex-1 pr-3 space-y-1">
                  <h3 className="text-[13.5px] font-bold text-[#1e293b] leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-[12px] text-[#475569] leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-[#64748b] pt-0.5">
                    {notif.time || 'Kemarin'}
                  </p>
                </div>

                {/* Red unread dot if unread */}
                {notif.unread && (
                  <span className="absolute top-4 right-4 w-[8px] h-[8px] rounded-full bg-[#ef4444]" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
