import { ForbiddenError, BadRequestError } from '../Utils/errors.js';

/**
 * Enterprise Persona Security Configuration & Guard Engine
 * Centralizes platform sovereignty, root identity protection, and demo sandbox constraints.
 */

// Root Platform Sovereignty: Unrestricted and cryptographically protected identities
export const SOVEREIGN_ROOT_USERNAMES = Object.freeze([
  'martand_prakhar',
]);

// Protected Demo Personas: Open to public portfolio reviewers, but locked from mutation
export const PROTECTED_DEMO_ACCOUNTS = Object.freeze([
  'demo_owner',
  'admin@gs01',
  'rockstargames',
  'player@01',
]);

/**
 * Checks if a given username corresponds to the Primary Platform Owner.
 */
export const isRootSovereign = (username?: string | null): boolean => {
  if (!username) return false;
  return SOVEREIGN_ROOT_USERNAMES.includes(username.trim().toLowerCase());
};

/**
 * Checks if a user is operating in a public sandbox demo session.
 */
export const isDemoSession = (username?: string | null): boolean => {
  if (!username) return false;
  return username.trim().toLowerCase() === 'demo_owner';
};

/**
 * Checks if an account is a core demo persona that must remain intact for reviewers.
 */
export const isProtectedDemoAccount = (username?: string | null): boolean => {
  if (!username) return false;
  return PROTECTED_DEMO_ACCOUNTS.includes(username.trim().toLowerCase());
};

/**
 * Validates whether an actor has authorization to suspend or restore a target user.
 * Throws standard ForbiddenError or BadRequestError if blocked.
 */
export const assertCanSuspendUser = (actorUsername: string, targetUsername: string): void => {
  const cleanTarget = targetUsername.trim().toLowerCase();
  const cleanActor = actorUsername.trim().toLowerCase();

  // Root sovereign cannot be suspended under any circumstances
  if (isRootSovereign(cleanTarget)) {
    throw new ForbiddenError(
      'SOVEREIGN ROOT SHIELD: The primary platform owner (@Martand_Prakhar) is cryptographically locked and cannot be suspended or deactivated.'
    );
  }

  // Self-suspension safeguard
  if (cleanActor === cleanTarget) {
    throw new BadRequestError('You cannot alter your own standing.');
  }

  // Demo Owner cannot suspend other demo showcase accounts
  if (isDemoSession(cleanActor) && isProtectedDemoAccount(cleanTarget)) {
    throw new ForbiddenError(
      'DEMO SANDBOX PROTECTION: Core demo accounts are locked from suspension to preserve reviewer access.'
    );
  }
};

/**
 * Validates whether an actor has authority to reassign clearance roles.
 * Throws ForbiddenError if unauthorized.
 */
export const assertCanChangeRole = (actorUsername: string, targetUsername: string, newRole: string): void => {
  const cleanTarget = targetUsername.trim().toLowerCase();
  const cleanActor = actorUsername.trim().toLowerCase();

  // Cannot modify role of Root Sovereign
  if (isRootSovereign(cleanTarget)) {
    throw new ForbiddenError(
      'SOVEREIGN ROOT SHIELD: The primary platform owner (@Martand_Prakhar) clearance cannot be modified.'
    );
  }

  // Only real root owner can alter clearance roles (Demo owner is sandbox-restricted)
  if (isDemoSession(cleanActor)) {
    throw new ForbiddenError(
      'RESTRICTED TO ROOT SOVEREIGN OWNER: Clearance role reassignments modify system-wide permissions and can only be authorized by the primary platform owner (@Martand_Prakhar).'
    );
  }
};

