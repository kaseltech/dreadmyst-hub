/**
 * Dreadmyst Online Item System Types
 *
 * Item naming format: "{Tier} {BaseType} of the {Modifier} {Animal}"
 * Example: "Godly Breastplate of the Mauling Lion"
 */

// Tier system: T1 = Godly (best), T2 = Holy, T3 = Blessed
export type ItemTier = 'godly' | 'holy' | 'blessed' | 'none';

export const TIER_CONFIG: Record<ItemTier, { label: string; color: string; bgColor: string; hexColor: string; order: number }> = {
  godly: { label: 'Godly', color: 'text-purple-400', bgColor: 'bg-purple-500/20', hexColor: '#c084fc', order: 1 },
  holy: { label: 'Holy', color: 'text-pink-400', bgColor: 'bg-pink-500/20', hexColor: '#f472b6', order: 2 },
  blessed: { label: 'Blessed', color: 'text-blue-400', bgColor: 'bg-blue-500/20', hexColor: '#60a5fa', order: 3 },
  none: { label: 'Normal', color: 'text-gray-300', bgColor: 'bg-gray-500/20', hexColor: '#9ca3af', order: 4 },
};

// Equipment slots
export type EquipmentSlot =
  | 'weapon'
  | 'offhand'
  | 'head'
  | 'chest'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'belt'
  | 'ring'
  | 'neck';

export type ItemCategory = 'weapons' | 'armor' | 'accessories';

// Base item types
export interface ItemBaseType {
  id: string;
  name: string;
  slot: EquipmentSlot;
  category: ItemCategory;
}

export const BASE_TYPES: ItemBaseType[] = [
  // Weapons
  { id: 'sword', name: 'Sword', slot: 'weapon', category: 'weapons' },
  { id: 'blade', name: 'Blade', slot: 'weapon', category: 'weapons' },
  { id: 'bow', name: 'Bow', slot: 'weapon', category: 'weapons' },
  { id: 'staff', name: 'Staff', slot: 'weapon', category: 'weapons' },
  { id: 'dagger', name: 'Dagger', slot: 'weapon', category: 'weapons' },
  { id: 'axe', name: 'Axe', slot: 'weapon', category: 'weapons' },
  { id: 'mace', name: 'Mace', slot: 'weapon', category: 'weapons' },
  { id: 'wand', name: 'Wand', slot: 'weapon', category: 'weapons' },

  // Armor
  { id: 'breastplate', name: 'Breastplate', slot: 'chest', category: 'armor' },
  { id: 'helm', name: 'Helm', slot: 'head', category: 'armor' },
  { id: 'gauntlets', name: 'Gauntlets', slot: 'hands', category: 'armor' },
  { id: 'greaves', name: 'Greaves', slot: 'legs', category: 'armor' },
  { id: 'sabatons', name: 'Sabatons', slot: 'feet', category: 'armor' },
  { id: 'sash', name: 'Sash', slot: 'belt', category: 'armor' },
  { id: 'shield', name: 'Shield', slot: 'offhand', category: 'armor' },

  // Accessories
  { id: 'ring', name: 'Ring', slot: 'ring', category: 'accessories' },
  { id: 'amulet', name: 'Amulet', slot: 'neck', category: 'accessories' },
];

// All item stats in the game
export type ItemStatType =
  // Primary Attributes
  | 'strength'
  | 'agility'
  | 'intelligence'
  | 'willpower'
  | 'courage'
  // Secondary Stats
  | 'health'
  | 'mana'
  | 'armorValue'
  | 'weaponValue'
  // Regeneration
  | 'regeneration'
  | 'meditate'
  // Combat Values
  | 'meleeValue'
  | 'rangedValue'
  | 'meleeCritical'
  | 'rangedCritical'
  | 'spellCritical'
  // Defense
  | 'dodgeRating'
  | 'blockRating'
  // Weapon Skills
  | 'skillDaggers'
  | 'skillStaves'
  | 'skillShields'
  | 'skillAxes'
  | 'skillSwords'
  | 'skillRanged'
  | 'skillWands'
  | 'skillMaces'
  // Resistances
  | 'resistFrost'
  | 'resistFire'
  | 'resistShadow'
  | 'resistHoly';

