import React from 'react';

// Figma exact logo: green rounded icon + "EatWise" text in green
export default function EatWiseLogo({ size = 'md', className = '', showText = true }) {
  const configs = {
    xs:  { icon: 'w-6 h-6',  text: 'text-sm',   gap: 'gap-1.5' },
    sm:  { icon: 'w-7 h-7',  text: 'text-base',  gap: 'gap-1.5' },
    md:  { icon: 'w-8 h-8',  text: 'text-lg',    gap: 'gap-2'   },
    lg:  { icon: 'w-10 h-10', text: 'text-xl',   gap: 'gap-2'   },
    xl:  { icon: 'w-16 h-16', text: 'text-3xl',  gap: 'gap-3'   },
  };
  const cfg = configs[size] || configs.md;

  return (
    <div className={`flex items-center ${cfg.gap} select-none ${className}`}>
      {/* Green rounded square icon with leaf/recycle symbol */}
      <div className={`${cfg.icon} rounded-[10px] bg-[#16A34A] flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%]">
          {/* Circular arrow cycle */}
          <path
            d="M16 6C10.477 6 6 10.477 6 16C6 18.09 6.63 20.03 7.72 21.64L10 19.36C9.37 18.11 9 16.69 9 15.17C9 11.57 11.57 9 15.17 9H17L14.5 6.5L16 5L21 10L16 15L14.5 13.5L17 11H15.17C13.19 11 11.5 12.69 11.5 14.67C11.5 16.08 12.3 17.3 13.46 17.96L11.26 20.17C9.56 18.9 8.5 16.9 8.5 14.67C8.5 11.09 11.39 8.2 14.97 8.2H16V6Z"
            fill="white"
          />
          <path
            d="M24.28 10.36L22 12.64C22.63 13.89 23 15.31 23 16.83C23 20.43 20.43 23 16.83 23H15L17.5 25.5L16 27L11 22L16 17L17.5 18.5L15 21H16.83C18.81 21 20.5 19.31 20.5 17.33C20.5 15.92 19.7 14.7 18.54 14.04L20.74 11.83C22.44 13.1 23.5 15.1 23.5 17.33C23.5 20.91 20.61 23.8 17.03 23.8H16V26C21.523 26 26 21.523 26 16C26 13.91 25.37 11.97 24.28 10.36Z"
            fill="rgba(255,255,255,0.75)"
          />
        </svg>
      </div>

      {/* Brand text "EatWise" – Figma shows full green bold text */}
      {showText && (
        <span className={`font-bold tracking-tight leading-none text-[#16A34A] ${cfg.text}`}>
          EatWise
        </span>
      )}
    </div>
  );
}
