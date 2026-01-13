/**
 * Format gold amount for display
 * Examples: 10000 -> "10K Gold", 1500000 -> "1.5M Gold", 500 -> "500 Gold"
 */
export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = millions === Math.floor(millions)
      ? Math.floor(millions).toString()
      : millions.toFixed(1);
    return `${formatted}M Gold`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const formatted = thousands === Math.floor(thousands)
      ? Math.floor(thousands).toString()
      : thousands.toFixed(1);
    return `${formatted}K Gold`;
  }
  return `${amount.toLocaleString()} Gold`;
}

/**
 * Format gold amount short (without "Gold" suffix)
 * Examples: 10000 -> "10K", 1500000 -> "1.5M", 500 -> "500"
 */
export function formatGoldShort(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return millions === Math.floor(millions)
      ? `${Math.floor(millions)}M`
      : `${millions.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return thousands === Math.floor(thousands)
      ? `${Math.floor(thousands)}K`
      : `${thousands.toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

/**
 * Format relative time ago
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;
  return date.toLocaleDateString();
}

/**
 * Generate whisper command for contacting seller
 * Format: /w CharacterName WTB 'Item Name' for 50K
 */
export function generateWhisperCommand(characterName: string, itemName: string, price?: number): string {
  let command = `/w ${characterName} WTB '${itemName}'`;
  if (price) {
    command += ` for ${formatGoldShort(price)}`;
  }
  return command;
}
