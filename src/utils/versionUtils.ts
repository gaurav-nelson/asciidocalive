// Version comparison utility for semantic versioning

/**
 * Compares two semantic version strings
 * @param v1 - First version string (e.g., "1.2.0")
 * @param v2 - Second version string (e.g., "1.1.0")
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  // Split versions into parts and convert to numbers
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  // Compare each part (major, minor, patch)
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

/**
 * Checks if version v1 is newer than version v2
 * @param v1 - Version to check
 * @param v2 - Version to compare against
 * @returns true if v1 is newer than v2
 */
export function isNewerVersion(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) > 0;
}

