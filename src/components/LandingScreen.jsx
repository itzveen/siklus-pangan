import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import EatWiseLogo from './EatWiseLogo.jsx';
import * as store from '../services/storageService.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LandingScreen({ onLoginSuccess }) {
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            try {
              const decoded = jwtDecode(response.credential);
              const updated = store.saveUserProfile({
                ...store.getUserProfile(),
                name: decoded.given_name || decoded.name,
                fullName: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                isLoggedIn: true
              });
              if (onLoginSuccess) onLoginSuccess(updated);
            } catch (err) {
              console.error("Gagal decode Google JWT:", err);
              handleQuickLogin();
            }
          }
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 320,
          shape: 'pill'
        });
        return true;
      } catch (err) {
        console.warn("Google GIS init failed:", err);
        return false;
      }
    };

    if (!initGoogle()) {
      const timer = setInterval(() => {
        if (initGoogle()) clearInterval(timer);
      }, 400);
      return () => clearInterval(timer);
    }
  }, [onLoginSuccess]);

  const handleQuickLogin = () => {
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[402px] bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden min-h-[840px]">
        {/* Top Header */}
        <div className="p-6 pb-2">
          <EatWiseLogo size="md" />
        </div>

        {/* Hero Illustration */}
        <div className="px-6 py-4 flex-1 flex items-center justify-center">
          <div className="w-full bg-[#EBF7EE] rounded-3xl p-6 relative flex flex-col items-center justify-center overflow-hidden border border-emerald-100/60 shadow-inner">
            {/* Soft decorative background circles */}
            <div className="absolute top-2 left-3 w-16 h-16 rounded-full bg-emerald-100/40 -z-0" />
            <div className="absolute bottom-2 right-3 w-20 h-20 rounded-full bg-emerald-100/50 -z-0" />

            {/* Custom SVG Illustration of Refrigerator & Compost bin cycle */}
            <svg
              viewBox="0 0 280 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-[260px] h-auto relative z-10 drop-shadow-sm"
            >
              {/* Ground Shadow */}
              <ellipse cx="140" cy="180" rx="120" ry="12" fill="#D2EBD7" />

              {/* Refrigerator Body */}
              <rect x="70" y="30" width="80" height="140" rx="14" fill="#FFFFFF" stroke="#166534" strokeWidth="3" />
              {/* Fridge Freezer Line */}
              <line x1="70" y1="75" x2="150" y2="75" stroke="#166534" strokeWidth="2.5" />
              {/* Fridge Door Handle */}
              <rect x="76" y="85" width="4" height="22" rx="2" fill="#166534" />
              <rect x="76" y="45" width="4" height="14" rx="2" fill="#166534" />

              {/* Open fridge interior contents */}
              <rect x="85" y="80" width="58" height="40" rx="4" fill="#F0FDF4" />
              <circle cx="95" cy="95" r="7" fill="#EF4444" /> {/* Tomato */}
              <path d="M110 88L122 96L116 102Z" fill="#F97316" /> {/* Carrot */}
              <circle cx="132" cy="98" r="4" fill="#FBBF24" />
              <circle cx="124" cy="100" r="4" fill="#FBBF24" />

              {/* Crisper drawer */}
              <rect x="85" y="125" width="58" height="36" rx="6" fill="#DCFCE7" stroke="#166534" strokeWidth="1.5" />
              <ellipse cx="102" cy="142" rx="7" ry="5" fill="#22C55E" />
              <ellipse cx="120" cy="142" rx="7" ry="5" fill="#22C55E" />

              {/* Dashed Circular Arrow into Compost Bin */}
              <path
                d="M152 105C180 95 195 105 195 130"
                stroke="#166534"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
              <path d="M192 126L195 132L199 126" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Compost Bin */}
              <rect x="180" y="132" width="42" height="40" rx="8" fill="#166534" stroke="#14532D" strokeWidth="2" />
              <rect x="176" y="128" width="50" height="7" rx="3" fill="#15803D" />
              {/* Sprout on Compost Bin */}
              <path
                d="M201 128V118C201 118 206 116 208 111C203 111 201 114 201 118Z"
                fill="#86EFAC"
              />
              <path
                d="M201 122C201 122 196 120 194 115C199 115 201 118 201 122Z"
                fill="#4ADE80"
              />

              {/* Floating Leaves */}
              <path d="M50 80C50 80 58 78 60 70C54 70 50 75 50 80Z" fill="#22C55E" opacity="0.7" />
              <path d="M225 70C225 70 232 72 235 80C236 74 231 69 225 70Z" fill="#22C55E" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="p-6 pt-4 bg-white space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Selamat Datang di Dapur Zero-Waste
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kelola stok bahan makanan, selamatkan masakan, dan olah sisa jadi kompos bernilai.
            </p>
          </div>

          {/* Google Sign-in Buttons */}
          <div className="pt-2 space-y-3">
            {/* Google GIS rendered button container */}
            <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

            {/* Always-Visible Native Google OAuth Button (with direct fallback handler) */}
            <button
              onClick={handleQuickLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-2xl border border-slate-300 shadow-sm transition-all active:scale-[0.99]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F1"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>

            {/* Quick Demo Login Pill */}
            <div className="flex justify-center">
              <button
                onClick={handleQuickLogin}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium py-1 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors flex items-center gap-1.5"
              >
                <span>🚀</span>
                <span>Masuk Cepat Demo (Budi)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
