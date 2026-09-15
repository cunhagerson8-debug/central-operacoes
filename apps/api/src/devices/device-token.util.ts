import { createHash, randomBytes } from 'crypto';

const DEVICE_TOKEN_BYTES = 32;

// Token opaco de alta entropia entregue ao aparelho; nunca é persistido.
export function generateDeviceToken(): string {
  return randomBytes(DEVICE_TOKEN_BYTES).toString('base64url');
}

// Hash determinístico (sem salt) necessário para lookup por deviceApiKeyHash (@unique).
export function hashDeviceToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
