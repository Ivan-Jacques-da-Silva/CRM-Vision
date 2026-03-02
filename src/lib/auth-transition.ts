export type OrigemAuth = 'login' | 'register';

const AUTH_TRANSITION_KEY = 'visioncrm-auth-origin';

export function registrarOrigemAuth(origem: OrigemAuth): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(AUTH_TRANSITION_KEY, origem);
}

export function consumirOrigemAuth(): OrigemAuth | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const origem = window.sessionStorage.getItem(AUTH_TRANSITION_KEY);
  window.sessionStorage.removeItem(AUTH_TRANSITION_KEY);

  if (origem === 'login' || origem === 'register') {
    return origem;
  }

  return null;
}
