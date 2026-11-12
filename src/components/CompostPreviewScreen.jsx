import React, { useState } from 'react';
import { Sprout, Lock, FastForward, CheckCircle2, ChevronRight, History, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as store from '../services/storageService.js';
import EatWiseLogo from './EatWiseLogo.jsx';

export default function CompostPreviewScreen({
  batches = [],
  harvestHistory = [],
  impact = {},
  onBatchesUpdated
}) {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const handleLockBatch = (batchId) => {
    const updated = store.lockBatchForCuring(batchId);
    if (onBatchesUpdated) onBatchesUpdated(updated);
    setActionNotice('Wadah berhasil dikunci! Pematangan 14 hari dimulai.');
  };

  const handleSimulate14Days = (batchId) => {
    const updated = store.fastForwardBatchDemo(batchId, 14);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    if (onBatchesUpdated) onBatchesUpdated(updated);
    setActionNotice('Simulasi 14 hari berhasil! Kompos siap dipanen 🎉');
  };

  const handleHarvest = (batchId) => {
    const record = store.harvestBatch(batchId, 3.5);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    const updated = store.getCompostBatches();
    if (onBatchesUpdated) onBatchesUpdated(updated);
    setActionNotice('Panen 3.5 Kg pupuk kompos berhasil dicatat! 🌱');
  };

  return (
    <div className="pb-28 pt-3 px-4 space-y-5 max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <EatWiseLogo size="sm" showText={false} className="mb-1" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Siklus Kompos
        </h1>
        <p className="text-xs text-slate-500">
          Smart Batching & Pengolahan Bahan Basi
        </p>
      </div>

      {/* Impact Stat Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-emerald-200 tracking-wide uppercase">
            Total Kompos Dihasilkan
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {impact?.compostedFoodKg || 3.8} Kg
          </h2>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
          🌱
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Active Batches Section */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          WADAH AKTIF
        </span>

        {batches.map((batch) => {
          const isFilling = batch.stage === 'filling';
          const isCuring = batch.stage === 'curing';
          const isReady = batch.stage === 'ready';

          return (
            <div
              key={batch.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{batch.title}</h3>
                    <span className="text-xs text-slate-400 font-medium">· {batch.subtitle}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{batch.method}</p>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isReady
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isCuring
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-teal-100 text-teal-800 border border-teal-300'
                  }`}
                >
                  {isReady ? 'Siap Panen' : isCuring ? `Pematangan (${batch.curingDaysLeft || 9} Hari)` : 'Fase Pengisian'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Kapasitas Wadah</span>
                  <span className="text-emerald-700">{batch.fillPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${batch.fillPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {isFilling && (
                  <button
                    onClick={() => handleLockBatch(batch.id)}
                    className="flex-1 py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci & Mulai Curing</span>
                  </button>
                )}

                {isCuring && (
                  <button
                    onClick={() => handleSimulate14Days(batch.id)}
                    className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    title="Simulasi Demo Juri"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Lompat 14 Hari (Demo Juri)</span>
                  </button>
                )}

                {isReady && (
                  <button
                    onClick={() => handleHarvest(batch.id)}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Catat Panen Pupuk</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Harvest History Section */}
      <div className="space-y-2.5 pt-2">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          RIWAYAT PANEN
        </span>

        {harvestHistory.map((h) => (
          <div key={h.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100">
                📦
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{h.title}</h4>
                <p className="text-xs text-slate-400">{h.harvestDate} · {h.status}</p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-emerald-800">{h.weightKg} Kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
