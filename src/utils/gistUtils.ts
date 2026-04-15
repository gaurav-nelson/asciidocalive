const GITHUB_API = 'https://api.github.com';

interface GistFile {
  filename: string;
  content: string;
}

interface GistResponse {
  id: string;
  html_url: string;
  files: Record<string, GistFile>;
}

export async function verifyToken(token: string): Promise<string> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error('Invalid token');
  const data = await res.json();
  return data.login;
}

export async function saveToGist(
  token: string,
  docName: string,
  content: string,
  gistId?: string
): Promise<{ id: string; url: string }> {
  const filename = `${docName.replace(/[^a-zA-Z0-9_-]/g, '_')}.adoc`;
  const payload = {
    description: docName,
    public: false,
    files: { [filename]: { content } },
  };

  const url = gistId
    ? `${GITHUB_API}/gists/${gistId}`
    : `${GITHUB_API}/gists`;

  const res = await fetch(url, {
    method: gistId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${res.status}`);
  }

  const data: GistResponse = await res.json();
  return { id: data.id, url: data.html_url };
}

export async function loadFromGist(
  gistIdOrUrl: string,
  token?: string
): Promise<{ content: string; name: string; gistId: string }> {
  // Extract gist ID from URL if needed
  const gistId = gistIdOrUrl.replace(/.*\//, '');

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `token ${token}`;

  const res = await fetch(`${GITHUB_API}/gists/${gistId}`, { headers });

  if (!res.ok) {
    throw new Error(res.status === 404
      ? 'Gist not found. Private gists require a GitHub token.'
      : `GitHub API error: ${res.status}`
    );
  }

  const data: GistResponse = await res.json();
  const files = Object.values(data.files);

  // Prefer .adoc files
  const adocFile = files.find(f => f.filename.endsWith('.adoc'));
  const file = adocFile || files[0];

  if (!file) throw new Error('Gist has no files');

  const name = file.filename.replace(/\.adoc$/, '');
  return { content: file.content, name, gistId: data.id };
}
