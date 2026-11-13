/**
 * Frontend Persona Security Configuration & Guard Helpers
 * Centralized definition of root sovereignty, demo accounts, and permissions.
 */

export const SOVEREIGN_ROOT_USERNAMES = Object.freeze([
  'martand_prakhar',
]);

export const PROTECTED_DEMO_ACCOUNTS = Object.freeze([
  'demo_owner',
  'admin@gs01',
  'rockstargames',
  'player@01',
]);

export const isRootSovereign = (username?: string | null): boolean => {
  if (!username) return false;
  return SOVEREIGN_ROOT_USERNAMES.includes(username.trim().toLowerCase());
};

export const isDemoSession = (username?: string | null): boolean => {
  if (!username) return false;
  return username.trim().toLowerCase() === 'demo_owner';
};

export const isProtectedDemoAccount = (username?: string | null): boolean => {
  if (!username) return false;
  return PROTECTED_DEMO_ACCOUNTS.includes(username.trim().toLowerCase());
};

