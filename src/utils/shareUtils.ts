const MAX_RAW_SIZE = 6 * 1024; // 6KB
const MAX_URL_LENGTH = 8192;
const HASH_PREFIX = '#doc=';

export async function encodeDocumentToUrl(content: string): Promise<string> {
  const rawSize = new TextEncoder().encode(content).length;
  if (rawSize > MAX_RAW_SIZE) {
    throw new Error('Document too large for URL sharing. Use GitHub Gist export instead.');
  }

  const compressed = await compress(content);
  const base64 = btoa(String.fromCharCode(...compressed));
  const url = `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${base64}`;

  if (url.length > MAX_URL_LENGTH) {
    throw new Error('Document too large for URL sharing. Use GitHub Gist export instead.');
  }

  return url;
}

export async function decodeDocumentFromUrl(): Promise<string | null> {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;

  const base64 = hash.slice(HASH_PREFIX.length);
  try {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const content = await decompress(bytes);

    // Clear hash to prevent re-import on refresh
    history.replaceState(null, '', window.location.pathname);

    return content;
  } catch (error) {
    console.error('Error decoding shared document:', error);
    return null;
  }
}

async function compress(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new Blob([encoder.encode(text)]).stream()
    .pipeThrough(new CompressionStream('gzip'));
  const blob = await new Response(stream).blob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes]).stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}
