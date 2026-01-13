'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { BuildStats, BuildAbilities } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { CLASS_DATA, ClassName, BASE_STATS, GENERAL_STATS, COMBAT_STATS, SKILL_STATS } from '@/lib/class-data';

// Create fresh client for each operation to avoid stale connections
function getSupabase() {
  return createBrowserClient(
    'https://vnafrwxtxadddpbnfdgr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYWZyd3h0eGFkZGRwYm5mZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjAzMjQsImV4cCI6MjA4MzgzNjMyNH0.fAbkswHI8ex_AxQI7zoIZfR82OCChrMjJDQoadDnaTg'
  );
}

const tagOptions = ['PvE', 'PvP', 'DPS', 'Tank', 'Healer', 'Support', 'Solo', 'Group', 'Beginner-Friendly', 'Endgame', 'AoE', 'Speed'];

export default function NewBuildPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signInWithDiscord } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    equipment: '',
    playstyle: '',
    youtubeUrl: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Use string values to allow empty input
  const [baseStats, setBaseStats] = useState<Record<string, string>>({
    strength: '5',
    agility: '5',
    intelligence: '5',
    willpower: '5',
    courage: '5',
  });
  const [generalStats, setGeneralStats] = useState<Record<string, string>>({});
  const [combatStats, setCombatStats] = useState<Record<string, string>>({});
  const [skillStats, setSkillStats] = useState<Record<string, string>>({});
  const [abilities, setAbilities] = useState<BuildAbilities>({});

  const classData = selectedClass ? CLASS_DATA[selectedClass] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedClass) return;

    setSubmitting(true);

    // Generate skills text from abilities for backward compatibility
    const skillsText = classData
      ? classData.abilities
          .filter(a => abilities[a.id] && abilities[a.id] > 0)
          .map(a => `${a.name} (Level ${abilities[a.id]})`)
          .join('\n')
      : '';

    // Convert string stats to numbers
    const baseStatsNum: BuildStats = {
      strength: parseInt(baseStats.strength) || 5,
      agility: parseInt(baseStats.agility) || 5,
      intelligence: parseInt(baseStats.intelligence) || 5,
      willpower: parseInt(baseStats.willpower) || 5,
      courage: parseInt(baseStats.courage) || 5,
    };

    // Combine all secondary stats into one object
    const allSecondaryStats: Record<string, number> = {};
    for (const [key, val] of Object.entries(generalStats)) {
      const num = parseInt(val);
      if (num > 0) allSecondaryStats[key] = num;
    }
    for (const [key, val] of Object.entries(combatStats)) {
      const num = parseInt(val);
      if (num > 0) allSecondaryStats[key] = num;
    }
    for (const [key, val] of Object.entries(skillStats)) {
      const num = parseInt(val);
      if (num > 0) allSecondaryStats[key] = num;
    }

    // Extract YouTube video ID if URL provided
    let youtubeVideoId: string | null = null;
    if (formData.youtubeUrl) {
      const ytMatch = formData.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?]+)/);
      if (ytMatch) youtubeVideoId = ytMatch[1];
    }

    const client = getSupabase();
    const { error } = await client.from('builds').insert({
      title: formData.title,
      class_name: selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1),
      description: formData.description,
      skills: skillsText || null,
      equipment: formData.equipment || null,
      playstyle: formData.playstyle || null,
      author_name: profile.username,
      author_id: user.id,
      tags: selectedTags,
      upvotes: 0,
      base_stats: baseStatsNum,
      secondary_stats: Object.keys(allSecondaryStats).length > 0 ? allSecondaryStats : null,
      abilities: Object.keys(abilities).length > 0 ? abilities : null,
      youtube_video_id: youtubeVideoId,
    });

    if (error) {
      console.error('Error submitting build:', error);
      alert('Error submitting build. Please try again.');
      setSubmitting(false);
    } else {
      router.push('/builds');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClassChange = (className: ClassName | '') => {
    setSelectedClass(className);
    setAbilities({}); // Reset abilities when class changes
  };

  const handleAbilityChange = (abilityId: string, level: number) => {
    setAbilities(prev => ({
      ...prev,
      [abilityId]: level,
    }));
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Submit Your Build</h1>
          <p className="text-muted mb-6">Sign in to submit a build</p>
          <button
            onClick={signInWithDiscord}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-muted mb-6">
          <Link href="/builds" className="hover:text-foreground transition-colors">Builds</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Submit New Build</span>
        </nav>

        <h1 className="text-4xl font-bold mb-2">Submit Your Build</h1>
        <p className="text-muted mb-8">Share your character build with the community</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Build Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Holy Healer - Group Support Build"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Class Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Class *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(CLASS_DATA).map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleClassChange(cls.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedClass === cls.id
                        ? 'border-accent bg-accent/10'
                        : 'border-card-border bg-background hover:border-muted'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {cls.id === 'paladin' && '🛡️'}
                      {cls.id === 'mage' && '🔮'}
                      {cls.id === 'ranger' && '🏹'}
                      {cls.id === 'cleric' && '✨'}
                    </div>
                    <div className="font-semibold">{cls.name}</div>
                    <div className="text-xs text-muted mt-1">{cls.weapons.join(', ')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-accent text-white'
                        : 'bg-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Base Stats */}
          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <h2 className="text-xl font-semibold mb-2">Base Stats</h2>
            <p className="text-sm text-muted mb-4">Enter your base stat values (before equipment bonuses)</p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {BASE_STATS.map((stat) => (
                <div key={stat.id}>
                  <label className={`block text-sm font-medium mb-2 ${stat.color}`}>
                    {stat.abbrev}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={baseStats[stat.id] ?? ''}
                    onChange={(e) => setBaseStats(prev => ({
                      ...prev,
                      [stat.id]: e.target.value,
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground text-center font-mono focus:outline-none focus:border-accent"
                  />
                  <div className="text-xs text-muted text-center mt-1">{stat.name}</div>
                </div>
              ))}
            </div>

            {/* General Stats */}
            <div className="mt-6 pt-6 border-t border-card-border">
              <h3 className="text-sm font-medium text-muted mb-3">General (Optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {GENERAL_STATS.map((stat) => (
                  <div key={stat.id}>
                    <label className={`block text-xs font-medium mb-1 ${stat.color}`}>
                      {stat.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={generalStats[stat.id] ?? ''}
                      onChange={(e) => setGeneralStats(prev => ({
                        ...prev,
                        [stat.id]: e.target.value,
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground text-center font-mono text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="mt-6 pt-6 border-t border-card-border">
              <h3 className="text-sm font-medium text-muted mb-3">Combat (Optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {COMBAT_STATS.map((stat) => (
                  <div key={stat.id}>
                    <label className={`block text-xs font-medium mb-1 ${stat.color}`}>
                      {stat.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={combatStats[stat.id] ?? ''}
                      onChange={(e) => setCombatStats(prev => ({
                        ...prev,
                        [stat.id]: e.target.value,
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Stats */}
            <div className="mt-6 pt-6 border-t border-card-border">
              <h3 className="text-sm font-medium text-muted mb-3">Skills (Optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {SKILL_STATS.map((stat) => (
                  <div key={stat.id}>
                    <label className={`block text-xs font-medium mb-1 ${stat.color}`}>
                      {stat.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={skillStats[stat.id] ?? ''}
                      onChange={(e) => setSkillStats(prev => ({
                        ...prev,
                        [stat.id]: e.target.value,
                      }))}
                      className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Abilities (only show if class selected) */}
          {classData && (
            <div className="p-6 rounded-xl border border-card-border bg-card-bg">
              <h2 className="text-xl font-semibold mb-2">{classData.name} Abilities</h2>
              <p className="text-sm text-muted mb-4">Set the level for each ability (0 = not invested, 1-5 = level)</p>

              <div className="space-y-3">
                {classData.abilities.map((ability) => (
                  <div
                    key={ability.id}
                    className={`p-4 rounded-lg border transition-all ${
                      abilities[ability.id] && abilities[ability.id] > 0
                        ? 'border-accent/50 bg-accent/5'
                        : 'border-card-border bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {ability.icon && (
                        <img
                          src={`/icons/spells/${ability.icon}`}
                          alt={ability.name}
                          className="w-10 h-10 rounded border border-card-border flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            ability.type === 'spell' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {ability.type}
                          </span>
                          <h4 className="font-semibold">{ability.name}</h4>
                        </div>
                        <p className="text-sm text-muted mt-1 line-clamp-2">{ability.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Lvl</span>
                        <select
                          value={abilities[ability.id] || 0}
                          onChange={(e) => handleAbilityChange(ability.id, parseInt(e.target.value))}
                          className="px-3 py-2 rounded-lg border border-card-border bg-background text-foreground font-mono focus:outline-none focus:border-accent"
                        >
                          <option value={0}>0</option>
                          {Array.from({ length: ability.maxLevel }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Description & Notes */}
          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <h2 className="text-xl font-semibold mb-4">Build Details</h2>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Brief overview of the build, its purpose, and strengths..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Equipment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Recommended Equipment</label>
              <textarea
                rows={3}
                placeholder="Recommended weapons, armor, accessories, and stat priorities on gear..."
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Playstyle */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Playstyle & Tips</label>
              <textarea
                rows={3}
                placeholder="How to play this build effectively, ability rotation, positioning tips..."
                value={formData.playstyle}
                onChange={(e) => setFormData({ ...formData, playstyle: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* YouTube Video */}
            <div>
              <label className="block text-sm font-medium mb-2">YouTube Video (Optional)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
              <p className="text-xs text-muted mt-1">Add a YouTube link to showcase your build in action</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted">
              Submitting as <span className="text-foreground">{profile.username}</span>
            </span>
            <div className="flex gap-4">
              <Link
                href="/builds"
                className="px-6 py-3 border border-card-border text-muted hover:text-foreground font-semibold rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedClass}
                className="px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Build'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
