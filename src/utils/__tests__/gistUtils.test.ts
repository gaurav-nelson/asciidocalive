import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveToGist, loadFromGist } from '../gistUtils';

describe('saveToGist', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a new gist when no gistId provided', async () => {
    const mockResponse = { id: 'abc123', html_url: 'https://gist.github.com/abc123', files: {} };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const result = await saveToGist('fake-token', 'My Doc', '= Hello');

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.github.com/gists');
    expect(call[1]?.method).toBe('POST');
    expect(result).toEqual({ id: 'abc123', url: 'https://gist.github.com/abc123' });
  });

  it('updates an existing gist when gistId provided', async () => {
    const mockResponse = { id: 'abc123', html_url: 'https://gist.github.com/abc123', files: {} };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    await saveToGist('fake-token', 'My Doc', '= Hello', 'abc123');

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.github.com/gists/abc123');
    expect(call[1]?.method).toBe('PATCH');
  });

  it('sanitizes filenames', async () => {
    const mockResponse = { id: 'abc123', html_url: 'https://gist.github.com/abc123', files: {} };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    await saveToGist('fake-token', 'My Doc!@#$', '= Hello');

    const call = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(call[1]?.body as string);
    const filename = Object.keys(body.files)[0];
    expect(filename).toBe('My_Doc____.adoc');
    expect(filename).not.toMatch(/[^a-zA-Z0-9_.-]/);
  });

  it('throws on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 })
    );

    await expect(saveToGist('bad-token', 'Doc', 'content')).rejects.toThrow('Bad credentials');
  });
});

describe('loadFromGist', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts gist ID from full URL', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/abc123',
      files: { 'doc.adoc': { filename: 'doc.adoc', content: '= Hello' } },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    await loadFromGist('https://gist.github.com/user/abc123');

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('https://api.github.com/gists/abc123');
  });

  it('works with plain gist ID', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/abc123',
      files: { 'doc.adoc': { filename: 'doc.adoc', content: '= Hello' } },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const result = await loadFromGist('abc123');
    expect(result).toEqual({ content: '= Hello', name: 'doc', gistId: 'abc123' });
  });

  it('prefers .adoc files over others', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/abc123',
      files: {
        'readme.md': { filename: 'readme.md', content: '# Readme' },
        'doc.adoc': { filename: 'doc.adoc', content: '= AsciiDoc' },
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const result = await loadFromGist('abc123');
    expect(result.content).toBe('= AsciiDoc');
    expect(result.name).toBe('doc');
  });

  it('strips .adoc extension from name', async () => {
    const mockResponse = {
      id: 'abc123',
      html_url: 'https://gist.github.com/abc123',
      files: { 'my-document.adoc': { filename: 'my-document.adoc', content: 'content' } },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const result = await loadFromGist('abc123');
    expect(result.name).toBe('my-document');
  });

  it('throws user-friendly message on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 404 }));
    await expect(loadFromGist('nonexistent')).rejects.toThrow('Gist not found');
  });

  it('throws on empty gist', async () => {
    const mockResponse = { id: 'abc123', html_url: 'https://gist.github.com/abc123', files: {} };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));
    await expect(loadFromGist('abc123')).rejects.toThrow('Gist has no files');
  });
});