// Primary attributes only (for builds)
export type PrimaryStat = 'strength' | 'agility' | 'intelligence' | 'willpower' | 'courage';

// Full stat configuration with categories
export interface StatInfo {
  label: string;
  abbrev: string;
  color: string;
  category: 'primary' | 'secondary' | 'regen' | 'combat' | 'defense' | 'skills' | 'resist';
}

export const STAT_CONFIG: Record<ItemStatType, StatInfo> = {
  // Primary Attributes
  strength: { label: 'Strength', abbrev: 'STR', color: 'text-red-400', category: 'primary' },
  agility: { label: 'Agility', abbrev: 'AGI', color: 'text-green-400', category: 'primary' },
  intelligence: { label: 'Intelligence', abbrev: 'INT', color: 'text-blue-400', category: 'primary' },
  willpower: { label: 'Willpower', abbrev: 'WIL', color: 'text-purple-400', category: 'primary' },
  courage: { label: 'Courage', abbrev: 'CRG', color: 'text-yellow-400', category: 'primary' },
  // Secondary Stats
  health: { label: 'Health', abbrev: 'HP', color: 'text-red-300', category: 'secondary' },
  mana: { label: 'Mana', abbrev: 'MP', color: 'text-blue-300', category: 'secondary' },
  armorValue: { label: 'Armor Value', abbrev: 'ARM', color: 'text-slate-300', category: 'secondary' },
  weaponValue: { label: 'Weapon Value', abbrev: 'WPN', color: 'text-orange-300', category: 'secondary' },
  // Regeneration
  regeneration: { label: 'Regeneration', abbrev: 'REG', color: 'text-pink-400', category: 'regen' },
  meditate: { label: 'Meditate', abbrev: 'MED', color: 'text-indigo-400', category: 'regen' },
  // Combat Values
  meleeValue: { label: 'Melee Value', abbrev: 'MEL', color: 'text-orange-400', category: 'combat' },
  rangedValue: { label: 'Ranged Value', abbrev: 'RNG', color: 'text-lime-400', category: 'combat' },
  meleeCritical: { label: 'Melee Critical', abbrev: 'MCR', color: 'text-orange-300', category: 'combat' },
  rangedCritical: { label: 'Ranged Critical', abbrev: 'RCR', color: 'text-lime-300', category: 'combat' },
  spellCritical: { label: 'Spell Critical', abbrev: 'SCR', color: 'text-violet-400', category: 'combat' },
  // Defense
  dodgeRating: { label: 'Dodge Rating', abbrev: 'DOD', color: 'text-emerald-400', category: 'defense' },
  blockRating: { label: 'Block Rating', abbrev: 'BLK', color: 'text-amber-400', category: 'defense' },
  // Weapon Skills
  skillDaggers: { label: 'Daggers Skill', abbrev: 'DAG', color: 'text-rose-300', category: 'skills' },
  skillStaves: { label: 'Staves Skill', abbrev: 'STV', color: 'text-indigo-300', category: 'skills' },
  skillShields: { label: 'Shields Skill', abbrev: 'SHD', color: 'text-slate-400', category: 'skills' },
  skillAxes: { label: 'Axes Skill', abbrev: 'AXE', color: 'text-red-300', category: 'skills' },
  skillSwords: { label: 'Swords Skill', abbrev: 'SWD', color: 'text-sky-300', category: 'skills' },
  skillRanged: { label: 'Ranged Skill', abbrev: 'BOW', color: 'text-lime-300', category: 'skills' },
  skillWands: { label: 'Wands Skill', abbrev: 'WND', color: 'text-purple-300', category: 'skills' },
  skillMaces: { label: 'Maces Skill', abbrev: 'MCE', color: 'text-amber-300', category: 'skills' },
  // Resistances
  resistFrost: { label: 'Resist Frost', abbrev: 'FRS', color: 'text-cyan-400', category: 'resist' },
  resistFire: { label: 'Resist Fire', abbrev: 'FIR', color: 'text-rose-400', category: 'resist' },
  resistShadow: { label: 'Resist Shadow', abbrev: 'SHD', color: 'text-gray-400', category: 'resist' },
  resistHoly: { label: 'Resist Holy', abbrev: 'HLY', color: 'text-amber-200', category: 'resist' },
};

