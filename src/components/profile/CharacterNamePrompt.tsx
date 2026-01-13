'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';

interface CharacterNamePromptProps {
  isOpen: boolean;
  userId: string;
  onComplete: (characterName: string) => void;
  onSkip: () => void;
}

export default function CharacterNamePrompt({
  isOpen,
  userId,
  onComplete,
  onSkip,
}: CharacterNamePromptProps) {
  const [characterName, setCharacterName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ in_game_name: characterName.trim() })
      .eq('id', userId);

    if (updateError) {
      console.error('Error saving character name:', updateError);
      setError('Failed to save. Please try again.');
      setSaving(false);
    } else {
      onComplete(characterName.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onSkip} title="Welcome to Dreadmyst Nexus!" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-muted mb-4">
            What&apos;s your in-game character name? This helps other players contact you with whisper commands.
          </p>

          <label className="block text-sm font-medium mb-2">Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="e.g., DarkKnight, Shadowmage"
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <p className="text-xs text-muted mt-2">
            You can change this later in your profile settings.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
