/**
 * Helper function to resolve public directory assets
 * @param path Path relative to public directory
 * @returns Full URL to the asset
 */
export function getPublicPath(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  return path;
}
