import type {
  StravaActivity,
  StravaTokenResponse,
  StoredAuth,
  StravaGear,
  UpdatableActivity,
  StravaAthlete,
} from '../types/strava';
import { saveAuth, getAuth, clearAuth } from './database';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';

// These will be configured by the user
let CLIENT_ID = localStorage.getItem('strava_client_id') || '';
let CLIENT_SECRET = localStorage.getItem('strava_client_secret') || '';

export function setStravaCredentials(clientId: string, clientSecret: string): void {
  CLIENT_ID = clientId;
  CLIENT_SECRET = clientSecret;
  localStorage.setItem('strava_client_id', clientId);
  localStorage.setItem('strava_client_secret', clientSecret);
}

export function getStravaCredentials(): { clientId: string; clientSecret: string } {
  return { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
}

export function hasStravaCredentials(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

function getRedirectUri(): string {
  // Use the current origin for the redirect
  return `${window.location.origin}${window.location.pathname}`;
}

export function generateAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'read,activity:read_all,activity:write,profile:read_all',
    approval_prompt: 'auto',
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<StoredAuth> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data: StravaTokenResponse = await response.json();

  const auth: StoredAuth = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at * 1000, // Convert to milliseconds
    athlete: data.athlete,
  };

  await saveAuth(auth);
  return auth;
}

export async function refreshAccessToken(refreshToken: string): Promise<StoredAuth> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data: StravaTokenResponse = await response.json();

  const storedAuth = await getAuth();
  const auth: StoredAuth = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at * 1000,
    athlete: storedAuth?.athlete || data.athlete,
  };

  await saveAuth(auth);
  return auth;
}

async function getValidAccessToken(): Promise<string> {
  const auth = await getAuth();

  if (!auth) {
    throw new Error('Not authenticated');
  }

  // Check if token is expired or will expire in the next minute
  if (Date.now() >= auth.expiresAt - 60000) {
    const newAuth = await refreshAccessToken(auth.refreshToken);
    return newAuth.accessToken;
  }

  return auth.accessToken;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`${STRAVA_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuth();
      throw new Error('Session expired. Please log in again.');
    }
    const error = await response.text();
    throw new Error(`API request failed: ${error}`);
  }

  return response.json();
}

export async function getAthlete(): Promise<StravaAthlete> {
  return apiRequest<StravaAthlete>('/athlete');
}

export async function getAthleteGear(): Promise<StravaGear[]> {
  const athlete = await apiRequest<StravaAthlete & { bikes: StravaGear[]; shoes: StravaGear[] }>(
    '/athlete'
  );
  return [...(athlete.bikes || []), ...(athlete.shoes || [])];
}

export async function getActivities(
  page: number = 1,
  perPage: number = 100,
  before?: number,
  after?: number
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (before) {
    params.append('before', Math.floor(before / 1000).toString());
  }

  if (after) {
    params.append('after', Math.floor(after / 1000).toString());
  }

  return apiRequest<StravaActivity[]>(`/athlete/activities?${params.toString()}`);
}

export async function getActivity(id: number): Promise<StravaActivity> {
  return apiRequest<StravaActivity>(`/activities/${id}`);
}

export async function updateActivity(
  id: number,
  updates: UpdatableActivity
): Promise<StravaActivity> {
  return apiRequest<StravaActivity>(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function getAllActivities(
  onProgress?: (loaded: number, total: number | null) => void,
  after?: number
): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const activities = await getActivities(page, perPage, undefined, after);
    allActivities.push(...activities);

    if (onProgress) {
      onProgress(allActivities.length, null);
    }

    if (activities.length < perPage) {
      break;
    }

    page++;

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return allActivities;
}

export async function logout(): Promise<void> {
  await clearAuth();
}
