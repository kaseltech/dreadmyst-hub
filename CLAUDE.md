# Dreadmyst Hub - Project Context

## Overview
Community website for **Dreadmyst Online**, a fantasy MMO game. Features a marketplace for trading items, wiki, build guides, and discussion forums.

**Live Site:** Deployed on Vercel (auto-deploys from main branch)
**Repo:** https://github.com/kaseltech/dreadmyst-hub

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Auth:** Discord OAuth via Supabase
- **Styling:** Tailwind CSS with dark fantasy theme
- **Language:** TypeScript

## Color Theme
- Background: `#0a0a0f` (near black)
- Card BG: `#12121a`
- Card Border: `#1e1e2e`
- Accent: `#7c3aed` (purple)
- Accent Light: `#8b5cf6`
- Muted text: `#6b7280`

## Database Schema

### Core Tables
- `profiles` - User profiles (id, username, avatar_url, in_game_name, created_at)
- `listings` - Marketplace items (see item system below)
- `conversations` - Chat threads between buyer/seller
- `messages` - Individual messages in conversations

### Item System (Added Jan 12, 2026)
Listings table has these columns for the item system:
- `tier` - godly/holy/blessed/none (Godly = best, gold color)
- `base_type_id` - sword, breastplate, helm, etc.
- `suffix_modifier_id` - rejuvenating, mauling, diabolic, etc.
- `suffix_animal_id` - lion, elephant, bear, etc. (determines stats)
- `socket_count` - 0-3 empty gem slots
- `level_requirement` - 1-25
- `stats` - JSONB with strength, agility, intelligence, willpower, courage
- `equip_effects` - text array of bonus effects

Reference tables: `item_base_types`, `item_suffix_animals`, `item_suffix_modifiers`

### Item Naming Format
`{Tier} {BaseType} of the {Modifier} {Animal}`
Example: "Godly Breastplate of the Mauling Lion"

### Tier Colors (as per game screenshots)
- **Godly (T1):** Purple (`text-purple-400`)
- **Holy (T2):** Pink (`text-pink-400`)
- **Blessed (T3):** Blue (`text-blue-400`)
- **Normal:** Gray (`text-gray-300`)

## Key Features

### Marketplace (`/market`)
- List items for sale with item builder (tier, base type, suffixes, sockets)
- Filter by category and tier
- Gold formatting: 10K, 1.5M instead of 10000
- Press `C` to create new listing (hotkey)
- Tier-colored item names

### Chat System
- **Floating chat widget** (bottom-right purple bubble)
- Real-time messaging via Supabase subscriptions
- Notification toast when receiving messages
- Unread count badge in header and on chat button
- Chat inline without leaving current page

### Contact Seller (3 methods)
1. In-app messaging (chat widget or /messages)
2. Whisper command copy: `/w {character_name} I'd like to buy your "{item}"`
3. Discord DM link: `https://discord.com/users/{discord_id}`

### Changelog Modal
- Sparkle icon next to logo in header
- Shows notification dot if new updates since last visit
- Tracks last seen version in localStorage

## File Structure

```
src/
├── app/
│   ├── market/
│   │   ├── page.tsx          # Marketplace listing
│   │   ├── new/page.tsx      # Create listing (item builder)
│   │   └── [id]/page.tsx     # Listing detail
│   ├── messages/
│   │   ├── page.tsx          # Conversation list
│   │   └── [id]/page.tsx     # Chat view
│   └── layout.tsx            # Root layout with AuthProvider
├── components/
│   ├── AuthProvider.tsx      # Auth context + character name prompt
│   ├── Header.tsx            # Nav + unread badge + changelog button
│   ├── chat/
│   │   └── ChatWidget.tsx    # Floating chat widget
│   ├── changelog/
│   │   └── ChangelogModal.tsx # What's New modal
│   ├── market/
│   │   ├── ItemBuilder.tsx   # Tier/base/suffix dropdowns
│   │   └── SocketSelector.tsx # Visual socket picker
│   ├── profile/
│   │   └── CharacterNamePrompt.tsx # First-login prompt
│   └── ui/
│       ├── Modal.tsx         # Base modal component
│       └── ConfirmModal.tsx  # Delete confirmation modal
├── hooks/
│   └── useHotkeys.ts         # Keyboard shortcut handling
├── lib/
│   ├── supabase.ts           # Supabase client + types
│   └── formatters.ts         # Gold formatting, time ago, whisper cmd
├── types/
│   └── items.ts              # Item system types + constants
└── supabase/
    └── migrations/
        └── 20260112_item_system.sql # Database migration
```

## Important Notes

### Supabase Client Issue
The Supabase client library sometimes hangs on queries. Fixed by using direct REST API fetch in `AuthProvider.tsx` for profile fetching. API keys are hardcoded in the file (not ideal but works around Vercel env caching issues).

### Discord Auth
- Uses Discord OAuth via Supabase
- Discord user ID available in `user.user_metadata.provider_id`
- Used for Discord DM links

### Real-time Subscriptions
- Chat widget subscribes to global message changes
- Header subscribes to update unread count
- Individual conversation pages subscribe to their specific conversation

## Hotkeys
- `C` on /market → navigate to /market/new
- `ESC` → close modals, cancel forms

## Recent Changes (v0.4.0 - Jan 12, 2026)
- **Edit listing modal** - modify price, tier, sockets after posting
- **Stats on marketplace tiles** - see stats at a glance
- **Simplified listing form** - single page, dynamic stat picker with type-ahead
- **Equipment vs Materials toggle** - list stackable items with quantity
- **IGN display in chat** - shows Discord name + in-game name
- **Fixed chat widget sync** - sent messages appear immediately
- **Fixed tier colors** - Godly (Purple), Holy (Pink), Blessed (Blue)

## v0.3.0 Changes
- Floating chat widget with notifications
- Item tier system (Godly/Holy/Blessed)
- Item builder with dropdowns
- Socket selector (0-3)
- Gold formatting with K/M shortcuts
- Whisper command + Discord DM contact options
- Changelog modal
- Keyboard shortcuts
