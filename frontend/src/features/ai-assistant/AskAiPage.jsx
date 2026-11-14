import React, { useState, useRef, useEffect } from 'react';
import { fetchFromBackend } from '../../config/api.js';
import * as store from '../../../../backend/services/storageService.js';
import BrandLogo from '../../shared/components/BrandLogo.jsx';

// Assets from Figma
import aiSparkle from '../../assets/figma/ai_sparkle.svg';
import aiClock from '../../assets/figma/ai_clock.svg';
import aiLeaf from '../../assets/figma/ai_leaf.svg';
import aiLock from '../../assets/figma/ai_lock.svg';
import chatChevron from '../../assets/figma/chat_chevron.svg';

export default function TanyaAiScreen({
  user,
  foodItems = [],
  onOpenRiwayat,
  onOpenScan,
  onOpenManual,
  onOpenCompostTab,
  onHistoryUpdated
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'riwayat'
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('new');
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Critical items: expiring in <= 3 days and NOT spoiled
  const criticalItems = foodItems.filter(f => f.expiryDays <= 3 && f.status !== 'spoiled' && Number(f.expiryDays ?? 1) > 0);
  const nonSpoiledItems = foodItems.filter(f => f.status !== 'spoiled' && Number(f.expiryDays ?? 1) > 0);
  const spoiledItems = foodItems.filter(f => f.status === 'spoiled' || Number(f.expiryDays ?? 1) <= 0);
  const fillingBatches = store.getCompostBatches().filter(b => b.stage === 'filling');

  const handlePickCompostOption = (msg, methodName, description) => {
    const pickedData = {
      ...msg.data,
      recommendedMethod: methodName,
      why: description || msg.data.why
    };
    store.addAiHistoryEntry({
      type: 'compost',
      badge: methodName,
      title: `${methodName}: ${msg.foodName || 'Bahan Sisa'}`,
      summary: description || msg.data.why,
      prompt: `Aku pilih metode: ${methodName} untuk ${msg.foodName || 'bahan sisa'}`,
      tags: [msg.foodName || 'Bahan Sisa', methodName],
      readOnly: true,
      data: pickedData
    });
    onHistoryUpdated?.();

    const activeBatches = store.getCompostBatches().filter(b => b.stage === 'filling');
    if (activeBatches.length > 0) {
      const methodKey = methodName.toLowerCase();
      const matched = activeBatches.find(b => b.title?.toLowerCase().includes(methodKey.split(' ')[0])) || activeBatches[0];
      setSelectedBatchId(matched.id);
    } else {
      setSelectedBatchId('new');
    }

    const pickedUserMsg = {
      id: `user-pick-${Date.now()}`,
      sender: 'user',
      text: `Aku pilih metode: ${methodName}`
    };
    const guideAiMsg = {
      id: `ai-guide-${Date.now()}`,
      sender: 'ai',
      type: 'compost',
      foodId: msg.foodId || null,
      foodName: msg.foodName,
      foodWeightKg: msg.foodWeightKg || 0.3,
      data: pickedData
    };
    setChatMessages((prev) => [...prev, pickedUserMsg, guideAiMsg]);
  };

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

    // 1b. If all items in fridge are already spoiled:
    if (nonSpoiledItems.length === 0) {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Tolong beri resep kilat dari bahan yang ada di kulkasku.'
      };
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'empty_fridge',
        title: 'Tidak Ada Bahan Layak Masak',
        text: `Semua bahan yang tersisa di kulkasmu saat ini sudah berstatus basi / lewat waktu simpan, ${user?.name || 'Budi'}. Demi keamanan pangan, bahan basi tidak disarankan untuk dimasak.\n\nYuk pilih topik "Olah bahan basi jadi kompos" untuk mengubahnya menjadi pupuk organik!`
      };
      setChatMessages([userMsg, aiMsg]);
      return;
    }

    // 2. If fridge has non-spoiled items:
    const targetItems = criticalItems.length > 0
      ? criticalItems
      : nonSpoiledItems.slice(0, 3);

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

    // 1. If fridge is empty OR has NO spoiled items yet:
    if (foodItems.length === 0 || spoiledItems.length === 0) {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Ada bahan makanan yang sudah basi di kulkasku, bagaimana cara mengolahnya?'
      };
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'empty_fridge',
        title: foodItems.length === 0 ? 'Kulkas Masih Kosong' : 'Belum Ada Bahan yang Basi',
        text:
          foodItems.length === 0
            ? `Saat ini belum ada bahan makanan yang tercatat di kulkasmu, ${user?.name || 'teman'}. Yuk scan struk atau catat bahan makananmu dulu!`
            : `Semua bahan di kulkasmu masih segar dan belum ada yang basi! Jika ada bahan yang ternyata basi lebih cepat, tekan tombol "Basi" di kartu bahannya di Pantry dulu agar bisa diolah menjadi POC, Eco-Enzyme, atau Kompos.`
      };
      setChatMessages([userMsg, aiMsg]);
      return;
    }

    // 2. Only process truly spoiled items:
    const targetItem = spoiledItems[0];

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
          householdType: user?.householdType || 'house',
          skipHistory: true
        })
      });
      const guide = apiRes?.guide || apiRes?.analysis || apiRes;
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        type: 'compost_options',
        foodId: targetItem.id || null,
        foodName: targetItem.name,
        foodWeightKg: targetItem.weightKg || 0.3,
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
      <BrandLogo />

      {/* ── 2. Header & Subtitle (Figma node 32:3809) ── */}
      <div>
        <h1 className="text-[26px] font-extrabold text-[#11231b] tracking-tight leading-tight">
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
                        : 'Belum ada bahan basi di kulkas'}
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

                {/* Compost Method Choice (Step 1: Choose method or save for later) */}
                {msg.type === 'compost_options' && msg.data && (
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between gap-2 border-b border-[#cdebd3]/60 pb-2">
                      <span className="font-bold text-[14.5px] text-[#15803d]">
                        🌿 Pilih Metode Olahan
                      </span>
                      <span className="text-[10px] font-semibold bg-[#dcfce7] text-[#15803d] px-2.5 py-0.5 rounded-full">
                        {msg.data.householdType === 'apartment' ? 'Kos / Apartemen' : 'Rumah'}
                      </span>
                    </div>

                    {/* AI Best Recommendation Banner */}
                    <div className="bg-[#dcfce7]/70 border border-[#16a34a]/40 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#0e7f3d]">
                          ✨ Rekomendasi Terbaik AI
                        </span>
                      </div>
                      <p className="font-bold text-[13.5px] text-[#11231b] leading-snug">
                        {msg.data.recommendedMethod}
                      </p>
                      {msg.data.why && (
                        <p className="text-[11.5px] text-[#334155] leading-relaxed">
                          {msg.data.why}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePickCompostOption(msg, msg.data.recommendedMethod, msg.data.why)}
                        className="w-full py-2 px-3 rounded-full bg-[#0e7f3d] hover:bg-[#0b6831] text-white font-bold text-[12px] transition-all cursor-pointer active:scale-[0.99]"
                      >
                        Pilih Rekomendasi Ini →
                      </button>
                    </div>

                    <p className="text-[11.5px] font-semibold text-[#65796c] pt-0.5">
                      Atau pilih metode lain sesuai kondisimu:
                    </p>

                    <div className="space-y-2.5">
                      {(msg.data.alternativeOptions || []).map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickCompostOption(msg, opt.method, opt.description)}
                          className="w-full text-left bg-[#f8fff4] hover:bg-[#dcfce7]/60 border border-[#2e7d4d]/40 rounded-2xl p-3.5 transition-all cursor-pointer active:scale-[0.99] space-y-1.5"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-[13px] text-[#0e7f3d] leading-snug">{opt.method}</p>
                            {opt.suitableFor && (
                              <span className="inline-block text-[10px] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-[#cdebd3] text-[#475569]">
                                {opt.suitableFor}
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p className="text-[11.5px] text-[#475569] leading-relaxed">{opt.description}</p>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        store.addAiHistoryEntry({
                          type: 'compost',
                          badge: 'Upcycle',
                          title: `Opsi Olahan: ${msg.foodName || 'Bahan Sisa'}`,
                          summary: `Pilihan metode untuk ${msg.foodName || 'bahan sisa'} disimpan untuk nanti.`,
                          prompt: `Bagaimana cara mengolah ${msg.foodName || 'bahan sisa'}?`,
                          tags: [msg.foodName || 'Bahan Sisa'],
                          readOnly: true,
                          data: msg.data
                        });
                        onHistoryUpdated?.();
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            id: `ai-defer-${Date.now()}`,
                            sender: 'ai',
                            type: 'empty_fridge',
                            title: 'Disimpan Terlebih Dahulu',
                            text: `Siap! Rekomendasi untuk ${msg.foodName || 'bahan ini'} sudah tersimpan di Riwayat. Kamu bisa buka lagi kapan pun saat sudah siap mengolahnya.`
                          }
                        ]);
                      }}
                      className="w-full py-2.5 rounded-full border border-[#cbd5e1] text-[12px] font-semibold text-[#475569] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Simpan Nanti Dulu
                    </button>
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-[12px] text-[#0e7f3d]">Metode yang Dianjurkan:</p>
                        <span className="text-[10px] font-semibold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full">
                          {msg.data.householdType === 'apartment' ? 'Kos / Apartemen' : 'Rumah'}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[#1b2e23] font-medium">
                        {msg.data.recommendedMethod}
                      </p>
                      <p className="text-[11.5px] text-[#65796c] mt-0.5">{msg.data.why}</p>
                    </div>

                    {Array.isArray(msg.data.alternativeOptions) && msg.data.alternativeOptions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="font-bold text-[11.5px] text-[#0e7f3d]">Opsi Alternatif Lainnya:</p>
                        <div className="space-y-1.5">
                          {msg.data.alternativeOptions.map((opt, idx) => (
                            <div key={idx} className="bg-[#f8fff4] border border-[#cdebd3] rounded-xl p-2">
                              <p className="font-bold text-[11.5px] text-[#147a3e]">{opt.method}</p>
                              {opt.description && (
                                <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">{opt.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

                    {/* Pilih Wadah Upcycle: lanjutkan batch yang masih aktif atau buat baru */}
                    <div className="space-y-2 pt-1">
                      <p className="font-bold text-[11px] text-[#0e7f3d] uppercase tracking-wide">
                        Pilih Wadah Upcycle:
                      </p>
                      {fillingBatches.map((batch) => {
                        const isPicked = selectedBatchId === batch.id;
                        return (
                          <button
                            key={batch.id}
                            type="button"
                            onClick={() => setSelectedBatchId(batch.id)}
                            className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isPicked
                                ? 'bg-[#dcfce7] border-[#0e7f3d]'
                                : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cdebd3]'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                                isPicked ? 'border-2 border-[#0e7f3d]' : 'border border-[#9ca3af]'
                              }`}
                            >
                              {isPicked && <div className="w-2 h-2 rounded-full bg-[#0e7f3d]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[11.5px] text-[#11231b] truncate">
                                Lanjutkan {batch.title}
                              </p>
                              <p className="text-[10.5px] text-[#65796c]">
                                Kapasitas {batch.fillPercentage || 0}% · {(batch.logs || []).length} bahan
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSelectedBatchId('new')}
                        className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedBatchId === 'new' || fillingBatches.length === 0
                            ? 'bg-[#dcfce7] border-[#0e7f3d]'
                            : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cdebd3]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                            selectedBatchId === 'new' || fillingBatches.length === 0
                              ? 'border-2 border-[#0e7f3d]'
                              : 'border border-[#9ca3af]'
                          }`}
                        >
                          {(selectedBatchId === 'new' || fillingBatches.length === 0) && (
                            <div className="w-2 h-2 rounded-full bg-[#0e7f3d]" />
                          )}
                        </div>
                        <p className="font-semibold text-[11.5px] text-[#11231b]">
                          Buat Wadah / Batch Baru
                        </p>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const targetFoodName = msg.foodName || 'Bahan Sisa';
                        const methodLabel = msg.data.recommendedMethod || 'Upcycle';
                        const useExisting = selectedBatchId && selectedBatchId !== 'new' && fillingBatches.some(b => b.id === selectedBatchId);
                        await fetchFromBackend('/compost/add-item', {
                          method: 'POST',
                          body: JSON.stringify(
                            useExisting
                              ? {
                                  foodId: msg.foodId || null,
                                  foodName: targetFoodName,
                                  weightKg: msg.foodWeightKg || 0.3,
                                  batchId: selectedBatchId,
                                  option: 'existing'
                                }
                              : {
                                  foodId: msg.foodId || null,
                                  foodName: targetFoodName,
                                  weightKg: msg.foodWeightKg || 0.3,
                                  option: 'new',
                                  newBatchTitle: `${methodLabel} • ${targetFoodName}`
                                }
                          )
                        });
                        onOpenCompostTab?.();
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-[#0e7f3d] hover:bg-[#0b6831] text-white font-bold text-[12px] shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Mulai &amp; Pantau di Menu Upcycle →
                    </button>

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
    </div>
  );
}
