import * as Crypto from 'expo-crypto';

const SALT_BYTES = 16;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function digest(salt: string, pin: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}${pin}`);
}

// Stored as "salt:hash" so each user gets their own salt without a schema change.
export async function hashPin(pin: string): Promise<string> {
  const salt = toHex(Crypto.getRandomBytes(SALT_BYTES));
  return `${salt}:${await digest(salt, pin)}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return false;
  }
  return (await digest(salt, pin)) === hash;
}
