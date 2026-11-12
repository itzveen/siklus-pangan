/**
 * KONFIGURASI BASE URL API BACKEND
 * Tempel / ubah link API Backend di variabel API_BASE_URL di bawah ini:
 */
export const API_BASE_URL = "https://siklus-pangan-nine.vercel.app/api";

/**
 * Helper fetch ke REST API Backend (https://siklus-pangan-nine.vercel.app/api/...)
 */
export async function fetchFromBackend(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }
  return response.json();
}
