/**
 * Shared password policy — used by UI and API routes alike.
 *
 * Rules:
 *   • 8–15 characters
 *   • No spaces
 *   • At least 1 uppercase letter (A–Z)
 *   • At least 1 number (0–9)
 *   • At least 1 symbol (!@#$%^&*…)
 */

export interface PwRule {
  id: string;
  label: string;
  test: (p: string) => boolean;
}

export const PW_RULES: PwRule[] = [
  {
    id: 'length',
    label: '8–15 characters',
    test: (p) => p.length >= 8 && p.length <= 15,
  },
  {
    id: 'uppercase',
    label: 'At least 1 uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'number',
    label: 'At least 1 number',
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: 'symbol',
    label: 'At least 1 symbol (!@#$%…)',
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
  {
    id: 'nospace',
    label: 'No spaces',
    test: (p) => p.length > 0 && !/\s/.test(p),
  },
];

/** Returns true only when every rule passes. */
export function isPasswordValid(p: string): boolean {
  return PW_RULES.every((r) => r.test(p));
}

/** Returns a human-readable error string for the first failing rule, or null. */
export function passwordError(p: string): string | null {
  for (const rule of PW_RULES) {
    if (!rule.test(p)) return `Password: ${rule.label.toLowerCase()}.`;
  }
  return null;
}

/** Zod-compatible refine message (used in API route schemas). */
export const PW_ZOD_MESSAGE =
  'Password must be 8–15 characters, no spaces, and include at least one uppercase letter, one number, and one symbol.';

/** Regex for Zod .regex() — same constraints. */
export const PW_REGEX =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])[^\s]{8,15}$/;