// Helper to get stats by category
export function getStatsByCategory(category: StatInfo['category']): ItemStatType[] {
  return (Object.entries(STAT_CONFIG) as [ItemStatType, StatInfo][])
    .filter(([_, info]) => info.category === category)
    .map(([stat]) => stat);
}

// Primary stats only (legacy support)
export const PRIMARY_STATS: PrimaryStat[] = ['strength', 'agility', 'intelligence', 'willpower', 'courage'];

// Animals = stat combinations
export interface SuffixAnimal {
  id: string;
  name: string;
  primaryStat: PrimaryStat;
  secondaryStat: PrimaryStat;
}

export const SUFFIX_ANIMALS: SuffixAnimal[] = [
  { id: 'elephant', name: 'Elephant', primaryStat: 'strength', secondaryStat: 'courage' },
  { id: 'bear', name: 'Bear', primaryStat: 'strength', secondaryStat: 'intelligence' },
  { id: 'lion', name: 'Lion', primaryStat: 'strength', secondaryStat: 'courage' },
  { id: 'whale', name: 'Whale', primaryStat: 'strength', secondaryStat: 'willpower' },
  { id: 'tiger', name: 'Tiger', primaryStat: 'agility', secondaryStat: 'strength' },
  { id: 'eagle', name: 'Eagle', primaryStat: 'agility', secondaryStat: 'courage' },
  { id: 'wolf', name: 'Wolf', primaryStat: 'agility', secondaryStat: 'willpower' },
  { id: 'owl', name: 'Owl', primaryStat: 'intelligence', secondaryStat: 'willpower' },
  { id: 'serpent', name: 'Serpent', primaryStat: 'agility', secondaryStat: 'intelligence' },
  { id: 'fox', name: 'Fox', primaryStat: 'intelligence', secondaryStat: 'agility' },
];

// Effect types for modifiers (equip bonuses)
export type EffectType =
  // Stats
  | 'health'
  | 'regeneration'
  | 'meditate'
  | 'armor_value'
  | 'courage'
  // Combat
  | 'melee_value'
  | 'ranged_value'
  | 'melee_critical'
  | 'ranged_critical'
  | 'spell_critical'
  // Defense
  | 'dodge_rating'
  | 'block_rating'
  // Resistances
  | 'resist_frost'
  | 'resist_fire'
  | 'resist_shadow'
  | 'resist_holy'
  // Weapon Skills
  | 'skill_daggers'
  | 'skill_staves'
  | 'skill_shields'
  | 'skill_axes'
  | 'skill_swords'
  | 'skill_ranged'
  | 'skill_wands'
  | 'skill_maces';

// Modifiers = bonus effects (known naming patterns)
export interface SuffixModifier {
  id: string;
  name: string;
  effectType: EffectType;
  description: string;
}

