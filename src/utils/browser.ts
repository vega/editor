/**
 * User authentication data stored in localStorage
 */
export interface AuthData {
  handle: string;
  isAuthenticated: boolean;
  name: string;
  profilePicUrl: string;
  authToken?: string;
}

const AUTH_KEY = 'vega_editor_auth_data';

/**
 * Saves authentication data to localStorage
 * @param data Authentication data to save
 */
export const saveAuthToLocalStorage = (data: AuthData): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

/**
 * Gets authentication data from localStorage
 * @returns Authentication data or null if not found
 */
export const getAuthFromLocalStorage = (): AuthData | null => {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as AuthData;
  } catch (e) {
    console.error('Failed to parse auth data from localStorage', e);
    return null;
  }
};

/**
 * Clears authentication data from localStorage
 */
export const clearAuthFromLocalStorage = (): void => {
  localStorage.removeItem(AUTH_KEY);
};
