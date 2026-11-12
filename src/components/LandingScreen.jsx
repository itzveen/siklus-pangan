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
      className="min-h-screen flex items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: '#f8fff4' }}
    >
      {/* Mobile Frame Container: 402px wide, matching Figma node 8:10 */}
      <div
        className="w-full max-w-[402px] min-h-screen sm:min-h-[874px] sm:rounded-[40px] relative overflow-hidden flex flex-col justify-between"
        style={{ backgroundColor: '#f8fff4' }}
        data-node-id="8:10"
        data-name="Landing Screen"
      >
        {/* ── Top Header Logo: "EatWise" ── */}
        <div className="pt-6 px-6 flex items-center gap-2">
          {/* Logo icon with green gradient rounded background (38x36 rotated) */}
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

          {/* Logo text: "Eat" #006d2c + "Wise" #28c92a (Poppins Bold 21px) */}
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

        {/* ── Center: Kulkas & Kompos Cycle Illustration ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div
            className="relative w-[286px] h-[252px] rounded-[28px] overflow-hidden flex items-center justify-center"
            style={{
              boxShadow: '0 4px 20px rgba(0, 109, 44, 0.05)'
            }}
          >
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
        </div>

        {/* ── Bottom White Card ── */}
        <div className="px-5 pb-6">
          <div
            className="bg-white rounded-[30px] p-7 border border-[#cdebd3] shadow-sm flex flex-col justify-between"
            style={{ minHeight: 317 }}
          >
            {/* Title & Description */}
            <div className="space-y-3">
              <h1
                className="font-bold text-black text-[23px] leading-[1.25] tracking-tight"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Selamat Datang di<br />Dapur Zero-Waste
              </h1>
              <p
                className="text-[#4b5563] text-[15px] leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Kelola stok bahan makanan, selamatkan masakan, dan olah sisa jadi kompos bernilai.
              </p>
            </div>

            {/* Google Login Button */}
            <div className="pt-5">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-[22px] bg-white hover:bg-slate-50 active:scale-[0.98] transition-all border border-[#0b6623] shadow-sm"
                style={{
                  fontFamily: 'Poppins, sans-serif'
                }}
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
      </div>
    </div>
  );
}
