const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://siklus-pangan-nine.vercel.app/api';

/**
 * REST API Client for SiklusPangan / EatWise Backend
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to hit ${endpoint} via ${method}:`, err.message);
    return null;
  }
}

// 1. Food Items API
export async function apiGetFoods() {
  return await apiRequest('/foods', 'GET');
}

export async function apiAddFood(item) {
  return await apiRequest('/foods', 'POST', item);
}

export async function apiCookFood(foodId) {
  return await apiRequest(`/foods/${foodId}/cook`, 'PATCH');
}

export async function apiSpoilFood(foodId) {
  return await apiRequest(`/foods/${foodId}/spoil`, 'PATCH');
}

// 2. Notifications API
export async function apiGetNotifications() {
  return await apiRequest('/notifications', 'GET');
}

export async function apiMarkAllNotificationsRead() {
  return await apiRequest('/notifications/read-all', 'PATCH');
}

// 3. AI & Riwayat Chat API
export async function apiGetAiHistory() {
  return await apiRequest('/ai/history', 'GET');
}

export async function apiRequestRescueRecipe(items) {
  return await apiRequest('/ai/rescue-recipe', 'POST', { items });
}

export async function apiRequestCompostGuide(item, householdType) {
  return await apiRequest('/ai/compost-guide', 'POST', { item, householdType });
}

// 4. User Profile & Auth API
export async function apiGetUserProfile() {
  return await apiRequest('/profile', 'GET');
}

export async function apiUpdateUserProfile(profile) {
  return await apiRequest('/profile', 'PUT', profile);
}

export async function apiLoginGoogle(credentialOrProfile) {
  return await apiRequest('/auth/google', 'POST', credentialOrProfile);
}

export async function apiLogout() {
  return await apiRequest('/auth/logout', 'POST');
}
