/**
 * Format a number with minimal decimal places (no trailing zeros, no rounding)
 * 1.25 -> "1.25", 1.5 -> "1.5", 1.0 -> "1"
 */
function formatDecimal(value: number): string {
  // Truncate to 2 decimal places without rounding
  const truncated = Math.floor(value * 100) / 100;
  // Remove trailing zeros
  if (truncated === Math.floor(truncated)) {
    return Math.floor(truncated).toString();
  }
  // Check if we only need 1 decimal place
  if (truncated * 10 === Math.floor(truncated * 10)) {
    return truncated.toFixed(1);
  }
  return truncated.toFixed(2);
}

/**
 * Format gold amount for display
 * Examples: 10000 -> "10K Gold", 1250000 -> "1.25M Gold", 500 -> "500 Gold"
 */
export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${formatDecimal(amount / 1000000)}M Gold`;
  }
  if (amount >= 1000) {
    return `${formatDecimal(amount / 1000)}K Gold`;
  }
  return `${amount.toLocaleString()} Gold`;
}

/**
 * Format gold amount short (without "Gold" suffix)
 * Examples: 10000 -> "10K", 1250000 -> "1.25M", 500 -> "500"
 */
export function formatGoldShort(amount: number): string {
  if (amount >= 1000000) {
    return `${formatDecimal(amount / 1000000)}M`;
  }
  if (amount >= 1000) {
    return `${formatDecimal(amount / 1000)}K`;
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
 * Note: The game currently treats the whole line after /w as the character name,
 * so we only output the character name. The dev needs to improve in-game chat
 * to support actual messages.
 */
export function generateWhisperCommand(characterName: string): string {
  return `/w ${characterName}`;
}
