/**
 * Wiki Data Structure
 *
 * Content is organized by category > articles > sections
 * Set `status: 'draft'` for under construction pages
 * Set `status: 'published'` for complete pages
 */

export type ArticleStatus = 'published' | 'draft' | 'stub';

export interface WikiSection {
  title: string;
  content: string; // Supports markdown-like formatting
}

export interface WikiArticle {
  slug: string;
  title: string;
  summary: string;
  status: ArticleStatus;
  lastUpdated?: string;
  sections?: WikiSection[];
  tips?: string[];
  relatedArticles?: string[]; // slugs in format "category/article"
}

export interface WikiCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  articles: WikiArticle[];
}

export const wikiData: WikiCategory[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'New to Dreadmyst? Everything you need to know to begin your adventure.',
    icon: '🎮',
    articles: [
      {
        slug: 'new-player-guide',
        title: 'New Player Guide',
        summary: 'Complete beginner\'s guide covering your first steps in Dreadmyst Online.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Welcome to Dreadmyst',
            content: `Dreadmyst Online is a challenging action RPG with deep character customization. The game features:

• **Max Level:** 25 (reached in 4-5 hours of focused play, or ~2 days casual)
• **Total XP Available:** 500,000
• **Server Location:** Canada
• **Channel Capacity:** 125 players per channel

The game is still new, so the meta is being discovered by the community. Don't be afraid to experiment!`
          },
          {
            title: 'First Steps',
            content: `When you first log in:

1. **Create your character** - Choose wisely, respecs cost 500k gold!
2. **Follow the starting quests** - They guide you to appropriate leveling areas
3. **Talk to every NPC** - Some have hidden quests or useful info
4. **Don't rush to spend XP** - Research builds first, XP is limited!

The early game is forgiving. Take time to learn the controls and combat system before pushing into harder content.`
          },
          {
            title: 'Understanding XP Investment',
            content: `Unlike most RPGs, XP in Dreadmyst is a currency you invest into stats and skills:

• **Stats** - Increase your core attributes (STR, AGI, INT, WIL, CRG)
• **Skills** - Unlock and upgrade abilities like Lockpicking
• **Costs Escalate** - The more you invest, the more expensive it gets

**Warning:** You cannot earn more than 500,000 XP total. Plan your build carefully or save 500k gold for a respec at level 25.`
          },
        ],
        tips: [
          'Join the Discord to find groups and get build advice',
          'Bank is north of St. Revere - storage is NOT shared between characters',
          'Use the marketplace to trade gear with other players',
          'When quests run out, grind mobs closest to your level',
        ],
        relatedArticles: ['getting-started/leveling', 'mechanics/stats', 'mechanics/respec'],
      },
      {
        slug: 'leveling',
        title: 'Leveling Guide',
        summary: 'Fastest routes to max level and XP optimization strategies.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Leveling Overview',
            content: `**Max Level:** 25
**Total XP:** 500,000
**Speed Run Time:** 4-5 hours
**Casual Time:** ~2 days

XP is earned from killing monsters and completing quests. Higher level mobs give more XP, but killing mobs too far below your level gives reduced XP.`
          },
          {
            title: 'Leveling Strategy',
            content: `The most efficient leveling approach:

1. **Follow Main Quests** (Lvl 1-15) - Quests guide you to appropriate zones
2. **Zone Transitions** - When quests dry up, find mobs closest to your level
3. **Group Up** - Parties can tackle harder content faster
4. **Don't Over-Invest** - Save some XP for skills you'll discover later

**Pro Tip:** Quest rewards often include gear upgrades. Don't skip quests just to grind faster.`
          },
        ],
        tips: [
          'Mobs within 2 levels of you give full XP',
          'Group content is more efficient if you have a party',
          'Check the marketplace for leveling gear upgrades',
        ],
      },
      {
        slug: 'controls',
        title: 'Controls & Interface',
        summary: 'Keyboard shortcuts, UI tips, and control customization.',
        status: 'stub',
      },
      {
        slug: 'servers',
        title: 'Servers & Channels',
        summary: 'How the channel system works and switching between them.',
        status: 'published',
        sections: [
          {
            title: 'Channel System',
            content: `Dreadmyst uses a channel-based system:

• **Server Location:** Canada
• **Max Players per Channel:** 125
• **Channel Switch Cooldown:** 5 minutes

You can switch channels to find less crowded grinding spots or meet up with friends.`
          },
        ],
      },
    ],
  },
  {
    slug: 'mechanics',
    title: 'Game Mechanics',
    description: 'Deep dive into how game systems work - stats, skills, combat, and more.',
    icon: '⚙️',
    articles: [
      {
        slug: 'stats',
        title: 'Stats & Attributes',
        summary: 'Understanding STR, AGI, INT, WIL, CRG and how they affect your character.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Primary Stats',
            content: `Your character has 5 primary stats:

**Strength (STR)** - Physical damage, carry weight
**Agility (AGI)** - Attack speed, dodge chance, movement
**Intelligence (INT)** - Magic damage, mana pool
**Willpower (WIL)** - Resistances, mana regeneration
**Courage (CRG)** - Critical chance, fear resistance

Each stat affects multiple aspects of gameplay. Build guides often focus on 2-3 primary stats.`
          },
          {
            title: 'Secondary Stats',
            content: `Derived from your primary stats and gear:

• **Weapon Value** - Physical damage output
• **Armor Value** - Physical damage reduction
• **Health** - Your HP pool
• **Mana** - Resource for skills
• **Stamina** - Used for dodging and sprinting`
          },
          {
            title: 'XP Investment Costs',
            content: `Stats are purchased with XP. Costs escalate:

**Example (Mana):**
• First 1,000 points: 1 XP per point
• After 1,000: 100 XP per point

This means early investment is cheap, but maxing a stat is very expensive. Plan accordingly!`
          },
        ],
      },
      {
        slug: 'skills',
        title: 'Skills System',
        summary: 'How skills work, investment costs, and skill list.',
        status: 'draft',
      },
      {
        slug: 'combat',
        title: 'Combat Mechanics',
        summary: 'Damage calculation, resistances, and combat tips.',
        status: 'draft',
      },
      {
        slug: 'respec',
        title: 'Respec System',
        summary: 'How to reset your character and what it costs.',
        status: 'published',
        sections: [
          {
            title: 'Respec Requirements',
            content: `To respec your character:

• **Cost:** 500,000 gold
• **Requirement:** Must be level 25
• **Effect:** Resets all stat and skill investments

You keep your level, items, and quest progress. Only your XP allocation is reset.`
          },
          {
            title: 'Planning for Respec',
            content: `Since respec is expensive, consider:

1. **Research builds before investing** - Ask in Discord or check build guides
2. **Save gold while leveling** - You'll want that 500k safety net
3. **Don't panic-respec** - Make sure you understand what went wrong first

Many players keep a respec fund saved even after finding their build, in case the meta shifts.`
          },
        ],
        tips: [
          'The 500k gold cost is intentional - plan your build!',
          'Some players level a test character first',
          'Join build discussions on Discord before committing',
        ],
      },
    ],
  },
  {
    slug: 'classes',
    title: 'Classes',
    description: 'Class guides, builds, and playstyle information.',
    icon: '🛡️',
    articles: [
      {
        slug: 'overview',
        title: 'Class Overview',
        summary: 'Introduction to all four playable classes in Dreadmyst.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'The Four Classes',
            content: `Dreadmyst Online features four distinct playable classes:

**Paladin** - Divine warriors focused on defense
**Mage** - Arcane spellcasters with innate magical abilities
**Ranger** - Independent wilderness adventurers
**Cleric** - Divine spellcasters and healers

Each class has unique weapon proficiencies and playstyles. The meta is still being discovered, so experiment!`
          },
          {
            title: 'Choosing Your Class',
            content: `Consider your preferred playstyle:

• **Tank/Frontline:** Paladin excels at absorbing damage
• **Magic DPS:** Mage deals high arcane damage from range
• **Physical DPS:** Ranger offers agile, mobile combat
• **Support/Healer:** Cleric keeps the party alive

Remember: Respec costs 500k gold, but you can't change your class!`
          },
        ],
        relatedArticles: ['classes/paladin', 'classes/mage', 'classes/ranger', 'classes/cleric'],
      },
      {
        slug: 'paladin',
        title: 'Paladin',
        summary: 'Divine warriors focused on defense - the tank class of Dreadmyst.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Paladin Overview',
            content: `The Paladin is a divine warrior focused on defense. They excel at protecting allies and surviving dangerous encounters.

**Role:** Tank / Frontline
**Difficulty:** Beginner-friendly

**Weapon Proficiencies:**
• Swords
• Maces
• Axes
• Shields`
          },
          {
            title: 'Recommended Stats',
            content: `Paladins typically prioritize:

• **Strength (STR)** - Increases physical damage and carry weight
• **Willpower (WIL)** - Boosts resistances and mana regen
• **Courage (CRG)** - Improves critical chance and fear resistance

The exact stat distribution depends on whether you want to focus on pure tanking or hybrid damage.`
          },
        ],
        tips: [
          'Shields are essential for tanking group dungeons',
          'Paladins are in high demand for 4-player dungeon groups',
          'Consider WIL investment for better magic resistance',
        ],
      },
      {
        slug: 'mage',
        title: 'Mage',
        summary: 'Arcane spellcasters with powerful magical abilities.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Mage Overview',
            content: `The Mage is an arcane spellcaster with innate magical abilities. They deal high damage from range but are fragile.

**Role:** Ranged DPS
**Difficulty:** Intermediate

**Weapon Proficiencies:**
• Staves
• Wands`
          },
          {
            title: 'Recommended Stats',
            content: `Mages typically prioritize:

• **Intelligence (INT)** - Increases magic damage and mana pool
• **Willpower (WIL)** - Boosts mana regeneration
• **Agility (AGI)** - Helps with positioning and dodge

Balance INT for damage with enough WIL to sustain your mana in longer fights.`
          },
        ],
        tips: [
          'Manage your mana carefully - running dry mid-fight is dangerous',
          'Stay at range to avoid taking damage',
          'Spell crit (Diabolic modifier) is very strong on Mages',
        ],
      },
      {
        slug: 'ranger',
        title: 'Ranger',
        summary: 'Independent wilderness adventurers with agile combat.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Ranger Overview',
            content: `The Ranger is an independent wilderness adventurer. They offer mobile, agile combat with both ranged and melee options.

**Role:** Physical DPS
**Difficulty:** Intermediate

**Weapon Proficiencies:**
• Bows
• Daggers`
          },
          {
            title: 'Recommended Stats',
            content: `Rangers typically prioritize:

• **Agility (AGI)** - Attack speed, dodge chance, movement
• **Strength (STR)** - Physical damage output
• **Courage (CRG)** - Critical hit chance

Rangers are versatile - bow builds focus on AGI/CRG while melee dagger builds add more STR.`
          },
        ],
        tips: [
          'Ranged crit (Merciless modifier) is excellent for bow builds',
          'Daggers allow you to be more aggressive in melee',
          'Rangers excel in solo content due to their mobility',
        ],
      },
      {
        slug: 'cleric',
        title: 'Cleric',
        summary: 'Divine spellcasters and healers - essential for group content.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Cleric Overview',
            content: `The Cleric is a divine spellcaster and healer. They are essential for group content and can also deal decent damage.

**Role:** Healer / Support
**Difficulty:** Advanced

**Weapon Proficiencies:**
• Staves
• Maces
• Shields`
          },
          {
            title: 'Recommended Stats',
            content: `Clerics typically prioritize:

• **Intelligence (INT)** - Healing power and mana pool
• **Willpower (WIL)** - Mana regeneration and resistances
• **Strength (STR)** - If you want to contribute damage

Clerics need to balance healing output with mana sustain for long dungeon runs.`
          },
        ],
        tips: [
          'Every 4-player dungeon group needs a Cleric',
          'Shields provide extra survivability when things go wrong',
          'WIL is especially important for maintaining healing through long fights',
        ],
      },
    ],
  },
  {
    slug: 'skills',
    title: 'Skills & Abilities',
    description: 'Complete skill reference with costs, effects, and tips.',
    icon: '✨',
    articles: [
      {
        slug: 'lockpicking',
        title: 'Lockpicking',
        summary: 'How lockpicking works and where to use it.',
        status: 'published',
        sections: [
          {
            title: 'Lockpicking Skill',
            content: `Lockpicking is an activatable skill that lets you open locked containers and doors.

**Investment:** Upgrade through XP spending
**Uses:** Opening locked chests, doors, and secret areas

Higher lockpicking skill lets you open more difficult locks, often containing better loot.`
          },
        ],
      },
      {
        slug: 'skill-list',
        title: 'Complete Skill List',
        summary: 'All skills in the game with costs and effects.',
        status: 'draft',
      },
    ],
  },
  {
    slug: 'items',
    title: 'Items & Equipment',
    description: 'Gear guides, trading info, and item tier explanations.',
    icon: '⚔️',
    articles: [
      {
        slug: 'equipment-tiers',
        title: 'Equipment Tiers',
        summary: 'Understanding Godly, Holy, Blessed, and Normal items.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'Item Tiers',
            content: `Equipment comes in 4 tiers (best to worst):

**Godly (Purple)** - Highest stats, very rare
**Holy (Pink)** - Excellent stats, rare
**Blessed (Blue)** - Good stats, uncommon
**Normal (Gray)** - Base stats, common

Higher tiers have better base stats and more bonus effects.`
          },
          {
            title: 'Item Naming',
            content: `Items follow a naming pattern:

**[Tier] [Base Type] of the [Modifier] [Animal]**

Example: "Godly Breastplate of the Mauling Lion"

• **Tier** - Godly, Holy, Blessed (or none for Normal)
• **Base Type** - Sword, Helm, Ring, etc.
• **Modifier** - Bonus effect (Rejuvenating, Diabolic, etc.)
• **Animal** - Determines stat distribution (Lion = STR/CRG)`
          },
          {
            title: 'Sockets',
            content: `Equipment can have 0-3 sockets for gems:

• More sockets = more customization
• Socketed gear is more valuable for trading
• High-tier items with max sockets are extremely rare`
          },
        ],
      },
      {
        slug: 'trading',
        title: 'Trading Guide',
        summary: 'How to trade with other players and price items.',
        status: 'published',
        sections: [
          {
            title: 'Trading Basics',
            content: `Dreadmyst has player-to-player trading:

• **No Auction House** - All trades are direct
• **Currency:** Gold
• **Method:** Trade window with other players
• **Alternative:** Use the community marketplace (this site!)

Always verify items before confirming trades!`
          },
        ],
        tips: [
          'Use the marketplace on this site to list items',
          'Check recent sales to price your items fairly',
          'High-tier items with good stats are worth significantly more',
        ],
      },
      {
        slug: 'banking',
        title: 'Banking System',
        summary: 'Where to bank and storage limitations.',
        status: 'published',
        sections: [
          {
            title: 'Bank Location',
            content: `The bank is located **north of St. Revere**.

**Important:** Bank storage is NOT shared between characters! Each character has their own separate bank.

Plan your alt characters accordingly if you want to transfer items.`
          },
        ],
      },
    ],
  },
  {
    slug: 'quests',
    title: 'Quests',
    description: 'Main story, side quests, and quest walkthroughs.',
    icon: '📜',
    articles: [
      {
        slug: 'main-story',
        title: 'Main Story Quests',
        summary: 'Complete walkthrough of the main questline.',
        status: 'draft',
      },
      {
        slug: 'side-quests',
        title: 'Side Quests',
        summary: 'Optional quests and their rewards.',
        status: 'draft',
      },
      {
        slug: 'endgame',
        title: 'End-Game Content',
        summary: 'What to do at max level - dungeons, arena, and PvP.',
        status: 'published',
        lastUpdated: '2026-01-12',
        sections: [
          {
            title: 'End-Game Activities',
            content: `At level 25, several end-game activities unlock:

**Group Dungeons** - 4-player content requiring tank, healer, and 2 DPS
**Solo Dungeons** - Elite packs and mini-bosses, higher difficulty = better rewards
**Arena PvP** - 1v1 and 2v2 competitive brackets
**Loot Runs** - PvP zones with high-risk, high-reward gameplay

End-game is where build optimization really matters!`
          },
          {
            title: 'Group Dungeon Composition',
            content: `The standard 4-player dungeon composition:

• **1 Tank** - Paladin with shield preferred
• **1 Healer** - Cleric required
• **2 DPS** - Mage, Ranger, or damage-focused Paladin

Communication is key! Coordinate crowd control and ability timing for success.`
          },
          {
            title: 'Arena PvP',
            content: `Competitive PvP in Dreadmyst:

**1v1 Bracket** - Test your build against other players
**2v2 Bracket** - Coordinate with a partner for team fights

Success in arena depends on:
• Ability timing and cooldown management
• Crowd control coordination
• Build optimization for PvP scenarios`
          },
        ],
        tips: [
          'Find a regular dungeon group for consistent runs',
          'Higher dungeon difficulties drop better gear',
          'Arena rewards include exclusive cosmetics',
        ],
      },
    ],
  },
  {
    slug: 'world',
    title: 'World & Locations',
    description: 'Maps, locations, NPCs, and points of interest.',
    icon: '🗺️',
    articles: [
      {
        slug: 'st-revere',
        title: 'St. Revere',
        summary: 'The main hub city and its important locations.',
        status: 'published',
        sections: [
          {
            title: 'St. Revere Overview',
            content: `St. Revere is the main hub city in Dreadmyst Online.

**Key Locations:**
• **Bank** - North of the city center
• **Merchants** - Various vendors throughout
• **Quest Givers** - Check all NPCs for quests!

This is where most trading and social activity happens.`
          },
        ],
      },
      {
        slug: 'zones',
        title: 'Zone Guide',
        summary: 'All zones with level ranges and notable features.',
        status: 'draft',
      },
      {
        slug: 'dungeons',
        title: 'Dungeons',
        summary: 'Dungeon locations, requirements, and strategies.',
        status: 'draft',
      },
      {
        slug: 'pvp-zones',
        title: 'PvP Zones',
        summary: 'Dangerous PvP areas and loot run strategies.',
        status: 'stub',
      },
    ],
  },
  {
    slug: 'crafting',
    title: 'Crafting',
    description: 'Crafting systems and professions (when available).',
    icon: '🔨',
    articles: [
      {
        slug: 'overview',
        title: 'Crafting Overview',
        summary: 'Current state of crafting in Dreadmyst.',
        status: 'published',
        sections: [
          {
            title: 'Crafting Status',
            content: `**No professions are currently available in Dreadmyst Online.**

The developers may add crafting systems in future updates. Check back for news!

For now, all gear is obtained through:
• Monster drops
• Quest rewards
• Player trading`
          },
        ],
      },
    ],
  },
];

// Helper functions
export function getCategory(slug: string): WikiCategory | undefined {
  return wikiData.find(cat => cat.slug === slug);
}

export function getArticle(categorySlug: string, articleSlug: string): WikiArticle | undefined {
  const category = getCategory(categorySlug);
  return category?.articles.find(art => art.slug === articleSlug);
}

export function getAllArticles(): { category: WikiCategory; article: WikiArticle }[] {
  const all: { category: WikiCategory; article: WikiArticle }[] = [];
  wikiData.forEach(category => {
    category.articles.forEach(article => {
      all.push({ category, article });
    });
  });
  return all;
}

export function getPublishedArticles(): { category: WikiCategory; article: WikiArticle }[] {
  return getAllArticles().filter(({ article }) => article.status === 'published');
}

// Quick facts for the main page
export const quickFacts = [
  { label: 'Max Level', value: '25' },
  { label: 'Total XP', value: '500K' },
  { label: 'Time to Cap', value: '4-5 hrs' },
  { label: 'Respec Cost', value: '500K gold' },
  { label: 'Channel Cap', value: '125' },
  { label: 'Server', value: 'Canada' },
];
