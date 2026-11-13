import * as store from '../services/storageService.js';
import {
  scanReceiptOrFoodImage,
  generateRescueRecipe,
  analyzeCompostAction
} from '../services/geminiService.js';

/**
 * KONFIGURASI BASE URL API BACKEND
 * Di production (Vercel), otomatis memakai '/api' pada domain yang sama.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'https://siklus-pangan-nine.vercel.app/api');

async function callRemoteApi(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }
  return response.json();
}

function parseJsonBody(options) {
  if (!options?.body) return {};
  if (typeof options.body === 'string') {
    try {
      return JSON.parse(options.body);
    } catch {
      return {};
    }
  }
  return options.body;
}

/**
 * Unified Backend + Persistent Storage Bridge:
 * - Endpoint AI (/ai/scan, /ai/rescue-recipe, /ai/compost-guide) memanggil REST API server
 *   (agar memakai GEMINI_API_KEY aman di server Vercel) dengan fallback geminiService.js.
 * - Operasi CRUD (/foods, /compost, /profile, /notifications) tersinkronisasi penuh ke
 *   storageService.js agar state konsisten di seluruh layar & tahan serverless cold-start.
 */
export async function fetchFromBackend(endpoint, options = {}) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const body = parseJsonBody(options);

  // 1. AI Endpoints (Real Gemini via Server API + Auto-save Chat History)
  if (method === 'POST' && path === '/ai/scan') {
    try {
      return await callRemoteApi(path, options);
    } catch {
      return await scanReceiptOrFoodImage(body.base64Data || '', body.mimeType || 'image/jpeg');
    }
  }

  if (method === 'POST' && path === '/ai/rescue-recipe') {
    const items = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : store.getFoodItems().filter((f) => f.status === 'warning').slice(0, 2);
    let result;
    try {
      result = await callRemoteApi(path, options);
    } catch {
      const recipe = await generateRescueRecipe(items);
      result = { status: 'ok', recipe };
    }
    const recipe = result?.recipe || result;
    if (recipe?.title) {
      store.addAiHistoryEntry({
        type: 'recipe',
        badge: 'Rescue Resep',
        title: recipe.title,
        summary: recipe.introText || 'Resep penyelamat bahan makanan hampir basi siap dalam 12 menit.',
        prompt: result?.autoSentPrompt || 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.',
        tags: items.map((i) => i.name || i),
        readOnly: true,
        data: recipe
      });
    }
    return result;
  }

  if (method === 'POST' && path === '/ai/compost-guide') {
    const foodName = body.foodName || body.name || 'Tahu Putih';
    const householdType = body.householdType || store.getUserProfile().householdType || 'house';
    let result;
    try {
      result = await callRemoteApi(path, options);
    } catch {
      const guide = await analyzeCompostAction({ name: foodName }, householdType);
      result = { status: 'ok', guide };
    }
    const guide = result?.guide || result?.analysis || result;
    if (guide?.steps) {
      store.addAiHistoryEntry({
        type: 'compost',
        badge: 'Kompos',
        title: `Olah ${foodName} jadi kompos`,
        summary: guide.why || `Panduan mengolah ${foodName.toLowerCase()} yang sudah basi untuk batch komposmu.`,
        prompt: result?.autoSentPrompt || `${foodName} ku sudah basi. Gimana cara mengolahnya jadi kompos?`,
        tags: [foodName],
        readOnly: true,
        data: guide
      });
    }
    return {
      ...result,
      availableBatches: store.getCompostBatches()
    };
  }

  // 2. Foods / Pantry CRUD
  if (method === 'GET' && path === '/foods') {
    return {
      status: 'ok',
      foods: store.getFoodItems(),
      impact: store.getImpactStats()
    };
  }

  if (method === 'POST' && path === '/foods') {
    const item = store.addFoodItem(body);
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', item };
  }

  if (method === 'POST' && path === '/foods/bulk') {
    const added = store.addMultipleFoodItems(Array.isArray(body.items) ? body.items : []);
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', foods: added };
  }

  const cookMatch = path.match(/^\/foods\/([^/]+)\/cook$/);
  if (method === 'PATCH' && cookMatch) {
    const foods = store.markFoodAsCooked(cookMatch[1]);
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', foods, impact: store.getImpactStats() };
  }

  const spoilMatch = path.match(/^\/foods\/([^/]+)\/spoil$/);
  if (method === 'PATCH' && spoilMatch) {
    const foods = store.markFoodAsSpoiled(spoilMatch[1]);
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', foods };
  }

  // 3. Profile
  if (method === 'GET' && path === '/profile') {
    return store.getUserProfile();
  }

  // 4. Compost Batches & Harvests
  if (method === 'GET' && path === '/compost/batches') {
    return {
      status: 'ok',
      activeBatches: store.getCompostBatches(),
      harvestHistory: store.getHarvestHistory()
    };
  }

  if (method === 'POST' && path === '/compost/add-item') {
    const batches = store.addFoodToCompost(
      { id: body.foodId, name: body.foodName || 'Bahan Basi', weightKg: Number(body.weightKg || 0.3) },
      body.option === 'new' ? null : body.batchId || null,
      body.newBatchTitle || null
    );
    callRemoteApi(path, options).catch(() => {});
    return {
      status: 'ok',
      batch: batches[0],
      activeBatches: batches,
      impact: store.getImpactStats()
    };
  }

  const lockMatch = path.match(/^\/compost\/([^/]+)\/lock$/);
  if (method === 'POST' && lockMatch) {
    const batches = store.lockBatchForCuring(lockMatch[1]);
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', activeBatches: batches };
  }

  const simMatch = path.match(/^\/compost\/([^/]+)\/simulate$/);
  if (method === 'POST' && simMatch) {
    const batches = store.fastForwardBatchDemo(simMatch[1], 14);
    const updatedBatch = batches.find((b) => b.id === simMatch[1]) || batches[0];
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', batch: updatedBatch, activeBatches: batches };
  }

  const harvestMatch = path.match(/^\/compost\/([^/]+)\/harvest$/);
  if (method === 'POST' && harvestMatch) {
    const harvest = store.harvestBatch(harvestMatch[1], Number(body.weightKg || 3.5));
    callRemoteApi(path, options).catch(() => {});
    return { status: 'ok', harvest };
  }

  const harvestDetailMatch = path.match(/^\/compost\/harvests\/([^/]+)$/);
  if (method === 'GET' && harvestDetailMatch) {
    const detail = store.getHarvestDetail(harvestDetailMatch[1]);
    return { status: 'ok', ...detail };
  }

  // Fallback ke Remote API jika ada endpoint lain
  return callRemoteApi(path, options);
}
