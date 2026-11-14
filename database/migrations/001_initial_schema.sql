-- Migration 001: Initial Schema for EatWise (SiklusPangan)
-- Menginisialisasi struktur tabel utama untuk stok pangan, batch kompos, riwayat AI, dan statistik dampak lingkungan.

-- Lihat definisi tabel utama pada ../schema.sql
INSERT INTO impact_stats (id, rescued_food_kg, composted_food_kg, co2e_prevented_kg)
VALUES (1, 0.00, 0.00, 0.00)
ON CONFLICT (id) DO NOTHING;
