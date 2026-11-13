import React, { useState, useRef, useEffect } from 'react';
import { fetchFromBackend } from '../config/api.js';

// Assets from Figma
import landingIcon from '../assets/figma/landing_icon.svg';
import aiSparkle from '../assets/figma/ai_sparkle.svg';
import aiClock from '../assets/figma/ai_clock.svg';
import aiLeaf from '../assets/figma/ai_leaf.svg';
import aiLock from '../assets/figma/ai_lock.svg';
import chatChevron from '../assets/figma/chat_chevron.svg';

export default function TanyaAiScreen({
  user,
  foodItems = [],
  onOpenRiwayat,
  onOpenScan,
  onOpenManual,
  onHistoryUpdated
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'riwayat'
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Critical items: expiring in <= 3 days
  const criticalItems = foodItems.filter(f => f.expiryDays <= 3 && f.status !== 'spoiled');
  const spoiledItems = foodItems.filter(f => f.status === 'spoiled');

  const handleSelectRecipeTopic = async () => {
    if (isLoading) return;

    // 1. If fridge has NO food recorded:
    if (foodItems.length === 0) {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Tolong beri resep kilat dari bahan yang hampir basi di kulkasku.'
      };
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'empty_fridge',
        title: 'Kulkas Masih Kosong',
        text: `Kulkasmu saat ini masih kosong nih, ${user?.name || 'Budi'}! 🥦\n\nBelum ada stok bahan makanan yang tercatat di kulkas. Yuk scan struk belanja atau catat bahan makananmu terlebih dahulu agar aku bisa merekomendasikan resep penyelamat yang pas!`
      };
      setChatMessages([userMsg, aiMsg]);
      return;
    }

    // 2. If fridge has items:
    const targetItems = criticalItems.length > 0
      ? criticalItems
      : foodItems.slice(0, 3);

    const itemNames = targetItems.map(i => i.name).join(', ');

    setIsLoading(true);
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: criticalItems.length > 0
        ? `Tolong beri resep kilat untuk bahan yang hampir basi di kulkasku: ${itemNames}.`
        : `Tolong rekomendasikan resep dari bahan yang ada di kulkasku: ${itemNames}.`
    };

    setChatMessages([userMsg]);

    try {
      const apiRes = await fetchFromBackend('/ai/rescue-recipe', {
        method: 'POST',
        body: JSON.stringify({ items: targetItems })
      });
      const recipe = apiRes?.recipe || apiRes;
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'recipe',
        data: recipe
      };

      setChatMessages([userMsg, aiMsg]);
      onHistoryUpdated?.();
    } catch (err) {
      console.error('Error generate rescue recipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompostTopic = async () => {
    if (isLoading) return;

    // 1. If fridge is empty:
    if (foodItems.length === 0) {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Bagaimana cara mengolah bahan makanan basi jadi kompos?'
      };
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'empty_fridge',
        title: 'Tidak Ada Bahan Basi',
        text: `Saat ini belum ada bahan makanan yang tercatat di kulkasmu, ${user?.name || 'Budi'}! ✨\n\nJika nanti ada bahan yang lewat tanggal kedaluwarsa atau sisa makanan yang rusak, tanyakan ke aku ya untuk panduan komposnya!`
      };
      setChatMessages([userMsg, aiMsg]);
      return;
    }

    // 2. If fridge has spoiled or other items:
    const targetItem = spoiledItems.length > 0
      ? spoiledItems[0]
      : foodItems[0] || { name: 'Sisa Sayur & Nasi', category: 'vegetable' };

    setIsLoading(true);
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Bagaimana cara mengolah ${targetItem.name} yang sudah basi agar jadi kompos tanpa bau?`
    };

    setChatMessages([userMsg]);

    try {
      const apiRes = await fetchFromBackend('/ai/compost-guide', {
        method: 'POST',
        body: JSON.stringify({
          foodName: targetItem.name,
          householdType: user?.householdType || 'house'
        })
      });
      const guide = apiRes?.guide || apiRes?.analysis || apiRes;
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'compost',
        data: guide
      };

      setChatMessages([userMsg, aiMsg]);
      onHistoryUpdated?.();
    } catch (err) {
      console.error('Error analyze compost:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomMessage = async (e) => {
    e?.preventDefault();
    if (!customInput.trim() || isLoading) return;

    const text = customInput.trim();
    setCustomInput('');
    setIsLoading(true);

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Check if asking for recipes while fridge has 0 items
    const isAskingRecipe = /resep|masak|bikin|olah/i.test(text);
    if (isAskingRecipe && foodItems.length === 0) {
      setTimeout(() => {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          type: 'empty_fridge',
          title: 'Kulkas Masih Kosong',
          text: `Di kulkasmu belum tercatat bahan makanan apapun nih. Yuk scan struk atau catat bahan makananmu di kulkas dulu agar resepnya sesuai dengan apa yang kamu punya!`
        };
        setChatMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const isCompost = /kompos|basi|busuk|tanah|biopori|takakura|bokashi|pupuk/i.test(text);

      if (isCompost) {
        const apiRes = await fetchFromBackend('/ai/compost-guide', {
          method: 'POST',
          body: JSON.stringify({
            foodName: text,
            householdType: user?.householdType || 'house'
          })
        });
        const guide = apiRes?.guide || apiRes?.analysis || apiRes;
        const aiMsg = { id: `ai-${Date.now()}`, sender: 'ai', type: 'compost', data: guide };
        setChatMessages(prev => [...prev, aiMsg]);
        onHistoryUpdated?.();
      } else {
        const availableContext = foodItems.length > 0 ? foodItems : [{ name: text }];
        const apiRes = await fetchFromBackend('/ai/rescue-recipe', {
          method: 'POST',
          body: JSON.stringify({ items: availableContext })
        });
        const recipe = apiRes?.recipe || apiRes;
        const aiMsg = { id: `ai-${Date.now()}`, sender: 'ai', type: 'recipe', data: recipe };
        setChatMessages(prev => [...prev, aiMsg]);
        onHistoryUpdated?.();
      }
    } catch (err) {
      console.error('Error in custom chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen pb-32 pt-4 px-5 space-y-5 animate-in fade-in duration-300 relative"
      style={{
        backgroundColor: '#f8fff4',
        fontFamily: 'Poppins, sans-serif'
      }}
      data-node-id="32:3707"
      data-name="Tanya AI"
    >
      {/* ── 1. Top Logo EatWise (Figma node 32:3708 & 32:3716) ── */}
      <div className="flex items-center gap-2">
        <div
          className="w-[38px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #28c92a 0%, #006d2c 51%, #0b6623 100%)'
          }}
        >
          <img src={landingIcon} alt="EatWise Icon" className="w-[28px] h-[27px] block" />
        </div>
        <div className="font-bold text-[21px] leading-normal whitespace-nowrap">
          <span style={{ color: '#006d2c' }}>Eat</span>
          <span style={{ color: '#28c92a' }}>Wise</span>
        </div>
      </div>

      {/* ── 2. Header & Subtitle (Figma node 32:3809) ── */}
      <div>
        <h1 className="text-[24px] font-bold text-[#1b2e23] tracking-tight leading-tight">
          Tanya AI
        </h1>
        <p className="text-[14px] font-medium text-[#65796c] mt-0.5">
          Asisten Zero-Waste
        </p>
      </div>

      {/* ── 3. Toggle Tab: [ Chat | Riwayat ] (Figma node 32:3814) ── */}
      <div className="bg-white rounded-full p-1.5 flex items-center shadow-xs border border-[#ecfdf5]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('chat');
          }}
          className={`flex-1 py-2.5 rounded-full font-semibold text-[14px] text-center transition-all ${
            activeTab === 'chat'
              ? 'bg-[#0e7f3d] text-white shadow-xs'
              : 'text-[#374151] hover:text-[#0e7f3d]'
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenRiwayat) onOpenRiwayat();
          }}
          className="flex-1 py-2.5 rounded-full font-semibold text-[14px] text-center text-[#374151] hover:text-[#0e7f3d] transition-all"
        >
          Riwayat
        </button>
      </div>

      {/* ── 4. Initial State: Bot Greeting Bubble & Topic Selection (ONLY shown when no chat active) ── */}
      {chatMessages.length === 0 ? (
        <div className="space-y-6 pt-1">
          {/* Bot Greeting Bubble (Figma node 32:3819) */}
          <div className="flex items-start gap-2.5">
            <div className="w-[32px] h-[32px] rounded-full bg-[#d5f7e0] flex items-center justify-center flex-shrink-0 mt-1">
              <img src={aiSparkle} alt="AI Sparkle" className="w-[16px] h-[16px]" />
            </div>
            <div className="bg-white border border-[#ecfdf5] rounded-[22px] px-4 py-3 shadow-xs max-w-[290px]">
              <p className="text-[13.5px] text-[#1b2e23] leading-relaxed">
                Halo {user?.name || 'Budi'}! Mau aku bantu apa hari ini? Pilih salah satu di bawah ya.
              </p>
            </div>
          </div>

          {/* Section "PILIH TOPIK" (Figma node 32:3826) */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[12px] font-bold text-[#3d5045] tracking-[0.6px] uppercase">
              PILIH TOPIK
            </h2>

            <div className="space-y-3">
              {/* Card 1: Resep dari bahan hampir basi (Figma node 32:3830) */}
              <button
                type="button"
                onClick={handleSelectRecipeTopic}
                disabled={isLoading}
                className="w-full bg-white border border-[#2e7d4d] rounded-[24px] p-4 flex items-center justify-between shadow-xs hover:bg-emerald-50/40 active:scale-[0.99] transition-all text-left group disabled:opacity-60 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[16px] bg-[#d5f7e0] flex items-center justify-center flex-shrink-0">
                    <img src={aiClock} alt="Resep" className="w-[20px] h-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0e7f3d] text-[13.5px] leading-snug">
                      Resep dari bahan hampir basi
                    </h3>
                    <p className="text-[#65796c] text-[12px] leading-snug mt-0.5">
                      {foodItems.length === 0
                        ? 'Kulkas kosong (0 bahan tercatat)'
                        : criticalItems.length > 0
                        ? `Ada ${criticalItems.length} bahan kritis di kulkasku`
                        : 'Pilih bahan kritis, AI beri resep kilat'}
                    </p>
                  </div>
                </div>
                <img src={chatChevron} alt="→" className="w-[20px] h-[20px] opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Card 2: Olah bahan basi jadi kompos (Figma node 32:3846) */}
              <button
                type="button"
                onClick={handleSelectCompostTopic}
                disabled={isLoading}
                className="w-full bg-white border border-[#2e7d4d] rounded-[24px] p-4 flex items-center justify-between shadow-xs hover:bg-emerald-50/40 active:scale-[0.99] transition-all text-left group disabled:opacity-60 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[16px] bg-[#d5f7e0] flex items-center justify-center flex-shrink-0">
                    <img src={aiLeaf} alt="Kompos" className="w-[20px] h-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0e7f3d] text-[13.5px] leading-snug">
                      Olah bahan basi jadi kompos
                    </h3>
                    <p className="text-[#65796c] text-[12px] leading-snug mt-0.5">
                      {spoiledItems.length > 0
                        ? `Ada ${spoiledItems.length} bahan basi siap diolah`
                        : 'Pilih bahan rusak, AI beri panduan kompos'}
                    </p>
                  </div>
                </div>
                <img src={chatChevron} alt="→" className="w-[20px] h-[20px] opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[#65796c] text-[11.5px]">
              <img src={aiLock} alt="Lock" className="w-[14px] h-[14px] opacity-80" />
              <span>Tanya AI hanya menjawab seputar resep dan kompos</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── 5. Active Chat Conversation Stream (Replaces topic cards without duplicating) ── */
        <div className="space-y-4 pt-1">
          {/* Action header: back to topics */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-[12px] font-bold text-[#3d5045] uppercase tracking-[0.5px]">
              Percakapan Aktif
            </span>
            <button
              type="button"
              onClick={() => setChatMessages([])}
              className="text-[12px] font-semibold text-[#0e7f3d] bg-[#d5f7e0] hover:bg-[#c2f2d1] px-3 py-1 rounded-full transition-all"
            >
              + Pilih Topik Lain
            </button>
          </div>

          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 animate-in fade-in duration-200 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-[32px] h-[32px] rounded-full bg-[#d5f7e0] flex items-center justify-center flex-shrink-0 mt-1">
                  <img src={aiSparkle} alt="AI" className="w-[16px] h-[16px]" />
                </div>
              )}

              <div
                className={`rounded-[22px] p-4 text-[13.5px] max-w-[320px] shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#15803d] text-white'
                    : 'bg-white border border-[#cdebd3] text-[#1b2e23]'
                }`}
              >
                {/* Empty Fridge Friendly Message with Quick Action */}
                {msg.type === 'empty_fridge' && (
                  <div className="space-y-3">
                    <p className="leading-relaxed whitespace-pre-line text-[#1b2e23]">
                      {msg.text}
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={onOpenScan}
                        className="w-full py-2 px-3 rounded-xl bg-[#0e7f3d] text-white font-bold text-[12.5px] hover:bg-[#0c6b33] active:scale-95 transition-all"
                      >
                        Scan Struk Belanja
                      </button>
                      <button
                        type="button"
                        onClick={onOpenManual}
                        className="w-full py-2 px-3 rounded-xl border border-[#0e7f3d] text-[#0e7f3d] font-bold text-[12.5px] hover:bg-emerald-50 active:scale-95 transition-all"
                      >
                        Catat Bahan Manual
                      </button>
                    </div>
                  </div>
                )}

                {/* Normal text query message */}
                {msg.sender === 'user' && msg.text && (
                  <p className="leading-relaxed">{msg.text}</p>
                )}

                {/* Recipe Card Output */}
                {msg.type === 'recipe' && msg.data && (
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between gap-2 border-b border-[#cdebd3]/60 pb-2">
                      <span className="font-bold text-[15px] text-[#0e7f3d]">
                        🍳 {msg.data.title}
                      </span>
                      <span className="text-[11px] font-semibold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full whitespace-nowrap">
                        ⏱️ {msg.data.cookingTimeMinutes || 12}m
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[#4b5563] italic leading-normal">
                      "{msg.data.introText}"
                    </p>

                    <div>
                      <p className="font-bold text-[12px] text-[#0e7f3d] mb-1">
                        Bahan yang Diselamatkan:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(msg.data.matchedItems || []).map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-[#d5f7e0] text-[#0e7f3d] text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-[12px] text-[#0e7f3d] mb-1.5">
                        Langkah Memasak Kilat:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-[#374151] leading-relaxed">
                        {(msg.data.steps || []).map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#65796c] border-t border-[#cdebd3]/60">
                      <span>Tersimpan di Riwayat Chat</span>
                      <span className="font-bold text-[#0e7f3d]">✓ Tersimpan</span>
                    </div>
                  </div>
                )}

                {/* Compost Card Output */}
                {msg.type === 'compost' && msg.data && (
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between gap-2 border-b border-[#cdebd3]/60 pb-2">
                      <span className="font-bold text-[15px] text-[#15803d]">
                        🌿 Panduan Kompos
                      </span>
                      <span className="text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-full">
                        {msg.data.estimatedDays || 14} Hari
                      </span>
                    </div>

                    <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-2.5 text-[11.5px] text-[#b91c1c] leading-tight">
                      ⚠️ {msg.data.safetyWarning || 'Bahan basi tidak untuk dikonsumsi.'}
                    </div>

                    <div>
                      <p className="font-bold text-[12px] text-[#0e7f3d]">Metode yang Dianjurkan:</p>
                      <p className="text-[12.5px] text-[#1b2e23] font-medium">
                        {msg.data.recommendedMethod}
                      </p>
                      <p className="text-[11.5px] text-[#65796c] mt-0.5">{msg.data.why}</p>
                    </div>

                    <div>
                      <p className="font-bold text-[12px] text-[#0e7f3d] mb-1.5">Langkah Pengolahan:</p>
                      <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-[#374151] leading-relaxed">
                        {(msg.data.steps || []).map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#65796c] border-t border-[#cdebd3]/60">
                      <span>Tersimpan di Riwayat Chat</span>
                      <span className="font-bold text-[#0e7f3d]">✓ Tersimpan</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex items-center gap-2.5 animate-in fade-in">
              <div className="w-[32px] h-[32px] rounded-full bg-[#d5f7e0] flex items-center justify-center flex-shrink-0 animate-spin">
                <img src={aiSparkle} alt="" className="w-[16px] h-[16px]" />
              </div>
              <div className="bg-white border border-[#cdebd3] rounded-[22px] px-4 py-3 shadow-xs">
                <p className="text-[12.5px] text-[#0e7f3d] font-semibold animate-pulse flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#0e7f3d] animate-ping" />
                  Gemini AI sedang meracik resep & panduan...
                </p>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* ── 7. Input Form (Custom Chat Query) ── */}
      <form onSubmit={handleSendCustomMessage} className="pt-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Tanyakan resep atau panduan kompos..."
            disabled={isLoading}
            className="w-full bg-white border border-[#cdebd3] rounded-full py-3.5 pl-4 pr-12 text-[13px] text-[#11231b] placeholder-[#9ca3af] shadow-xs focus:outline-none focus:border-[#0e7f3d]"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || isLoading}
            className="absolute right-2 w-[34px] h-[34px] rounded-full bg-[#0e7f3d] disabled:bg-gray-300 text-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
