import React from 'react';

export default function EatWiseLogo({ size = 'md', className = '', showText = true }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Radiant Glow App Icon */}
      <div className={`relative flex items-center justify-center ${iconSizes[size] || iconSizes.md}`}>
        {/* Glow rays (for splash or hero) */}
        {size === 'xl' && (
          <>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-2.5 bg-emerald-400 rounded-full opacity-80" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-2.5 bg-emerald-400 rounded-full opacity-80" />
            <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-1 w-2.5 bg-emerald-400 rounded-full opacity-80" />
            <span className="absolute -right-3 top-1/2 -translate-y-1/2 h-1 w-2.5 bg-emerald-400 rounded-full opacity-80" />
            <span className="absolute -top-2 -left-2 w-1 h-2 bg-emerald-400 rounded-full -rotate-45 opacity-80" />
            <span className="absolute -top-2 -right-2 w-1 h-2 bg-emerald-400 rounded-full rotate-45 opacity-80" />
          </>
        )}

        <div className="w-full h-full rounded-[28%] bg-gradient-to-br from-emerald-400 via-emerald-600 to-green-700 p-0.5 shadow-md shadow-emerald-700/20 flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 text-white"
          >
            {/* Curved cycle arrows creating closed-loop leaf */}
            <path
              d="M20 7C12.82 7 7 12.82 7 20C7 22.25 7.57 24.36 8.58 26.2L10.74 24.04C10.27 22.8 10 21.43 10 20C10 14.48 14.48 10 20 10H22.59L19.29 6.71L20.71 5.29L26.41 11L20.71 16.71L19.29 15.29L22.59 12H20C15.58 12 12 15.58 12 20C12 21.14 12.24 22.23 12.67 23.21L14.94 20.94C14.35 19.89 14 18.68 14 17.4C14 13.86 16.86 11 20.4 11C23.94 11 26.8 13.86 26.8 17.4C26.8 21.3 23.3 24.5 19.4 24.5C18.12 24.5 16.91 24.15 15.86 23.56L14.39 25.03C15.84 25.96 17.55 26.5 19.4 26.5C24.4 26.5 28.8 22.4 28.8 17.4C28.8 12.75 25.05 9 20.4 9H20V7Z"
              fill="currentColor"
            />
            {/* Sprout Leaf Accent */}
            <path
              d="M20.5 13.5C23.5 13.5 26 16 26 19C26 22 23.5 24.5 20.5 24.5C20.5 21 21.5 17 24 15.5C22.5 15 21 14.5 20.5 13.5Z"
              fill="rgba(255,255,255,0.85)"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text: EatWise */}
      {showText && (
        <span className={`font-bold tracking-tight ${textSizes[size] || textSizes.md}`}>
          <span className="text-slate-900">Eat</span>
          <span className="text-emerald-600 relative">
            Wise
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full ml-0.5 -mt-2 align-top animate-pulse" />
          </span>
        </span>
      )}
    </div>
  );
}
