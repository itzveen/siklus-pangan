import React from 'react';
import landingIcon from '../../assets/figma/landing_icon.svg';

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-[38px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #28c92a 0%, #006d2c 51%, #0b6623 100%)'
        }}
      >
        <img
          src={landingIcon}
          alt="EatWise Icon"
          className="w-[26px] h-[26px] block"
        />
      </div>
      <div
        className="font-bold text-[21px] leading-normal whitespace-nowrap"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <span style={{ color: '#006d2c' }}>Eat</span>
        <span style={{ color: '#28c92a' }}>Wise</span>
      </div>
    </div>
  );
}
