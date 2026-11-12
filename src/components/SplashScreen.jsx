import React, { useEffect, useState } from 'react';
import EatWiseLogo from './EatWiseLogo.jsx';

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFade(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFDFA] cursor-pointer transition-opacity duration-400 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <EatWiseLogo size="xl" showText={false} className="mb-4" />

        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">Eat</span>
          <span className="text-3xl font-extrabold tracking-tight text-emerald-600 relative">
            Wise
            <span className="absolute -top-1 -right-2.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-2.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
        </div>

        <p className="mt-3 text-xs tracking-wide text-slate-500 font-medium">
          Kelola Makanan, Kurangi Terbuang.
        </p>

        {/* Subtle loader pulse dots */}
        <div className="flex gap-1.5 mt-10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
