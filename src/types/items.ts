/**
 * Dreadmyst Online Item System Types
 *
 * Item naming format: "{Tier} {BaseType} of the {Modifier} {Animal}"
 * Example: "Godly Breastplate of the Mauling Lion"
 */

// Tier system: T1 = Godly (best), T2 = Holy, T3 = Blessed
export type ItemTier = 'godly' | 'holy' | 'blessed' | 'none';

export const TIER_CONFIG: Record<ItemTier, { label: string; color: string; bgColor: string; order: number }> = {
  godly: { label: 'Godly', color: 'text-amber-400', bgColor: 'bg-amber-500/20', order: 1 },
  holy: { label: 'Holy', color: 'text-purple-400', bgColor: 'bg-purple-500/20', order: 2 },
  blessed: { label: 'Blessed', color: 'text-blue-400', bgColor: 'bg-blue-500/20', order: 3 },
  none: { label: 'Normal', color: 'text-gray-300', bgColor: 'bg-gray-500/20', order: 4 },
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

// Primary stats in the game
export type PrimaryStat =
  | 'strength'
  | 'agility'
  | 'intelligence'
  | 'willpower'
  | 'courage';

export const STAT_CONFIG: Record<PrimaryStat, { label: string; abbrev: string; color: string }> = {
  strength: { label: 'Strength', abbrev: 'STR', color: 'text-red-400' },
  agility: { label: 'Agility', abbrev: 'AGI', color: 'text-green-400' },
  intelligence: { label: 'Intelligence', abbrev: 'INT', color: 'text-blue-400' },
  willpower: { label: 'Willpower', abbrev: 'WIL', color: 'text-purple-400' },
  courage: { label: 'Courage', abbrev: 'CRG', color: 'text-yellow-400' },
};

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

// Effect types for modifiers
export type EffectType =
  | 'regeneration'
  | 'weapon_value'
  | 'armor_value'
  | 'resist_shadow'
  | 'resist_fire'
  | 'resist_cold'
  | 'crit_melee'
  | 'crit_ranged'
  | 'crit_spell'
  | 'skill_swords'
  | 'skill_maces'
  | 'skill_bows'
  | 'skill_staves'
  | 'block_chance'
  | 'dodge_chance';

// Modifiers = bonus effects
export interface SuffixModifier {
  id: string;
  name: string;
  effectType: EffectType;
  description: string;
}

export const SUFFIX_MODIFIERS: SuffixModifier[] = [
  { id: 'rejuvenating', name: 'Rejuvenating', effectType: 'regeneration', description: '+Regeneration' },
  { id: 'butchering', name: 'Butchering', effectType: 'weapon_value', description: '+Weapon Value' },
  { id: 'chaotic', name: 'Chaotic', effectType: 'resist_shadow', description: '+Shadow Resist' },
  { id: 'dragonslayer', name: 'Dragonslayer', effectType: 'weapon_value', description: '+Weapon Value' },
  { id: 'merciless', name: 'Merciless', effectType: 'crit_ranged', description: '+Ranged Crit' },
  { id: 'diabolic', name: 'Diabolic', effectType: 'crit_spell', description: '+Spell Crit' },
  { id: 'mauling', name: 'Mauling', effectType: 'skill_maces', description: '+Maces Skill' },
  { id: 'fortifying', name: 'Fortifying', effectType: 'armor_value', description: '+Armor Value' },
  { id: 'blazing', name: 'Blazing', effectType: 'resist_fire', description: '+Fire Resist' },
  { id: 'frozen', name: 'Frozen', effectType: 'resist_cold', description: '+Cold Resist' },
  { id: 'savage', name: 'Savage', effectType: 'crit_melee', description: '+Melee Crit' },
  { id: 'stalwart', name: 'Stalwart', effectType: 'block_chance', description: '+Block Chance' },
  { id: 'evasive', name: 'Evasive', effectType: 'dodge_chance', description: '+Dodge Chance' },
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
