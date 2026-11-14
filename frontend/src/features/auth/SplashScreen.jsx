import React, { useEffect, useState } from 'react';
import landingIcon from '../../assets/figma/landing_icon.svg';

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 350);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleTap = () => {
    setFade(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 150);
  };

  return (
    <div
      onClick={handleTap}
      className={`w-full h-full min-h-[874px] flex flex-col items-center justify-center cursor-pointer select-none relative overflow-hidden transition-opacity duration-300 bg-[#f8fff4] ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
      data-node-id="1:2"
      data-name="Splash Screen"
    >
      {/* Green Rounded Squircle Logo (Figma node 3:2 & 7:2) */}
      <div className="relative flex items-center justify-center mb-6">
        <div
          className="w-[128px] h-[124px] rounded-[40px] flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #28c92a 0%, #006d2c 70%, #0b6623 100%)'
          }}
        >
          <img
            src={landingIcon}
            alt="EatWise Icon"
            className="w-[92px] h-[92px] object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Brand Name (Figma node 9:63) */}
      <h1 className="font-bold text-[45px] leading-none tracking-tight">
        <span className="text-[#006d2c]">Eat</span>
        <span className="text-[#28c92a]">Wise</span>
      </h1>

      {/* Tagline (Figma node 9:64) */}
      <p className="italic text-[12px] text-[#006d2c] mt-2.5">
        Kelola Makanan, Kurangi Terbuang.
      </p>
    </div>
  );
}
