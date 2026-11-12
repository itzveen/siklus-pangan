import React from 'react';
import * as store from '../services/storageService.js';

// Assets from Figma node 8:10 "Landing Screen"
import landingIcon from '../assets/figma/landing_icon.svg';
import landingBg from '../assets/figma/landing_bg.svg';
import landingFridge from '../assets/figma/landing_fridge.svg';
import landingGoogle from '../assets/figma/landing_google.svg';

export default function LandingScreen({ onLoginSuccess }) {
  const handleGoogleLogin = () => {
    const defaultProfile = store.getUserProfile();
    const updated = store.saveUserProfile({
      ...defaultProfile,
      name: defaultProfile.name || 'Budi',
      fullName: defaultProfile.fullName || 'Budi Santoso',
      email: defaultProfile.email || 'budi@gmail.com',
      isLoggedIn: true
    });
    if (onLoginSuccess) onLoginSuccess(updated);
  };

  return (
    <div
      className="w-full h-full min-h-[874px] relative overflow-hidden"
      style={{
        backgroundColor: '#f8fff4',
        fontFamily: 'Poppins, sans-serif'
      }}
      data-node-id="8:10"
      data-name="Landing Screen"
    >
      {/* ── 1. Top Logo EatWise (Figma node 16:373 & 16:397) ── */}
      <div className="absolute top-[24px] left-[26px] flex items-center gap-2 z-10">
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

      {/* ── 2. Center Illustration (Figma node 16:399: top 185px, 286x252px) ── */}
      <div className="absolute top-[185px] left-1/2 -translate-x-1/2 w-[286px] h-[252px] rounded-[28px] overflow-hidden flex items-center justify-center z-10">
        {/* Background container SVG */}
        <img
          src={landingBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Vector illustration of fridge, fruit, and compost bin */}
        <img
          src={landingFridge}
          alt="EatWise Refrigerator & Compost Cycle"
          className="relative z-10 w-[115%] h-[115%] max-w-none object-contain"
        />
      </div>

      {/* ── 3. Bottom White Card (Figma node 16:439: top 501px, 351x317px, rounded 30px) ── */}
      <div
        className="absolute top-[501px] left-1/2 -translate-x-1/2 w-[351px] h-[317px] bg-white border border-[#cdebd3] rounded-[30px] p-6 flex flex-col justify-between shadow-xs z-10"
      >
        {/* Heading & Subtitle */}
        <div className="space-y-3 pt-2">
          <h1 className="font-bold text-black text-[23px] leading-[1.25] tracking-tight">
            Selamat Datang di<br />Dapur Zero-Waste
          </h1>
          <p className="text-[#4b5563] text-[15px] leading-relaxed">
            Kelola stok bahan makanan, selamatkan masakan, dan olah sisa jadi kompos bernilai.
          </p>
        </div>

        {/* Google Login Button (Figma node 16:508: top 737px, 279px width, rounded 22px) */}
        <div className="pb-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-[22px] bg-[rgba(255,255,255,0.9)] hover:bg-slate-50 active:scale-[0.98] transition-all border border-[#0b6623] shadow-xs"
          >
            <img
              src={landingGoogle}
              alt="Google"
              className="w-4 h-4 flex-shrink-0"
            />
            <span className="text-[#14532d] text-[14px] font-medium">
              Masuk dengan Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