export const SUFFIX_MODIFIERS: SuffixModifier[] = [
  // Stats
  { id: 'undying', name: 'Undying', effectType: 'health', description: '+Health' },
  { id: 'curative', name: 'Curative', effectType: 'regeneration', description: '+Regeneration' },
  { id: 'concentrating', name: 'Concentrating', effectType: 'meditate', description: '+Meditate' },
  { id: 'protective', name: 'Protective', effectType: 'armor_value', description: '+Armor Value' },
  { id: 'brave', name: 'Brave', effectType: 'courage', description: '+Courage' },
  // Combat
  { id: 'piercing', name: 'Piercing', effectType: 'ranged_value', description: '+Ranged Value' },
  { id: 'mutilating', name: 'Mutilating', effectType: 'melee_critical', description: '+Melee Critical' },
  { id: 'deadly', name: 'Deadly', effectType: 'skill_ranged', description: '+Ranged Skill' },
  // Defense
  { id: 'eluding', name: 'Eluding', effectType: 'dodge_rating', description: '+Dodge Rating' },
  // Resistances
  { id: 'blinding', name: 'Blinding', effectType: 'resist_holy', description: '+Resist Holy' },
  { id: 'blazing', name: 'Blazing', effectType: 'resist_fire', description: '+Resist Fire' },
  { id: 'frozen', name: 'Frozen', effectType: 'resist_frost', description: '+Resist Frost' },
  { id: 'chaotic', name: 'Chaotic', effectType: 'resist_shadow', description: '+Resist Shadow' },
  // Weapon Skills
  { id: 'puncturing', name: 'Puncturing', effectType: 'skill_daggers', description: '+Daggers Skill' },
  { id: 'mauling', name: 'Mauling', effectType: 'skill_maces', description: '+Maces Skill' },
];

// Full item structure for listings
export interface ItemStats {
  strength?: number;
  agility?: number;
  intelligence?: number;
  willpower?: number;
  courage?: number;
  weaponValue?: number;
  armorValue?: number;
  [key: string]: number | undefined;
}

export interface ListingItem {
  tier: ItemTier;
  baseTypeId: string | null;
  suffixModifierId: string | null;
  suffixAnimalId: string | null;
  customName: string | null; // For hybrid approach - override the generated name
  socketCount: number;
  levelRequirement: number;
  stats: ItemStats;
  equipEffects: string[];
}

/**
 * Generate item name from components
 * Format: "{Tier} {BaseType} of the {Modifier} {Animal}"
 */
export function generateItemName(item: {
  tier: ItemTier;
  baseTypeId: string | null;
  suffixModifierId: string | null;
  suffixAnimalId: string | null;
}): string {
  const baseType = BASE_TYPES.find(b => b.id === item.baseTypeId);
  const modifier = SUFFIX_MODIFIERS.find(m => m.id === item.suffixModifierId);
  const animal = SUFFIX_ANIMALS.find(a => a.id === item.suffixAnimalId);

  if (!baseType) return '';

  let name = '';

  // Add tier prefix (except for 'none')
  if (item.tier !== 'none') {
    name += TIER_CONFIG[item.tier].label + ' ';
  }

  // Add base type
  name += baseType.name;

  // Add suffix if both modifier and animal are present
  if (modifier && animal) {
    name += ` of the ${modifier.name} ${animal.name}`;
  } else if (animal) {
    name += ` of the ${animal.name}`;
  } else if (modifier) {
    name += ` of ${modifier.name}`;
  }

  return name;
}

/**
 * Get the display name for an item (custom name or generated)
 */
export function getItemDisplayName(item: ListingItem): string {
  if (item.customName) {
    return item.customName;
  }
  return generateItemName(item);
}

/**
 * Get tier color class for styling
 */
export function getTierColorClass(tier: ItemTier): string {
  return TIER_CONFIG[tier].color;
}

/**
 * Get tier background class for badges
 */
export function getTierBgClass(tier: ItemTier): string {
  return TIER_CONFIG[tier].bgColor;
}

// Helper to get base types by category
export function getBaseTypesByCategory(category: ItemCategory): ItemBaseType[] {
  return BASE_TYPES.filter(bt => bt.category === category);
}

// Helper to get base types by slot
export function getBaseTypesBySlot(slot: EquipmentSlot): ItemBaseType[] {
  return BASE_TYPES.filter(bt => bt.slot === slot);
}
