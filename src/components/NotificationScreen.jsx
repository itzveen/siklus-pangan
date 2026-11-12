import React from 'react';
import { ArrowLeft, AlertTriangle, AlertCircle, Sprout, Clock, CheckCheck } from 'lucide-react';
import * as store from '../services/storageService.js';

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
      // Mark this specific notification as read in storage
      const all = store.getNotifications();
      const updated = all.map(n => n.id === notif.id ? { ...n, unread: false } : n);
      localStorage.setItem('siklus_notifs_v2', JSON.stringify(updated));
      if (onNotificationsUpdated) onNotificationsUpdated(updated);
    }

    if (onTriggerAction) {
      onTriggerAction(notif.actionType || notif.type);
    }
  };

  const todayNotifs = notifications.filter(n => n.group === 'HARI INI');
  const earlierNotifs = notifications.filter(n => n.group !== 'HARI INI');

  const renderIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'spoiled':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'compost_progress':
      case 'compost':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="pb-20 pt-3 px-4 space-y-6 max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 active:scale-95 transition-all shadow-xs"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Notifikasi
          </h1>
          <p className="text-xs text-slate-500">
            Pengingat bahan dan kompos
          </p>
        </div>
      </div>

      {/* 1. HARI INI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            HARI INI
          </span>
          {notifications.some(n => n.unread) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai semua dibaca</span>
            </button>
          )}
        </div>

        {todayNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-400 border border-slate-100">
            Tidak ada notifikasi hari ini.
          </div>
        ) : (
          todayNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-start gap-3.5 relative cursor-pointer active:scale-[0.99]"
            >
              {renderIcon(notif.type)}

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between pr-4">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {notif.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {notif.message}
                </p>
                <div className="pt-1 text-[11px] text-slate-400 font-medium">
                  {notif.time || '08:00 WIB'}
                </div>
              </div>

              {/* Red unread indicator dot */}
              {notif.unread && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>

      {/* 2. SEBELUMNYA */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          SEBELUMNYA
        </span>

        {earlierNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-400 border border-slate-100">
            Belum ada notifikasi sebelumnya.
          </div>
        ) : (
          earlierNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-start gap-3.5 relative cursor-pointer active:scale-[0.99]"
            >
              {renderIcon(notif.type)}

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between pr-4">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {notif.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {notif.message}
                </p>
                <div className="pt-1 text-[11px] text-slate-400 font-medium">
                  {notif.time || 'Kemarin'}
                </div>
              </div>

              {notif.unread && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
