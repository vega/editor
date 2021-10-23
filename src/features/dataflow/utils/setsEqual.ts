/**
 * Compare whether sets contain same elements.
 *
 * https://stackoverflow.com/a/31129384/907060
 */
export function setsEqual<T>(l: Set<T>, r: Set<T>): boolean {
  if (l.size !== r.size) {
    return false;
  }
  for (const x of l) {
    if (!r.has(x)) {
      return false;
    }
  }
  return true;
}
