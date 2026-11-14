import React from 'react';
import logoutDoor from '../../assets/figma/logout_door.svg';

/**
 * Figma node 45:921 - LogoutDialogCard
 * Component for confirming user logout with smooth backdrop and authentic design.
 */
export default function LogoutDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity"
      data-node-id="45:920"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[342px] bg-white rounded-[32px] p-6 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
        data-node-id="45:921"
        data-name="LogoutDialogCard"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/* Soft Pink/Red Circle Badge with Exit Door */}
        <div
          className="w-[56px] h-[56px] rounded-full bg-[#fde8e8] flex items-center justify-center mb-4 mt-2"
          data-node-id="45:924"
        >
          <img
            src={logoutDoor}
            alt="Logout Icon"
            className="w-[28px] h-[28px] block"
            data-node-id="45:925"
          />
        </div>

        {/* Dialog Title */}
        <h3
          className="text-[21px] font-extrabold text-[#111827] tracking-[-0.525px] leading-tight mb-3"
          data-node-id="45:931"
        >
          Keluar dari EatWise?
        </h3>

        {/* Dialog Description */}
        <p
          className="text-[13px] font-medium text-[#4b5563] leading-[20.8px] mb-6 max-w-[270px]"
          data-node-id="45:934"
        >
          Data stok kulkas tersimpan aman di perangkat lokal Anda. Kamu bisa masuk lagi kapan saja dengan Google.
        </p>

        {/* Action Buttons */}
        <div
          className="flex items-center justify-center gap-3 w-full"
          data-node-id="45:935"
        >
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-full border border-[#15803d] text-[#15803d] font-bold text-[14px] hover:bg-emerald-50 active:scale-95 transition-all"
            data-node-id="45:936"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-full bg-[#b91c1c] text-white font-bold text-[14px] shadow-[0px_4px_6px_-1px_rgba(127,29,29,0.2)] hover:bg-red-800 active:scale-95 transition-all"
            data-node-id="45:938"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
