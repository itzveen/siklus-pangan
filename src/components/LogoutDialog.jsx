import React from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Top Logout Icon Circle */}
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 ring-8 ring-rose-50/50">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Keluar dari EatWise?
        </h3>

        {/* Modal Body */}
        <p className="mt-2.5 text-xs text-slate-500 leading-relaxed max-w-[280px]">
          Data stok kulkas tersimpan aman di perangkat lokal Anda. Kamu bisa masuk lagi kapan saja dengan Google.
        </p>

        {/* Actions Row */}
        <div className="mt-6 flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-700/20 transition-all active:scale-[0.98]"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
