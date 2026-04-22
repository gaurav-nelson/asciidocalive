import { describe, it, expect } from 'vitest';
import { compareVersions, isNewerVersion } from '../versionUtils';

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('detects major version difference', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
  });

  it('detects minor version difference', () => {
    expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
    expect(compareVersions('1.1.0', '1.2.0')).toBe(-1);
  });

  it('detects patch version difference', () => {
    expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
    expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
  });

  it('handles versions with different segment counts', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBe(1);
  });
});

describe('isNewerVersion', () => {
  it('returns true when v1 is newer', () => {
    expect(isNewerVersion('1.3.0', '1.2.0')).toBe(true);
  });

  it('returns false when v1 is older', () => {
    expect(isNewerVersion('1.2.0', '1.3.0')).toBe(false);
  });

  it('returns false when versions are equal', () => {
    expect(isNewerVersion('1.3.0', '1.3.0')).toBe(false);
  });
});
