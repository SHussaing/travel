export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  [k: string]: unknown;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return false; // if there's no exp, treat as non-expiring
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + skewSeconds;
}

