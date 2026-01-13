/**
 * Dreadmyst Class & Ability Data
 *
 * Classes: Paladin, Mage, Ranger, Cleric
 * Abilities can be leveled 1-5
 * Stats: STR, AGI, INT, WIL, CRG
 */

export type ClassName = 'paladin' | 'mage' | 'ranger' | 'cleric';

export interface Ability {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  type: 'spell' | 'action';
}

export interface ClassData {
  id: ClassName;
  name: string;
  description: string;
  weapons: string[];
  primaryStats: string[];
  abilities: Ability[];
}

export const CLASS_DATA: Record<ClassName, ClassData> = {
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    description: 'Divine spellcasters and healers - essential for group content.',
    weapons: ['Staves', 'Maces', 'Shields'],
    primaryStats: ['INT', 'WIL'],
    abilities: [
      // Spells
      { id: 'discipline', name: 'Discipline', description: 'Reduces all damage taken by a friendly target by 50% for 8 sec. Target is immune to Dispel.', maxLevel: 5, type: 'spell' },
      { id: 'blessed-shield', name: 'Blessed Shield', description: 'Absorbs damage for 25 sec.', maxLevel: 5, type: 'spell' },
      { id: 'satanic-madness', name: 'Satanic Madness', description: 'Horrify up to five nearby enemies with visions of Hell, causing them to flee in terror for 8 sec.', maxLevel: 5, type: 'spell' },
      { id: 'reincarnation', name: 'Reincarnation', description: 'Grants a blessing to a friendly target that lasts for 5 minutes. If the target dies while the blessing is in effect, they are resurrected.', maxLevel: 1, type: 'spell' },
      { id: 'rejuvenation', name: 'Rejuvenation', description: 'Heals a friendly target over 15 sec.', maxLevel: 5, type: 'spell' },
      { id: 'resurrection', name: 'Resurrection', description: 'Brings a dead player back to life with 50% health and mana. Cannot be cast when in combat.', maxLevel: 1, type: 'spell' },
      { id: 'plague', name: 'Plague', description: 'An instrument of darkness that causes Shadow damage every 2 sec for 12 sec.', maxLevel: 5, type: 'spell' },
      { id: 'smite', name: 'Smite', description: 'Consumes an enemy target in Holy flames, dealing weapon damage as Holy damage.', maxLevel: 5, type: 'spell' },
      { id: 'harrowing-strike', name: 'Harrowing Strike', description: 'Deals 200% weapon damage as Shadow damage and reducing their damage by 5% for 10 sec.', maxLevel: 5, type: 'spell' },
      { id: 'heal', name: 'Heal', description: 'Heals a friendly target.', maxLevel: 5, type: 'spell' },
      { id: 'holy-bolt', name: 'Holy Bolt', description: 'Deals Holy damage to an enemy and incapacitating them for 1 sec. Breaks on damage.', maxLevel: 5, type: 'spell' },
      { id: 'inner-strength', name: 'Inner Strength', description: 'Increases a friendly target\'s damage by 20% for 15 sec.', maxLevel: 5, type: 'spell' },
      { id: 'lesser-heal', name: 'Lesser Heal', description: 'Heals a friendly target for a small amount.', maxLevel: 5, type: 'spell' },
      { id: 'penance', name: 'Penance', description: 'Punish an enemy target for their sins, burning 250 points of their Mana in the process.', maxLevel: 1, type: 'spell' },
    ],
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'Divine warriors focused on defense - the tank class of Dreadmyst.',
    weapons: ['Swords', 'Maces', 'Axes', 'Shields'],
    primaryStats: ['STR', 'WIL', 'CRG'],
    abilities: [
      // Placeholder - will be filled in with actual abilities
      { id: 'placeholder-1', name: 'Divine Shield', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'spell' },
      { id: 'placeholder-2', name: 'Holy Strike', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'action' },
      { id: 'placeholder-3', name: 'Taunt', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'action' },
    ],
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'Arcane spellcasters with powerful magical abilities.',
    weapons: ['Staves', 'Wands'],
    primaryStats: ['INT', 'WIL'],
    abilities: [
      // Placeholder - will be filled in with actual abilities
      { id: 'placeholder-1', name: 'Fireball', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'spell' },
      { id: 'placeholder-2', name: 'Frost Nova', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'spell' },
      { id: 'placeholder-3', name: 'Arcane Blast', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'spell' },
    ],
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    description: 'Independent wilderness adventurers with agile combat.',
    weapons: ['Bows', 'Daggers'],
    primaryStats: ['AGI', 'STR', 'CRG'],
    abilities: [
      // Placeholder - will be filled in with actual abilities
      { id: 'placeholder-1', name: 'Multi-Shot', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'action' },
      { id: 'placeholder-2', name: 'Evasion', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'action' },
      { id: 'placeholder-3', name: 'Backstab', description: 'Placeholder ability - data coming soon', maxLevel: 5, type: 'action' },
    ],
  },
};

// Base stats that all classes share
export const BASE_STATS = [
  { id: 'strength', name: 'Strength', abbrev: 'STR', color: 'text-red-400' },
  { id: 'agility', name: 'Agility', abbrev: 'AGI', color: 'text-green-400' },
  { id: 'intelligence', name: 'Intelligence', abbrev: 'INT', color: 'text-blue-400' },
  { id: 'willpower', name: 'Willpower', abbrev: 'WIL', color: 'text-purple-400' },
  { id: 'courage', name: 'Courage', abbrev: 'CRG', color: 'text-yellow-400' },
] as const;

// Secondary/derived stats
export const SECONDARY_STATS = [
  { id: 'health', name: 'Health', color: 'text-red-300' },
  { id: 'mana', name: 'Mana', color: 'text-blue-300' },
  { id: 'stamina', name: 'Stamina', color: 'text-green-300' },
] as const;

// Helper to get class data
export function getClassData(className: ClassName): ClassData {
  return CLASS_DATA[className];
}

// Get all classes as array
export function getAllClasses(): ClassData[] {
  return Object.values(CLASS_DATA);
}
