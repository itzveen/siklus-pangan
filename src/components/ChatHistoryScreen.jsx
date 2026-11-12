import React, { useState } from 'react';
import { Sparkles, Clock, Sprout, ArrowRight, X, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import EatWiseLogo from './EatWiseLogo.jsx';

export default function ChatHistoryScreen({
  history = [],
  onSwitchToChat
}) {
  const [selectedChat, setSelectedChat] = useState(null);

  const todayChats = history.filter(h => h.dateGroup === 'HARI INI');
  const yesterdayChats = history.filter(h => h.dateGroup !== 'HARI INI');

  return (
    <div className="pb-24 pt-3 px-4 space-y-5 max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <EatWiseLogo size="sm" showText={false} className="mb-1" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tanya AI
        </h1>
        <p className="text-xs text-slate-500">
          Asisten Zero-Waste
        </p>
      </div>

      {/* Segmented Switcher (Chat | Riwayat) */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/80">
        <button
          onClick={onSwitchToChat}
          className="flex-1 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 transition-all text-center"
        >
          Chat
        </button>
        <button
          className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-800 text-white shadow-xs text-center transition-all"
        >
          Riwayat
        </button>
      </div>

      {/* Subheader */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Riwayat percakapan</h3>
          <p className="text-xs text-slate-500">Resep dan panduan komposmu tersimpan di sini.</p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {history.length} chat
        </span>
      </div>

      {/* 1. HARI INI */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          HARI INI
        </span>

        {todayChats.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-400 border border-slate-100">
            Belum ada riwayat chat hari ini.
          </div>
        ) : (
          todayChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {chat.type === 'compost' ? (
                    <Sprout className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{chat.badge || (chat.type === 'compost' ? 'Kompos' : 'Rescue Resep')}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{chat.time || '09.41'}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {chat.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {chat.summary}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all mt-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. KEMARIN */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          KEMARIN
        </span>

        {yesterdayChats.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-400 border border-slate-100">
            Tidak ada riwayat chat kemarin.
          </div>
        ) : (
          yesterdayChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer active:scale-[0.99] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {chat.type === 'compost' ? (
                    <Sprout className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Clock className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{chat.badge || (chat.type === 'compost' ? 'Kompos' : 'Rescue Resep')}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{chat.time || '18.30'}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {chat.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {chat.summary}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all mt-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL DRAWER */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800">
                  {selectedChat.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedChat.dateGroup} · {selectedChat.time}
                </span>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* User Prompt */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pertanyaanmu</span>
                <p className="text-xs font-semibold text-slate-800 italic">
                  "{selectedChat.prompt || selectedChat.title}"
                </p>
                {selectedChat.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedChat.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Response Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    AI
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedChat.title}</h3>
                </div>

                {selectedChat.data?.introText && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    {selectedChat.data.introText}
                  </p>
                )}

                {/* Recipe Meta Badges */}
                {selectedChat.type === 'recipe' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                      ⏱️ {selectedChat.data?.cookingTimeMinutes || 12} menit
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      ⚡ {selectedChat.data?.difficulty || 'Sangat Mudah'}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                      👥 {selectedChat.data?.servings || 2} porsi
                    </span>
                  </div>
                )}

                {/* Compost Safety Warning */}
                {selectedChat.type === 'compost' && selectedChat.data?.safetyWarning && (
                  <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-medium">
                    ⚠️ {selectedChat.data.safetyWarning}
                  </div>
                )}

                {/* Steps List */}
                {selectedChat.data?.steps && (
                  <div className="space-y-2 pt-1">
                    <h5 className="font-bold text-xs text-slate-800">Langkah Pembuatan:</h5>
                    <ol className="space-y-2">
                      {selectedChat.data.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Read-only notice */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 py-2 px-3 rounded-lg border border-slate-200/60">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Balasan AI ini bersifat one-shot dan tidak bisa dibalas lagi.</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
              <button
                onClick={() => setSelectedChat(null)}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs"
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
