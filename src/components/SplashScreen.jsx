import React, { useEffect, useState } from 'react';
import splashScreenImg from '../assets/figma/splash_screen_figma.png';

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 350);
    }, 2200);

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
      className={`w-full h-full min-h-[874px] flex items-center justify-center cursor-pointer select-none relative overflow-hidden transition-opacity duration-300 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#f8fff4' }}
    >
      <img
        src={splashScreenImg}
        alt="EatWise Splash Screen"
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}
