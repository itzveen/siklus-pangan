import React, { useState } from 'react';
import { Clock, Sprout, ArrowRight, Lock, Sparkles, ChefHat, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import EatWiseLogo from './EatWiseLogo.jsx';
import * as store from '../services/storageService.js';
import { generateRescueRecipe, analyzeCompostAction } from '../services/geminiService.js';

export default function TanyaAiScreen({
  user,
  foodItems = [],
  onSwitchToHistory,
  onFoodItemsUpdated,
  initialTopic = null // 'recipe' | 'compost' | null
}) {
  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [actionDoneMessage, setActionDoneMessage] = useState(null);

  const handleSelectTopic = async (topicType) => {
    setActiveTopic(topicType);
    setLoading(true);
    setActionDoneMessage(null);

    const currentFoods = store.getFoodItems();

    if (topicType === 'recipe') {
      // Find warning items or first 2 available items
      const expiringItems = currentFoods.filter(f => f.status === 'warning').slice(0, 2);
      const itemsToUse = expiringItems.length > 0 ? expiringItems : currentFoods.slice(0, 2);
      const finalItems = itemsToUse.length > 0
        ? itemsToUse.map(i => ({ name: i.name, expiryDays: i.expiryDays }))
        : [{ name: 'Bayam Hijau', expiryDays: 1 }, { name: 'Telur Ayam', expiryDays: 2 }];

      try {
        const recipe = await generateRescueRecipe(finalItems);
        const autoPrompt = 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.';
        const tags = finalItems.map(i => i.name);

        // Auto save to Riwayat Chat according to Figma spec
        store.addAiHistoryEntry({
          type: 'recipe',
          badge: 'Rescue Resep',
          title: recipe.title,
          summary: `${tags.join(' dan ')} jadi hidangan hangat, siap dalam ${recipe.cookingTimeMinutes || 12} menit.`,
          prompt: autoPrompt,
          tags,
          readOnly: true,
          data: recipe
        });

        setAiResponse({
          type: 'recipe',
          title: recipe.title,
          prompt: autoPrompt,
          tags,
          data: recipe,
          relatedFoodIds: itemsToUse.map(i => i.id)
        });
      } catch (err) {
        console.error("AI Recipe error:", err);
      } finally {
        setLoading(false);
      }
    } else if (topicType === 'compost') {
      // Find spoiled item or warning item
      const spoiledItem = currentFoods.find(f => f.status === 'spoiled') || currentFoods[0] || { name: 'Tahu Putih' };
      const foodName = spoiledItem.name || 'Tahu Putih';

      try {
        const guide = await analyzeCompostAction({ name: foodName }, user?.householdType || 'house');
        const autoPrompt = `${foodName} ku sudah basi. Gimana cara mengolahnya jadi kompos?`;

        // Auto save to Riwayat Chat according to Figma spec
        store.addAiHistoryEntry({
          type: 'compost',
          badge: 'Kompos',
          title: `Olah ${foodName} jadi kompos`,
          summary: `Panduan mengolah ${foodName.toLowerCase()} yang sudah basi untuk batch komposmu.`,
          prompt: autoPrompt,
          tags: [foodName],
          readOnly: true,
          data: guide
        });

        setAiResponse({
          type: 'compost',
          title: `Olah ${foodName} jadi kompos`,
          prompt: autoPrompt,
          tags: [foodName],
          data: guide,
          targetFoodItem: spoiledItem
        });
      } catch (err) {
        console.error("AI Compost error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Action: Mark finished cooking and reward
  const handleMarkCooked = () => {
    if (aiResponse?.relatedFoodIds?.length > 0) {
      aiResponse.relatedFoodIds.forEach(id => {
        store.markFoodAsCooked(id);
      });
    } else {
      // Fallback: reward 0.5kg
      store.recordRescuedFood(0.5);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    const remaining = store.getFoodItems();
    if (onFoodItemsUpdated) onFoodItemsUpdated(remaining);
    setActionDoneMessage('Bagus sekali! Bahan telah ditandai habis & impact kamu bertambah 🎉');
  };

  // Action: Save to active compost batch
  const handleMoveToCompost = () => {
    const item = aiResponse?.targetFoodItem || { id: 'food-temp', name: 'Tahu Putih', weightKg: 0.3 };
    const batches = store.getCompostBatches();
    const fillingBatch = batches.find(b => b.stage === 'filling') || batches[0];
    store.addFoodToCompost(item, fillingBatch?.id || null);

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    const remaining = store.getFoodItems();
    if (onFoodItemsUpdated) onFoodItemsUpdated(remaining);
    setActionDoneMessage('Bahan berhasil dialihkan ke wadah kompos aktif 🌱');
  };

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
          className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-800 text-white shadow-xs text-center transition-all"
        >
          Chat
        </button>
        <button
          onClick={onSwitchToHistory}
          className="flex-1 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 transition-all text-center"
        >
          Riwayat
        </button>
      </div>

      {/* AI Assistant Greeting Bubble */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-xs border border-emerald-200 mt-0.5">
          <Sparkles className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-slate-200/80 shadow-xs space-y-1 max-w-[320px]">
          <h4 className="font-bold text-sm text-slate-900">
            Halo {user?.name || 'Budi'}! Mau aku bantu apa hari ini?
          </h4>
          <p className="text-xs text-slate-500">
            Pilih salah satu di bawah ya.
          </p>
        </div>
      </div>

      {/* STATE 1: TOPIC SELECTION (Figma default) */}
      {!activeTopic && (
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            PILIH TOPIK
          </span>

          {/* Topic 1: Resep dari bahan hampir basi */}
          <button
            onClick={() => handleSelectTopic('recipe')}
            className="w-full text-left bg-white hover:bg-slate-50 active:scale-[0.99] p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Resep dari bahan hampir basi
                </h4>
                <p className="text-xs text-slate-500">
                  Pilih bahan kritis, AI beri resep kilat
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Topic 2: Olah bahan basi jadi kompos */}
          <button
            onClick={() => handleSelectTopic('compost')}
            className="w-full text-left bg-white hover:bg-slate-50 active:scale-[0.99] p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Olah bahan basi jadi kompos
                </h4>
                <p className="text-xs text-slate-500">
                  Pilih bahan rusak, AI beri panduan kompos
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Footer Disclaimer */}
          <div className="pt-8 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <Lock className="w-3.5 h-3.5" />
            <span>Tanya AI hanya menjawab seputar resep dan kompos</span>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING / GENERATING */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Meracik Solusi Zero-Waste...</h4>
            <p className="text-xs text-slate-500 mt-1">
              Gemini AI sedang menganalisis bahan kulkasmu
            </p>
          </div>
        </div>
      )}

      {/* STATE 3: AI ONE-SHOT RESULT DISPLAY */}
      {aiResponse && !loading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* User Auto-Sent Bubble */}
          <div className="flex justify-end">
            <div className="bg-emerald-800 text-white rounded-2xl rounded-tr-xs p-3.5 max-w-[300px] shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Terkirim Otomatis</span>
              <p className="text-xs font-medium leading-relaxed">
                "{aiResponse.prompt}"
              </p>
            </div>
          </div>

          {/* AI Response Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                AI
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{aiResponse.title}</h3>
            </div>

            {/* Intro text */}
            {aiResponse.data?.introText && (
              <p className="text-xs text-slate-700 leading-relaxed bg-[#F0FDF4] p-3.5 rounded-2xl border border-emerald-100 font-medium">
                {aiResponse.data.introText}
              </p>
            )}

            {/* Recipe Meta Badges */}
            {aiResponse.type === 'recipe' && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-xl border border-amber-200/70 flex items-center gap-1.5 shadow-xs">
                  ⏱️ {aiResponse.data?.cookingTimeMinutes || 12} menit
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-xl border border-emerald-200/70 flex items-center gap-1.5 shadow-xs">
                  ⚡ {aiResponse.data?.difficulty || 'Sangat Mudah'}
                </span>
                <span className="text-xs bg-slate-50 text-slate-800 font-bold px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs">
                  👥 {aiResponse.data?.servings || 2} porsi
                </span>
              </div>
            )}

            {/* Compost Safety Warning & Why */}
            {aiResponse.type === 'compost' && (
              <div className="space-y-2">
                {aiResponse.data?.safetyWarning && (
                  <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl border border-rose-200 text-xs font-medium">
                    ⚠️ {aiResponse.data.safetyWarning}
                  </div>
                )}
                {aiResponse.data?.why && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed">
                    💡 <span className="font-bold text-slate-800">Kenapa bisa jadi kompos?</span> {aiResponse.data.why}
                  </p>
                )}
                {aiResponse.data?.recommendedMethod && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200/70 text-xs font-semibold flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Metode: {aiResponse.data.recommendedMethod}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step by Step */}
            {aiResponse.data?.steps && (
              <div className="space-y-2.5 pt-1">
                <h4 className="font-bold text-xs text-slate-900 tracking-wide uppercase">
                  Langkah Pembuatan:
                </h4>
                <ol className="space-y-2">
                  {aiResponse.data.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Read-Only Notice (Mandatory from Figma 32:3707) */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100/80 py-2.5 px-3.5 rounded-xl border border-slate-200 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Balasan AI ini tidak bisa dibalas lagi (One-Shot Read-Only).</span>
            </div>

            {/* Action Done Success Banner */}
            {actionDoneMessage && (
              <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{actionDoneMessage}</span>
              </div>
            )}

            {/* Action CTA Buttons */}
            <div className="space-y-2 pt-2">
              {aiResponse.type === 'recipe' && !actionDoneMessage && (
                <button
                  onClick={handleMarkCooked}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Masakan Selesai & Dihabiskan</span>
                </button>
              )}

              {aiResponse.type === 'compost' && !actionDoneMessage && (
                <button
                  onClick={handleMoveToCompost}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Simpan ke Wadah Kompos</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onSwitchToHistory}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors text-center"
                >
                  Lihat Riwayat Chat
                </button>
                <button
                  onClick={() => {
                    setActiveTopic(null);
                    setAiResponse(null);
                    setActionDoneMessage(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
                >
                  Tanya Topik Lain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
