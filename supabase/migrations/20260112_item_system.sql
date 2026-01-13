-- Migration: Add item system to marketplace
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. Add new columns to listings table for item system
-- =====================================================

-- Tier: godly, holy, blessed, or none (default)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'none';

-- Base type ID (references frontend constants, e.g., 'sword', 'breastplate')
ALTER TABLE listings ADD COLUMN IF NOT EXISTS base_type_id VARCHAR(50);

-- Suffix modifier ID (e.g., 'rejuvenating', 'mauling')
ALTER TABLE listings ADD COLUMN IF NOT EXISTS suffix_modifier_id VARCHAR(50);

-- Suffix animal ID (e.g., 'lion', 'elephant')
ALTER TABLE listings ADD COLUMN IF NOT EXISTS suffix_animal_id VARCHAR(50);

-- Socket count (0-3 empty gem slots)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS socket_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD CONSTRAINT listings_socket_count_check
  CHECK (socket_count >= 0 AND socket_count <= 3);

-- Level requirement (1-25)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS level_requirement INTEGER DEFAULT 1;
ALTER TABLE listings ADD CONSTRAINT listings_level_requirement_check
  CHECK (level_requirement >= 1 AND level_requirement <= 25);

-- Stats as JSONB (flexible structure for various stat combinations)
-- Example: {"strength": 50, "agility": 30, "weaponValue": 120}
ALTER TABLE listings ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';

-- Equip effects as text array
-- Example: ["+10% Melee Damage", "+5 Fire Resistance"]
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equip_effects TEXT[];

-- =====================================================
-- 2. Create indexes for filtering
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_listings_tier ON listings(tier);
CREATE INDEX IF NOT EXISTS idx_listings_base_type ON listings(base_type_id);
CREATE INDEX IF NOT EXISTS idx_listings_socket_count ON listings(socket_count);
CREATE INDEX IF NOT EXISTS idx_listings_level_requirement ON listings(level_requirement);

-- GIN index for JSONB stats (for queries like "strength > 50")
CREATE INDEX IF NOT EXISTS idx_listings_stats ON listings USING GIN(stats);

-- =====================================================
-- 3. Optional: Reference tables for item data
-- These are optional since the frontend uses constants,
-- but useful for data validation and future expansion
-- =====================================================

-- Base item types
CREATE TABLE IF NOT EXISTS item_base_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slot VARCHAR(20) NOT NULL,
  category VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suffix animals (stat combinations)
CREATE TABLE IF NOT EXISTS item_suffix_animals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  primary_stat VARCHAR(20) NOT NULL,
  secondary_stat VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suffix modifiers (bonus effects)
CREATE TABLE IF NOT EXISTS item_suffix_modifiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  effect_type VARCHAR(50) NOT NULL,
  description VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. Seed reference data
-- =====================================================

-- Insert base types
INSERT INTO item_base_types (id, name, slot, category) VALUES
  ('sword', 'Sword', 'weapon', 'weapons'),
  ('blade', 'Blade', 'weapon', 'weapons'),
  ('bow', 'Bow', 'weapon', 'weapons'),
  ('staff', 'Staff', 'weapon', 'weapons'),
  ('dagger', 'Dagger', 'weapon', 'weapons'),
  ('axe', 'Axe', 'weapon', 'weapons'),
  ('mace', 'Mace', 'weapon', 'weapons'),
  ('wand', 'Wand', 'weapon', 'weapons'),
  ('breastplate', 'Breastplate', 'chest', 'armor'),
  ('helm', 'Helm', 'head', 'armor'),
  ('gauntlets', 'Gauntlets', 'hands', 'armor'),
  ('greaves', 'Greaves', 'legs', 'armor'),
  ('sabatons', 'Sabatons', 'feet', 'armor'),
  ('sash', 'Sash', 'belt', 'armor'),
  ('shield', 'Shield', 'offhand', 'armor'),
  ('ring', 'Ring', 'ring', 'accessories'),
  ('amulet', 'Amulet', 'neck', 'accessories')
ON CONFLICT (id) DO NOTHING;

-- Insert suffix animals
INSERT INTO item_suffix_animals (id, name, primary_stat, secondary_stat) VALUES
  ('elephant', 'Elephant', 'strength', 'courage'),
  ('bear', 'Bear', 'strength', 'intelligence'),
  ('lion', 'Lion', 'strength', 'courage'),
  ('whale', 'Whale', 'strength', 'willpower'),
  ('tiger', 'Tiger', 'agility', 'strength'),
  ('eagle', 'Eagle', 'agility', 'courage'),
  ('wolf', 'Wolf', 'agility', 'willpower'),
  ('owl', 'Owl', 'intelligence', 'willpower'),
  ('serpent', 'Serpent', 'agility', 'intelligence'),
  ('fox', 'Fox', 'intelligence', 'agility')
ON CONFLICT (id) DO NOTHING;

-- Insert suffix modifiers
INSERT INTO item_suffix_modifiers (id, name, effect_type, description) VALUES
  ('rejuvenating', 'Rejuvenating', 'regeneration', '+Regeneration'),
  ('butchering', 'Butchering', 'weapon_value', '+Weapon Value'),
  ('chaotic', 'Chaotic', 'resist_shadow', '+Shadow Resist'),
  ('dragonslayer', 'Dragonslayer', 'weapon_value', '+Weapon Value'),
  ('merciless', 'Merciless', 'crit_ranged', '+Ranged Crit'),
  ('diabolic', 'Diabolic', 'crit_spell', '+Spell Crit'),
  ('mauling', 'Mauling', 'skill_maces', '+Maces Skill'),
  ('fortifying', 'Fortifying', 'armor_value', '+Armor Value'),
  ('blazing', 'Blazing', 'resist_fire', '+Fire Resist'),
  ('frozen', 'Frozen', 'resist_cold', '+Cold Resist'),
  ('savage', 'Savage', 'crit_melee', '+Melee Crit'),
  ('stalwart', 'Stalwart', 'block_chance', '+Block Chance'),
  ('evasive', 'Evasive', 'dodge_chance', '+Dodge Chance')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. Update RLS policies for new tables
-- =====================================================

-- Enable RLS on reference tables
ALTER TABLE item_base_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_suffix_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_suffix_modifiers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reference tables
CREATE POLICY "Allow public read on item_base_types" ON item_base_types
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on item_suffix_animals" ON item_suffix_animals
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on item_suffix_modifiers" ON item_suffix_modifiers
  FOR SELECT USING (true);

-- =====================================================
-- 6. Done!
-- =====================================================
-- The listings table now supports:
-- - tier (godly/holy/blessed/none)
-- - base_type_id (sword, breastplate, etc.)
-- - suffix_modifier_id (rejuvenating, mauling, etc.)
-- - suffix_animal_id (lion, elephant, etc.)
-- - socket_count (0-3)
-- - level_requirement (1-25)
-- - stats (JSONB with strength, agility, etc.)
-- - equip_effects (text array of bonus effects)
