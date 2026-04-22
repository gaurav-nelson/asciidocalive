import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('nginx.conf', () => {
  const config = readFileSync(resolve(__dirname, '../../../nginx.conf'), 'utf-8');

  it('has SPA fallback to index.html in try_files', () => {
    expect(config).toContain('/index.html');
    expect(config).toMatch(/try_files\s+.*\/index\.html/);
  });

  it('does not use bare =404 as the only try_files fallback', () => {
    // This was the root cause of 360K 404 requests — bare =404 without /index.html
    const tryFilesLines = config.split('\n').filter(line => line.includes('try_files'));
    for (const line of tryFilesLines) {
      const hasSpaFallback = line.includes('/index.html');
      expect(hasSpaFallback).toBe(true);
    }
  });

  it('has a custom error_page 404 directive', () => {
    expect(config).toMatch(/error_page\s+404/);
  });
});
