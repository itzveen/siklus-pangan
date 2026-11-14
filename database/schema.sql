-- ============================================================================
-- EatWise (SiklusPangan) Database Schema
-- Closed-Loop Food Management & Smart Upcycle AI
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    picture TEXT,
    household_type VARCHAR(32) DEFAULT 'house' CHECK (household_type IN ('house', 'apartment')),
    notification_hour VARCHAR(5) DEFAULT '08:00',
    is_logged_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_items (
    id VARCHAR(64) PRIMARY KEY,
    stock_type VARCHAR(32) DEFAULT 'raw' CHECK (stock_type IN ('raw', 'leftover')),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(32) NOT NULL,
    category_label VARCHAR(64),
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(32) DEFAULT 'porsi',
    quantity_text VARCHAR(64),
    storage VARCHAR(32) DEFAULT 'chiller' CHECK (storage IN ('chiller', 'freezer', 'room')),
    expiry_days INTEGER NOT NULL,
    max_expiry_days INTEGER DEFAULT 7,
    weight_kg DECIMAL(6, 2) DEFAULT 0.30,
    status VARCHAR(16) NOT NULL CHECK (status IN ('safe', 'warning', 'spoiled')),
    icon VARCHAR(16),
    notes TEXT,
    added_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS compost_batches (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    subtitle VARCHAR(100),
    method VARCHAR(100),
    stage VARCHAR(16) NOT NULL CHECK (stage IN ('filling', 'curing', 'ready')),
    day_count INTEGER DEFAULT 1,
    fill_percentage INTEGER DEFAULT 0 CHECK (fill_percentage BETWEEN 0 AND 100),
    curing_days_left INTEGER DEFAULT 14,
    total_weight_kg DECIMAL(8, 2) DEFAULT 0.00,
    started_at DATE NOT NULL,
    locked_at DATE
);

CREATE TABLE IF NOT EXISTS compost_logs (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES compost_batches(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    weight_kg DECIMAL(6, 2) NOT NULL,
    logged_date VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS harvest_history (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    harvest_date VARCHAR(32) NOT NULL,
    weight_kg DECIMAL(8, 2) NOT NULL,
    output_type VARCHAR(100) DEFAULT 'Pupuk Organik Siap Pakai',
    status VARCHAR(32) DEFAULT 'Selesai'
);

CREATE TABLE IF NOT EXISTS ai_history (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL CHECK (type IN ('recipe', 'compost')),
    badge VARCHAR(64),
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    prompt TEXT,
    time_label VARCHAR(16),
    date_group VARCHAR(32) DEFAULT 'HARI INI',
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    group_label VARCHAR(32) DEFAULT 'HARI INI',
    type VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    time_label VARCHAR(32),
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS impact_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    rescued_food_kg DECIMAL(10, 2) DEFAULT 0.00,
    composted_food_kg DECIMAL(10, 2) DEFAULT 0.00,
    co2e_prevented_kg DECIMAL(10, 2) DEFAULT 0.00
);
