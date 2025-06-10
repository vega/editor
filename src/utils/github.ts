import {BACKEND_URL} from '../constants/index.js';

export const getGithubToken = async (): Promise<string> => {
  const headers: HeadersInit = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  const authToken = localStorage.getItem('vega_editor_auth_token');
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  try {
    const response = await fetch(`${BACKEND_URL}auth/github/token`, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub token: ${response.status}`);
    }

    const data = await response.json();
    return data.githubAccessToken;
  } catch (error) {
    console.error('Failed to retrieve GitHub token:', error);
    throw error;
  }
};
