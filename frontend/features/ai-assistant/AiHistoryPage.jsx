import React, { useState } from 'react';
import * as store from '../../../backend/services/storageService.js';
import BrandLogo from '../../shared/components/BrandLogo.jsx';

// Assets from Figma
import topicRecipe from '../../assets/figma/topic_recipe.svg';
import topicCompost from '../../assets/figma/topic_compost.svg';
import chatChevron from '../../assets/figma/chat_chevron.svg';

export default function RiwayatChatScreen({
  chats = [],
  onOpenChat,
  onBack
}) {
  const [selectedDetailChat, setSelectedDetailChat] = useState(null);
  const resolvedChats = chats.length > 0 ? chats : store.getAiHistory();

  // Group chats by dateGroup
  const todayChats = resolvedChats.filter(c => (c.dateGroup || 'HARI INI') === 'HARI INI');
  const earlierChats = resolvedChats.filter(c => (c.dateGroup || 'HARI INI') !== 'HARI INI');

  return (
    <div
      className="w-full min-h-screen pb-28 pt-4 px-5 space-y-5 animate-in fade-in duration-300 relative"
      style={{
        backgroundColor: '#f8fff4',
        fontFamily: 'Poppins, sans-serif'
      }}
      data-node-id="54:905"
      data-name="Riwayat chat"
    >
      {/* ── 1. Top Logo EatWise ── */}
      <BrandLogo />

      {/* ── 2. Header & Subtitle (Figma node 54:918) ── */}
      <div>
        <h1 className="text-[26px] font-extrabold text-[#11231b] tracking-tight leading-tight">
          Tanya AI
        </h1>
        <p className="text-[14px] font-medium text-[#65796c] mt-0.5">
          Asisten Zero-Waste
        </p>
      </div>

      {/* ── 3. Toggle Tab: [ Chat | Riwayat (Active) ] (Figma node 54:921) ── */}
      <div className="bg-white rounded-full p-1.5 flex items-center shadow-xs border border-[#ecfdf5]">
        <button
          type="button"
          onClick={() => {
            if (onOpenChat) onOpenChat();
          }}
          className="flex-1 py-2.5 rounded-full font-semibold text-[14px] text-center text-[#374151] hover:text-[#0e7f3d] transition-all"
        >
          Chat
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 rounded-full font-semibold text-[14px] text-center bg-[#0e7f3d] text-white shadow-xs transition-all"
        >
          Riwayat
        </button>
      </div>

      {/* ── 4. Introduction Header (Figma node 54:927) ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#1b2e23]">
            Riwayat percakapan
          </h2>
          <span className="text-[11px] text-[#65796c]">
            {chats.length} chat
          </span>
        </div>
        <p className="text-[12px] text-[#65796c]">
          Resep dan panduan komposmu tersimpan di sini.
        </p>
      </div>

      {/* ── 5. Conversation Cards (Figma node 54:932) ── */}
      <div className="space-y-4">
        {/* HARI INI */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold text-[#3d5045] tracking-[0.55px] uppercase">
            HARI INI
          </p>

          <div className="space-y-3">
            {todayChats.length === 0 ? (
              <p className="text-[12px] text-[#65796c] italic bg-white p-4 rounded-2xl border border-[#cdebd3]">
                Belum ada percakapan hari ini. Coba tanyakan resep atau panduan kompos di tab Chat!
              </p>
            ) : (
              todayChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedDetailChat(c)}
                  className="bg-white border border-[#dcf2e4] rounded-[24px] p-3.5 shadow-xs hover:border-[#15803d]/40 transition-all cursor-pointer space-y-2 group"
                >
                  {/* Topic badge & time */}
                  <div className="flex items-center justify-between">
                    <div className="bg-[#d5f7e0] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <img
                        src={c.type === 'compost' ? topicCompost : topicRecipe}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <span className="font-semibold text-[10.5px] text-[#1b5e3a]">
                        {c.badge || (c.type === 'compost' ? 'Kompos' : 'Rescue Resep')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#65796c]">
                      {c.time || 'Baru saja'}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[13.5px] text-[#1b2e23] leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-[12px] text-[#65796c] line-clamp-2 mt-0.5 leading-snug">
                        {c.summary}
                      </p>
                    </div>
                    <img
                      src={chatChevron}
                      alt="→"
                      className="w-[18px] h-[18px] opacity-70 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SEBELUMNYA */}
        {earlierChats.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <p className="text-[11px] font-bold text-[#3d5045] tracking-[0.55px] uppercase">
              SEBELUMNYA
            </p>
            <div className="space-y-3">
              {earlierChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedDetailChat(c)}
                  className="bg-white border border-[#dcf2e4] rounded-[24px] p-3.5 shadow-xs hover:border-[#15803d]/40 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="bg-[#d5f7e0] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <img
                        src={c.type === 'compost' ? topicCompost : topicRecipe}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <span className="font-semibold text-[10.5px] text-[#1b5e3a]">
                        {c.badge || (c.type === 'compost' ? 'Kompos' : 'Rescue Resep')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#65796c]">
                      {c.time || 'Kemarin'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[13.5px] text-[#1b2e23] leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-[12px] text-[#65796c] line-clamp-2 mt-0.5 leading-snug">
                        {c.summary}
                      </p>
                    </div>
                    <img
                      src={chatChevron}
                      alt="→"
                      className="w-[18px] h-[18px] opacity-70 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 6. Detail Modal (When a Chat History Item is Clicked) ── */}
      {selectedDetailChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setSelectedDetailChat(null)}
        >
          <div
            className="w-full max-w-[360px] max-h-[85vh] bg-white rounded-[28px] p-5 shadow-2xl relative flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#d5f7e0] text-[#0e7f3d]">
                {selectedDetailChat.badge || 'Tersimpan'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDetailChat(null)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <h3 className="text-[17px] font-bold text-[#1b2e23] leading-snug mb-1">
              {selectedDetailChat.title}
            </h3>
            <p className="text-[12px] text-[#65796c] mb-3">
              Ditanyakan: "{selectedDetailChat.prompt}"
            </p>

            {/* Recipe Content */}
            {selectedDetailChat.type === 'recipe' && selectedDetailChat.data && (
              <div className="space-y-3 text-[12.5px]">
                <div className="flex gap-2">
                  <span className="bg-[#f0fdf4] text-[#16a34a] font-semibold px-2 py-0.5 rounded-md text-[11px]">
                    ⏱️ {selectedDetailChat.data.cookingTimeMinutes || 12} menit
                  </span>
                  <span className="bg-[#f0fdf4] text-[#16a34a] font-semibold px-2 py-0.5 rounded-md text-[11px]">
                    {selectedDetailChat.data.difficulty || 'Sangat Mudah'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-[#0e7f3d] mb-1">Bahan:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                    {(selectedDetailChat.data.matchedItems || []).map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                    {(selectedDetailChat.data.additionalIngredients || []).map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#0e7f3d] mb-1">Langkah Memasak:</h4>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {(selectedDetailChat.data.steps || []).map((st, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Compost Content */}
            {selectedDetailChat.type === 'compost' && selectedDetailChat.data && (
              <div className="space-y-3 text-[12.5px]">
                <div>
                  <h4 className="font-bold text-[#15803d]">Metode:</h4>
                  <p className="text-gray-800 font-medium">
                    {selectedDetailChat.data.recommendedMethod}
                  </p>
                  <p className="text-gray-500 text-[11.5px] mt-0.5">{selectedDetailChat.data.why}</p>
                </div>

                <div>
                  <h4 className="font-bold text-[#15803d] mb-1">Panduan Pengolahan:</h4>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {(selectedDetailChat.data.steps || []).map((st, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedDetailChat(null)}
              className="mt-5 w-full py-2.5 rounded-full bg-[#0e7f3d] text-white font-bold text-sm shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
