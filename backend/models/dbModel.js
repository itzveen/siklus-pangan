import {
  INITIAL_FOOD_ITEMS,
  INITIAL_COMPOST_BATCHES,
  INITIAL_HARVEST_HISTORY,
  INITIAL_IMPACT_STATS,
  INITIAL_USER_PROFILE,
  INITIAL_AI_HISTORY,
  INITIAL_NOTIFICATIONS
} from '../../database/seeds/dummyData.js';

export function createEmptyDb() {
  return {
    foods: [],
    batches: [],
    harvests: [],
    impact: { rescuedFoodKg: 0, compostedFoodKg: 0, co2ePreventedKg: 0 },
    profile: { name: 'Pengguna Baru', email: '', avatar: '', isLoggedIn: false },
    aiHistory: [],
    notifications: []
  };
}

export function createDemoDb() {
  return {
    foods: structuredClone(INITIAL_FOOD_ITEMS),
    batches: structuredClone(INITIAL_COMPOST_BATCHES),
    harvests: structuredClone(INITIAL_HARVEST_HISTORY),
    impact: structuredClone(INITIAL_IMPACT_STATS),
    profile: structuredClone(INITIAL_USER_PROFILE),
    aiHistory: structuredClone(INITIAL_AI_HISTORY),
    notifications: structuredClone(INITIAL_NOTIFICATIONS)
  };
}
