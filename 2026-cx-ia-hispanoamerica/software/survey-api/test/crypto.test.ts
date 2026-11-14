import { describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { Privacy, fingerprint, tokenDigest, newToken } from '../src/privacy';

describe('contact and verification privacy', () => {
  const privacy = new Privacy(randomBytes(32), randomBytes(32));
  it('normalizes lookup emails, uses a keyed digest and separates IP identities', () => {
    expect(privacy.emailKey(' Person@Example.com ')).toBe(privacy.emailKey('person@example.com'));
    expect(privacy.emailKey('a@example.com')).not.toBe(new Privacy(randomBytes(32), randomBytes(32)).emailKey('a@example.com'));
    expect(privacy.originKey('1.2.3.4', '2026-11-14')).not.toBe(privacy.originKey('1.2.3.4', '2026-11-15'));
  });
  it('encrypts with randomized authenticated encryption and purpose binding', () => {
    const sealed = privacy.seal('person@example.com', 'contact:abc');
    expect(sealed).not.toContain('person');
    expect(privacy.open(sealed, 'contact:abc')).toBe('person@example.com');
    expect(privacy.seal('person@example.com', 'contact:abc')).not.toBe(sealed);
    expect(() => privacy.open(sealed, 'token:abc')).toThrow();
    const parts = sealed.split('.'); parts[2] = Buffer.alloc(16).toString('base64url');
    expect(() => privacy.open(parts.join('.'), 'contact:abc')).toThrow();
  });
  it('uses 256-bit random tokens and stores only their digest', () => {
    const token = newToken(); expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tokenDigest(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(newToken()).not.toBe(token);
  });
  it('uses stable fingerprints independent of JSON object key order', () => {
    expect(fingerprint({b:2,a:{z:1,x:0}})).toBe(fingerprint({a:{x:0,z:1},b:2}));
    expect(fingerprint({a:[1,2]})).not.toBe(fingerprint({a:[2,1]}));
  });
  it('rejects invalid encryption/index keys', () => {
    expect(() => new Privacy(Buffer.alloc(4), Buffer.alloc(32))).toThrow();
    expect(() => new Privacy(Buffer.alloc(32), Buffer.alloc(4))).toThrow();
  });
});
