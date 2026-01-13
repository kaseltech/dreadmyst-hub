// Types for Dreadmyst game data extracted from game.db

export interface AffixStat {
  stat: string;
  value: number;
}

export interface Affix {
  entry: number;
  name: string;
  is_animal: boolean;
  min_level: number;
  max_level: number;
  stats: AffixStat[];
}

export interface BaseItem {
  name: string;
  slot: string;
  weapon_type: string | null;
}

export interface GameData {
  stat_types: Record<string, string>;
  equip_slots: Record<string, string>;
  quality_tiers: Record<string, string>;
  weapon_types: Record<string, string>;
  affixes: Affix[];
  base_items: BaseItem[];
}

// Stat display names
export const STAT_DISPLAY_NAMES: Record<string, string> = {
  Mana: 'Mana',
  Health: 'Health',
  ArmorValue: 'Armor',
  Strength: 'Strength',
  Agility: 'Agility',
  Willpower: 'Willpower',
  Intelligence: 'Intelligence',
  Courage: 'Courage',
  Regeneration: 'Regen',
  Meditate: 'Meditate',
  WeaponValue: 'Weapon Value',
  RangedWeaponValue: 'Ranged Value',
  MeleeCritical: 'Melee Crit',
  RangedCritical: 'Ranged Crit',
  SpellCritical: 'Spell Crit',
  DodgeRating: 'Dodge',
  BlockRating: 'Block',
  StaffSkill: 'Staves',
  MaceSkill: 'Maces',
  AxesSkill: 'Axes',
  SwordSkill: 'Swords',
  RangedSkill: 'Ranged',
  DaggerSkill: 'Daggers',
  WandSkill: 'Wands',
  ShieldSkill: 'Shields',
  ResistFrost: 'Frost Resist',
  ResistFire: 'Fire Resist',
  ResistShadow: 'Shadow Resist',
  ResistHoly: 'Holy Resist',
};

// Quality tier colors
export const QUALITY_COLORS: Record<string, string> = {
  Junk: '#9ca3af',      // gray
  Normal: '#e5e5e5',    // white
  Radiant: '#3b82f6',   // blue
  Blessed: '#a855f7',   // purple
  Holy: '#f59e0b',      // orange
  Godly: '#ef4444',     // red/gold
};
