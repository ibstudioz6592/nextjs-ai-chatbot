/**
 * Groq API Key Rotation Utility
 * 
 * This module provides automatic rotation of Groq API keys to avoid rate limits.
 * Add multiple GROQ_API_KEY_* environment variables to enable rotation.
 * 
 * IMPORTANT: This module should only be used on the server-side.
 */

// Only run on server-side
if (typeof window !== 'undefined') {
  throw new Error('groq-key-rotation.ts should only be imported on the server-side');
}

// Collect all available Groq API keys from environment variables
const groqApiKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter((key): key is string => Boolean(key));

if (groqApiKeys.length === 0) {
  throw new Error('No GROQ_API_KEY found in environment variables');
}

// Track current key index and failed keys
let currentKeyIndex = 0;
const failedKeys = new Set<number>();

/**
 * Get the next available Groq API key using round-robin rotation
 * Automatically skips keys that have been marked as rate-limited
 */
export function getGroqApiKey(): string {
  // If all keys have failed, reset and try again
  if (failedKeys.size >= groqApiKeys.length) {
    console.warn('[Groq] All API keys rate-limited, resetting rotation');
    failedKeys.clear();
  }

  // Find next available key
  let attempts = 0;
  while (attempts < groqApiKeys.length) {
    if (!failedKeys.has(currentKeyIndex)) {
      const key = groqApiKeys[currentKeyIndex];
      currentKeyIndex = (currentKeyIndex + 1) % groqApiKeys.length;
      return key;
    }
    currentKeyIndex = (currentKeyIndex + 1) % groqApiKeys.length;
    attempts++;
  }

  // Fallback to first key if all failed
  console.error('[Groq] All keys failed, using first key as fallback');
  return groqApiKeys[0];
}

/**
 * Mark the current key as rate-limited
 * This will cause the rotation to skip this key until reset
 */
export function markCurrentKeyAsRateLimited(): void {
  const previousIndex = (currentKeyIndex - 1 + groqApiKeys.length) % groqApiKeys.length;
  failedKeys.add(previousIndex);
  console.warn(`[Groq] Marked key #${previousIndex + 1} as rate-limited`);
}

/**
 * Reset all failed keys (useful after cooldown period)
 */
export function resetFailedKeys(): void {
  failedKeys.clear();
  console.log('[Groq] Reset all failed keys');
}

/**
 * Get rotation statistics
 */
export function getRotationStats() {
  return {
    totalKeys: groqApiKeys.length,
    currentKeyIndex: currentKeyIndex + 1,
    failedKeysCount: failedKeys.size,
    availableKeys: groqApiKeys.length - failedKeys.size,
  };
}

// Log rotation info on startup
console.log(`[Groq] Initialized with ${groqApiKeys.length} API key(s)`);
