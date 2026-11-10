import crypto from "node:crypto";
import bcrypt from "bcrypt";

const RECOVERY_WORDLIST = [
  "alpha", "apex", "aurora", "beacon", "blade", "breeze", "canvas", "cascade", 
  "cipher", "comet", "crystal", "delta", "echo", "ember", "falcon", "flame", 
  "forest", "galaxy", "glacier", "gravity", "horizon", "infinity", "iron", 
  "jupiter", "laser", "legacy", "lunar", "matrix", "meteor", "monolith", 
  "nebula", "nexus", "nova", "oasis", "ocean", "omega", "orbit", "origin", 
  "phoenix", "pioneer", "plasma", "polaris", "prism", "pulse", "quantum", 
  "quasar", "radiant", "realm", "resonance", "rift", "saffron", "satellite", 
  "shadow", "shield", "signal", "silver", "solar", "spark", "spectrum", 
  "sphere", "spiral", "summit", "titan", "trident", "valkyrie", "vector", 
  "velocity", "vertex", "vessel", "vortex", "zenith", "aerospace", "astron",
  "chronos", "cosmic", "dynamo", "eclipse", "element", "enigma", "flux"
];

/**
 * Generates a 12-word cryptographic seed phrase for emergency root recovery
 */
export const generateRecoveryPhrase = (): string => {
  const words: string[] = [];
  const listLen = RECOVERY_WORDLIST.length;

  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, listLen);
    words.push(RECOVERY_WORDLIST[randomIndex]!);
  }

  return words.join(" ");
};

/**
 * Hashes recovery phrase with bcrypt for secure storage
 */
export const hashRecoveryPhrase = async (phrase: string): Promise<string> => {
  const normalized = phrase.trim().toLowerCase();
  return await bcrypt.hash(normalized, 10);
};

/**
 * Validates a recovery phrase against its stored hash
 */
export const verifyRecoveryPhrase = async (phrase: string, hash: string): Promise<boolean> => {
  const normalized = phrase.trim().toLowerCase();
  return await bcrypt.compare(normalized, hash);
};
