-- Add structured stat fields to builds table
ALTER TABLE builds ADD COLUMN IF NOT EXISTS base_stats JSONB;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS secondary_stats JSONB;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS abilities JSONB;

-- Add comments for documentation
COMMENT ON COLUMN builds.base_stats IS 'Base character stats: strength, agility, intelligence, willpower, courage';
COMMENT ON COLUMN builds.secondary_stats IS 'Secondary stats: health, mana, stamina';
COMMENT ON COLUMN builds.abilities IS 'Ability investments: ability_id -> level (0-5)';
