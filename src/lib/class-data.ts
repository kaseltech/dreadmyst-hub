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
  icon?: string; // Path to icon in /icons/spells/
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
      { id: 'discipline', name: 'Discipline', description: 'Reduces all damage taken by a friendly target by 50% for 8 sec. Target is immune to Dispel.', maxLevel: 5, type: 'spell', icon: 'Pain Suppression.png' },
      { id: 'blessed-shield', name: 'Blessed Shield', description: 'Absorbs damage for 25 sec.', maxLevel: 5, type: 'spell', icon: 'Blessed Shield.png' },
      { id: 'satanic-madness', name: 'Satanic Madness', description: 'Horrify up to five nearby enemies with visions of Hell, causing them to flee in terror for 8 sec.', maxLevel: 5, type: 'spell', icon: 'Psychic Scream.png' },
      { id: 'reincarnation', name: 'Reincarnation', description: 'Grants a blessing to a friendly target that lasts for 5 minutes. If the target dies while the blessing is in effect, they are resurrected.', maxLevel: 5, type: 'spell', icon: 'Reincarnation.png' },
      { id: 'rejuvenation', name: 'Rejuvenation', description: 'Heals a friendly target over 15 sec.', maxLevel: 5, type: 'spell', icon: 'Renew.png' },
      { id: 'resurrection', name: 'Resurrection', description: 'Brings a dead player back to life with 50% health and mana. Cannot be cast when in combat.', maxLevel: 5, type: 'spell', icon: 'Resurrection.png' },
      { id: 'plague', name: 'Plague', description: 'An instrument of darkness that causes Shadow damage every 2 sec for 12 sec.', maxLevel: 5, type: 'spell', icon: 'Plague.png' },
      { id: 'smite', name: 'Smite', description: 'Consumes an enemy target in Holy flames, dealing weapon damage as Holy damage.', maxLevel: 5, type: 'spell', icon: 'Smite.png' },
      { id: 'harrowing-strike', name: 'Harrowing Strike', description: 'Deals 200% weapon damage as Shadow damage and reducing their damage by 5% for 10 sec.', maxLevel: 5, type: 'spell', icon: 'Shadowbolt.png' },
      { id: 'heal', name: 'Heal', description: 'Heals a friendly target.', maxLevel: 5, type: 'spell', icon: 'Heal.png' },
      { id: 'holy-bolt', name: 'Holy Bolt', description: 'Deals Holy damage to an enemy and incapacitating them for 1 sec. Breaks on damage.', maxLevel: 5, type: 'spell', icon: 'Holy Bolt.png' },
      { id: 'inner-strength', name: 'Inner Strength', description: 'Increases a friendly target\'s damage by 20% for 15 sec.', maxLevel: 5, type: 'spell', icon: 'Inner Fire.png' },
      { id: 'lesser-heal', name: 'Lesser Heal', description: 'Heals a friendly target for a small amount.', maxLevel: 5, type: 'spell', icon: 'Lesser Heal.png' },
      { id: 'penance', name: 'Penance', description: 'Punish an enemy target for their sins, burning 250 points of their Mana in the process.', maxLevel: 5, type: 'spell', icon: 'Mana Burn.png' },
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
      { id: 'magical-amplification', name: 'Magical Amplification', description: 'Amplifies magical power.', maxLevel: 5, type: 'spell', icon: 'Amplify Magic.png' },
      { id: 'vim-of-wisdom', name: 'Vim of Wisdom', description: 'Increases wisdom and magical abilities.', maxLevel: 5, type: 'spell', icon: 'Fortify Intellect.png' },
      { id: 'boon-of-clairvoyance', name: 'Boon of Clairvoyance', description: 'Grants enhanced magical perception.', maxLevel: 5, type: 'spell', icon: 'Boon of Clairvoyance.png' },
      { id: 'boon-of-protection', name: 'Boon of Protection', description: 'Provides magical protection.', maxLevel: 5, type: 'spell', icon: 'Boon of Iron-Clad.png' },
      { id: 'antimagic', name: 'Antimagic', description: 'Counters enemy magic.', maxLevel: 5, type: 'spell', icon: 'Counter Spell.png' },
      { id: 'magical-dampening', name: 'Magical Dampening', description: 'Dampens magical effects.', maxLevel: 5, type: 'spell', icon: 'Dampen Magic.png' },
      { id: 'ignite', name: 'Ignite', description: 'Sets the target ablaze.', maxLevel: 5, type: 'spell', icon: 'Fire Blast.png' },
      { id: 'warmth', name: 'Warmth', description: 'Provides warmth and fire resistance.', maxLevel: 5, type: 'spell', icon: 'Fire Ward.png' },
      { id: 'fireball', name: 'Fireball', description: 'Hurls a ball of fire at the target.', maxLevel: 5, type: 'spell', icon: 'Fireball.png' },
      { id: 'ice-blast', name: 'Ice Blast', description: 'Blasts the target with ice.', maxLevel: 5, type: 'spell', icon: 'Frostbolt.png' },
      { id: 'chains-of-ice', name: 'Chains of Ice', description: 'Binds the target in frozen chains.', maxLevel: 5, type: 'spell', icon: 'Frost Nova.png' },
      { id: 'ice-shard', name: 'Ice Shard', description: 'Launches a shard of ice at the target.', maxLevel: 5, type: 'spell', icon: 'Icebolt.png' },
      { id: 'deep-freeze', name: 'Deep Freeze', description: 'Freezes the target solid.', maxLevel: 5, type: 'spell', icon: 'Frozen Armor.png' },
      { id: 'illusion-gate', name: 'Illusion Gate', description: 'Creates a magical portal.', maxLevel: 5, type: 'spell', icon: 'Illusion Gate.png' },
      { id: 'inferno', name: 'Inferno', description: 'Unleashes a devastating inferno.', maxLevel: 5, type: 'spell', icon: 'Inferno.png' },
      { id: 'wisdom-of-lazarus', name: 'Wisdom of Lazarus', description: 'Grants ancient wisdom.', maxLevel: 5, type: 'spell', icon: "Lumiel's Wisdom.png" },
      { id: 'bind-spirit', name: 'Bind Spirit', description: 'Binds a spirit to your will.', maxLevel: 5, type: 'spell', icon: 'Polymorph.png' },
      { id: 'remove-curse', name: 'Remove Curse', description: 'Removes curses from a target.', maxLevel: 5, type: 'spell', icon: 'Remove Curse.png' },
      { id: 'scorch', name: 'Scorch', description: 'Scorches the target with fire.', maxLevel: 5, type: 'spell', icon: 'Scorch.png' },
      { id: 'teleport', name: 'Teleport', description: 'Teleports to a location.', maxLevel: 5, type: 'spell', icon: 'Teleport.png' },
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

