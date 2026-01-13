-- Add equipment subtype and scroll tier columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equipment_subtype VARCHAR(50);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS scroll_tier INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN listings.equipment_subtype IS 'Weapon type (sword, dagger, etc), armor slot (helm, chest, etc), or accessory type (neck, ring, belt)';
COMMENT ON COLUMN listings.scroll_tier IS 'Scroll tier 1-5 for consumables';
