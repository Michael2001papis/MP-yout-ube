/**
 * Admin-related env-driven configuration.
 * SECURITY: VITE_ADMIN_EMAILS is visible in the client bundle — use Firebase Rules
 * for real enforcement. Never put passwords or API secrets here.
 */

export function getConfiguredAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Public UI label for the primary administrator (not a credential). */
export function getPrimaryAdminDisplayName(): string {
  const v = import.meta.env.VITE_ADMIN_DISPLAY_NAME
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return 'MIKI'
}

/** First email in VITE_ADMIN_EMAILS is the designated primary admin slot (UI copy). */
export function isPrimaryAdminAccount(email: string | null | undefined): boolean {
  if (!email) return false
  const list = getConfiguredAdminEmails()
  if (list.length === 0) return false
  return list[0] === email.toLowerCase()
}
