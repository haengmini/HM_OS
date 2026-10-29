/** Remove the old plaintext preview; conversations now live only in React memory. */
export function clearLegacyChatPreview(): void {
  try {
    localStorage.removeItem('hm-os-chat-preview');
  } catch {
    // Storage may be disabled. Never fall back to persisting conversation content.
  }
}
