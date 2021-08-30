// Trim all arrays to a maximum length, to minimize the size of the state
const MAX_ARRAY_LENGTH = 20;

// Sentinal value to add at end of clipped arrays
const CLIPPED_SENTINAL = 'CLIPPED';

export type SanitizedValue =
  | {type: 'value'; value: unknown}
  | {type: 'error'; error: string}
  | {type: 'function'; functionName: string};

/**
 * Sanitizes the value of an operator, to make it suitable for storing in redux.
 */
export function sanitizeValue(v: unknown): SanitizedValue {
  if (typeof v === 'function') {
    return {type: 'function', functionName: v.name};
  }
  try {
    // If we can't stringify, it probably has cyclical references, so we'll just skip it
    return {type: 'value', value: JSON.parse(JSON.stringify(v, replacer))};
  } catch (e) {
    return {type: 'error', error: e.toString()};
  }
}

/**
 * Replace long arrays with shorter ones, to minimze the size of the state
 */
function replacer(_key: string, value: unknown): unknown {
  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
    const trimmed = value.slice(0, MAX_ARRAY_LENGTH);
    trimmed.push(CLIPPED_SENTINAL);
    return trimmed;
  }
  return value;
}
