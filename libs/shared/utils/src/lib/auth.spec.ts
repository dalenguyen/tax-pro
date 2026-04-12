import { extractBearerToken } from './auth';

describe('extractBearerToken', () => {
  it('returns null for undefined or empty header', () => {
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken('')).toBeNull();
  });

  it('returns null for non-Bearer schemes', () => {
    expect(extractBearerToken('Basic abc123')).toBeNull();
    expect(extractBearerToken('Token abc123')).toBeNull();
  });

  it('extracts token after Bearer', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('is case-insensitive on the scheme', () => {
    expect(extractBearerToken('bearer xyz')).toBe('xyz');
    expect(extractBearerToken('BEARER xyz')).toBe('xyz');
  });

  it('trims surrounding whitespace', () => {
    expect(extractBearerToken('  Bearer   token-value  ')).toBe('token-value');
  });

  it('returns null if Bearer has no token', () => {
    expect(extractBearerToken('Bearer')).toBeNull();
    expect(extractBearerToken('Bearer ')).toBeNull();
  });
});
