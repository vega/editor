export function mapValues<T extends string, U, V>(obj: Record<T, U>, fn: (value: U, key: T) => V): Record<T, V> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]: [T, U]) => [k, fn(v, k)])) as Record<T, V>;
}
