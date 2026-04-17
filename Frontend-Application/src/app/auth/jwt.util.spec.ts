import { describe, expect, it } from 'vitest';
import { isJwtExpired, parseJwt } from './jwt.util';

// JWT with payload: {"sub":"admin","exp": 9999999999}
const NON_EXPIRED =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.signature';

// JWT with payload: {"sub":"admin","exp": 1}
const EXPIRED =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MX0.signature';

describe('jwt.util', () => {
  it('parseJwt returns payload', () => {
    const payload = parseJwt(NON_EXPIRED);
    expect(payload?.sub).toBe('admin');
    expect(payload?.exp).toBe(9999999999);
  });

  it('isJwtExpired returns true for expired token', () => {
    expect(isJwtExpired(EXPIRED, 0)).toBe(true);
  });

  it('isJwtExpired returns false for non-expired token', () => {
    expect(isJwtExpired(NON_EXPIRED, 0)).toBe(false);
  });
});

