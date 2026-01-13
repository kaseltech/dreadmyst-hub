# Dreadmyst Nexus

A community-driven hub for Dreadmyst Online. Discover builds, explore guides, and trade with fellow adventurers.

**Live Site:** [dreadmyst-nexus.com](https://dreadmyst-nexus.com)

## Features

### Wiki
- Game mechanics and guides
- Class information (Paladin, Mage, Ranger, Cleric)
- Items, quests, and locations

### Character Builds
- Submit and browse community builds
- Class-specific ability selectors with levels (0-5)
- Base stats (STR, AGI, INT, WIL, CRG)
- Secondary stats (Health, Mana, Stamina)
- Upvoting system

### Marketplace
- Buy and sell items with other players
- Item tier system (Godly, Holy, Blessed)
- Real-time messaging between buyers and sellers
- Whisper command generator for in-game contact
- Gold formatting with K/M shortcuts

### Discussions
- Community forums for questions and tips
- Author and admin moderation

### User Features
- Discord authentication
- In-app messaging with chat widget
- Admin panel for moderation

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with Discord OAuth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migrations

SQL migrations are in `/supabase/migrations/`. Run them in order on your Supabase project.

## Version History

See the in-app changelog ("What's New" in footer) for detailed release notes.

### v0.5.0 - Rebrand & Build System
- Rebranded to Dreadmyst Nexus
- Character build system with class abilities
- Admin panel and moderation
- UI polish and refinements

### v0.4.0 - Marketplace UX
- Edit listings, stats display, dynamic stat picker
- Equipment vs Materials toggle
- IGN display in chat

### v0.3.0 - Chat & Items
- Floating chat widget
- Item tier system
- Gold formatting
- Keyboard shortcuts

### v0.2.0 - Marketplace & Messaging
- Full marketplace
- In-app messaging
- Discord auth

### v0.1.0 - Initial Launch
- Wiki, builds, discussions
- Dark fantasy theme

## Contributing

This is a fan-made community resource. Contributions welcome!

## License

MIT
