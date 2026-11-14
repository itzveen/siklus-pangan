-- ============================================================================
-- Seed Data Deterministik EatWise (SiklusPangan)
-- Digunakan untuk simulasi demo dan pengujian integrasi
-- ============================================================================

INSERT INTO users (id, name, full_name, email, household_type, notification_hour, is_logged_in)
VALUES ('user-demo-1', 'Budi', 'Budi Santoso', 'budi@gmail.com', 'house', '08:00', TRUE);

INSERT INTO food_items (id, stock_type, name, category, category_label, quantity, unit, quantity_text, storage, expiry_days, max_expiry_days, weight_kg, status, icon, added_at)
VALUES
  ('food-1', 'raw', 'Bayam Hijau', 'vegetable', 'Sayur & Buah', 1, 'ikat', '1 ikat (250g)', 'chiller', 1, 4, 0.25, 'warning', '🥬', '2026-11-12'),
  ('food-2', 'raw', 'Wortel', 'vegetable', 'Sayur & Buah', 3, 'batang', '3 batang (300g)', 'chiller', 6, 7, 0.30, 'safe', '🥕', '2026-11-13'),
  ('food-3', 'raw', 'Telur Ayam', 'meat', 'Lauk Hewani', 4, 'butir', '4 butir (250g)', 'chiller', 2, 14, 0.25, 'warning', '🥚', '2026-11-09'),
  ('food-4', 'raw', 'Tahu Putih', 'plant_protein', 'Lauk Nabati', 1, 'bungkus', '1 bungkus (300g)', 'chiller', 0, 4, 0.30, 'spoiled', '🧈', '2026-11-09'),
  ('food-5', 'leftover', 'Sop Ayam Sisa', 'leftover', 'Masakan Sisa', 2, 'porsi', '2 porsi (400g)', 'chiller', 1, 2, 0.40, 'warning', '🍲', '2026-11-13');

INSERT INTO compost_batches (id, title, subtitle, method, stage, day_count, fill_percentage, curing_days_left, total_weight_kg, started_at)
VALUES
  ('batch-1', 'Batch #1', 'Wadah Dapur', 'Takakura / Wadah Kompos Berpori', 'filling', 1, 60, 14, 1.80, '2026-11-03'),
  ('batch-2', 'Batch #2', 'Ember Pematangan', 'Kompos Padat Wadah', 'curing', 5, 35, 9, 3.50, '2026-10-28');

INSERT INTO harvest_history (id, title, harvest_date, weight_kg, output_type, status)
VALUES
  ('batch-0', 'Batch #0', '28 Okt', 3.50, 'Pupuk Organik Siap Pakai', 'Selesai');

INSERT INTO impact_stats (id, rescued_food_kg, composted_food_kg, co2e_prevented_kg)
VALUES (1, 3.80, 3.80, 9.50);
