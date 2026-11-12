import React, { useEffect, useState } from 'react';

// Asset imports — downloaded from Figma node 1:2 "Splash Screen"
import splashIcon      from '../assets/figma/splash_icon.svg';
import splashLeafLeft  from '../assets/figma/splash_leaf_left.svg';
import splashLeafRight from '../assets/figma/splash_leaf_right.svg';
import splashRayLeft   from '../assets/figma/splash_ray_left.svg';
import splashRayRight  from '../assets/figma/splash_ray_right.svg';

/**
 * Splash Screen — Figma node 1:2
 * Visual target: https://www.figma.com/design/o6ubCGsKqBoQxt3I5lJu2l/EatWise?node-id=1-2
 *
 * Design specs from get_design_context:
 *  - bg: #f8fff4 (very light mint)
 *  - App icon: green gradient rounded-[40px] square, 128×124 px
 *    with eatwise_icon inside (SVG), plus decorative leaf & ray assets
 *  - Title: Poppins Bold 45px "Eat" #006d2c + "W" + "se" #28c92a
 *    "i" slightly smaller 35px
 *  - Tagline: Poppins Italic 12px #006d2c "Kelola Makanan, Kurangi Terbuang."
 */
export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setFade(true);
      setTimeout(() => { if (onFinish) onFinish(); }, 400);
    }, 2200);
    return () => clearTimeout(t);
  }, [onFinish]);

  const handleTap = () => {
    setFade(true);
    setTimeout(() => { if (onFinish) onFinish(); }, 200);
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer overflow-hidden transition-opacity duration-400"
      style={{
        backgroundColor: '#f8fff4',
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? 'none' : 'auto',
      }}
    >
      {/* ── Centre group: icon + text ── */}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>

        {/* ── Icon cluster (icon card + 4 decorative overlays) ── */}
        {/* Figma positions everything relative to a 402×874 frame.
            Translated to flex: icon centred, decorations absolutely offset. */}
        <div className="relative flex items-center justify-center"
          style={{ width: 160, height: 160 }}
        >
          {/* Green gradient rounded square background — Figma: bg-gradient-to-b from-[#28c92a] via-[#006d2c] to-[#0b6623] rounded-[40px] 128×124 rotated -90° */}
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 32,
              background: 'linear-gradient(180deg, #28c92a 0%, #006d2c 51%, #0b6623 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Figma: eatwise_icon_closer_transparent 1 — SVG icon on top of gradient */}
            <img
              src={splashIcon}
              alt=""
              style={{ width: 92, height: 97, display: 'block', flexShrink: 0 }}
            />
          </div>

          {/* Decoration: leaf on top-left (Figma group at ~31.92% from top, 27.11% from left) */}
          <img
            src={splashLeafLeft}
            alt=""
            style={{
              position: 'absolute',
              width: 31,
              height: 19,
              top: 20,
              left: -4,
              display: 'block',
            }}
          />

          {/* Decoration: leaf on top-right (Figma group at ~31.35% top, 62.19% left) */}
          <img
            src={splashLeafRight}
            alt=""
            style={{
              position: 'absolute',
              width: 38,
              height: 30,
              top: 10,
              right: -8,
              display: 'block',
            }}
          />

          {/* Decoration: ray left (Figma 35.7% top, 27.12% left, rotate 15deg) */}
          <img
            src={splashRayLeft}
            alt=""
            style={{
              position: 'absolute',
              width: 24,
              height: 14,
              top: 42,
              left: -16,
              transform: 'rotate(15deg)',
              display: 'block',
            }}
          />

          {/* Decoration: ray right (Figma 54.56% top, 56.92% left, rotate 10deg) */}
          <img
            src={splashRayRight}
            alt=""
            style={{
              position: 'absolute',
              width: 28,
              height: 16,
              bottom: 36,
              right: -14,
              transform: 'rotate(10deg)',
              display: 'block',
            }}
          />
        </div>

        {/* ── Title: "EatWise" — Figma top:470 ── */}
        {/* Poppins Bold. "Eat" #006d2c 45px, "W"+"se" #28c92a 45px, "i" #28c92a 35px */}
        <p
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 0, /* parent resets, children set their own */
            color: '#006d2c',
            lineHeight: 'normal',
            whiteSpace: 'nowrap',
            marginTop: 20,
          }}
        >
          <span style={{ fontSize: 45, color: '#006d2c' }}>Eat</span>
          <span style={{ fontSize: 45, color: '#28c92a' }}>W</span>
          <span style={{ fontSize: 35, color: '#28c92a' }}>i</span>
          <span style={{ fontSize: 45, color: '#28c92a' }}>se</span>
        </p>

        {/* ── Tagline — Figma top:538 ── */}
        {/* Poppins Italic 12px #006d2c */}
        <p
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 12,
            color: '#006d2c',
            lineHeight: 'normal',
            whiteSpace: 'nowrap',
            marginTop: 8,
          }}
        >
          Kelola Makanan, Kurangi Terbuang.
        </p>
      </div>
    </div>
  );
}