// Base stats that all classes share (order matches in-game character screen)
export const BASE_STATS = [
  { id: 'strength', name: 'Strength', abbrev: 'STR', color: 'text-red-400' },
  { id: 'agility', name: 'Agility', abbrev: 'AGI', color: 'text-green-400' },
  { id: 'willpower', name: 'Willpower', abbrev: 'WIL', color: 'text-purple-400' },
  { id: 'intelligence', name: 'Intelligence', abbrev: 'INT', color: 'text-blue-400' },
  { id: 'courage', name: 'Courage', abbrev: 'CRG', color: 'text-yellow-400' },
] as const;

// General stats (the old secondary - HP, MP, regen)
export const GENERAL_STATS = [
  { id: 'health', name: 'Health', abbrev: 'HP', color: 'text-red-300' },
  { id: 'mana', name: 'Mana', abbrev: 'MP', color: 'text-blue-300' },
  { id: 'regeneration', name: 'Regeneration', abbrev: 'REG', color: 'text-pink-400' },
  { id: 'meditate', name: 'Meditate', abbrev: 'MED', color: 'text-indigo-400' },
] as const;

// Combat stats - crits, defense, and resistances
export const COMBAT_STATS = [
  { id: 'meleeCritical', name: 'Melee Critical', abbrev: 'MCR', color: 'text-orange-300' },
  { id: 'rangedCritical', name: 'Ranged Critical', abbrev: 'RCR', color: 'text-lime-300' },
  { id: 'spellCritical', name: 'Spell Critical', abbrev: 'SCR', color: 'text-violet-400' },
  { id: 'dodgeRating', name: 'Dodge Rating', abbrev: 'DOD', color: 'text-emerald-400' },
  { id: 'blockRating', name: 'Block Rating', abbrev: 'BLK', color: 'text-amber-400' },
  { id: 'resistFrost', name: 'Frost Resist', abbrev: 'FRS', color: 'text-cyan-400' },
  { id: 'resistFire', name: 'Fire Resist', abbrev: 'FIR', color: 'text-rose-400' },
  { id: 'resistShadow', name: 'Shadow Resist', abbrev: 'SHD', color: 'text-gray-400' },
  { id: 'resistHoly', name: 'Holy Resist', abbrev: 'HLY', color: 'text-amber-200' },
] as const;

// Skill stats - weapon skills and utility
export const SKILL_STATS = [
  { id: 'skillStaves', name: 'Staves', abbrev: 'STV', color: 'text-indigo-300' },
  { id: 'skillMaces', name: 'Maces', abbrev: 'MCE', color: 'text-amber-300' },
  { id: 'skillAxes', name: 'Axes', abbrev: 'AXE', color: 'text-red-300' },
  { id: 'skillSwords', name: 'Swords', abbrev: 'SWD', color: 'text-sky-300' },
  { id: 'skillRanged', name: 'Ranged', abbrev: 'BOW', color: 'text-lime-300' },
  { id: 'skillDaggers', name: 'Daggers', abbrev: 'DAG', color: 'text-rose-300' },
  { id: 'skillWands', name: 'Wands', abbrev: 'WND', color: 'text-purple-300' },
  { id: 'skillShields', name: 'Shields', abbrev: 'SHD', color: 'text-slate-400' },
  { id: 'bartering', name: 'Bartering', abbrev: 'BAR', color: 'text-yellow-300' },
  { id: 'lockpicking', name: 'Lockpicking', abbrev: 'LCK', color: 'text-teal-300' },
] as const;

// Legacy alias for backward compatibility
export const SECONDARY_STATS = GENERAL_STATS;

// Helper to get class data
export function getClassData(className: ClassName): ClassData {
  return CLASS_DATA[className];
}

// Get all classes as array
export function getAllClasses(): ClassData[] {
  return Object.values(CLASS_DATA);
}
