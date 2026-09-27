import googleServices from '../../../../config/google-services.json';

export type RealtimeStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'error';

type FirebaseSession = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

type FirebaseEvent = {
  path: string;
  data: unknown;
};

type RealtimeStoreOptions<T> = {
  path: string;
  onData: (data: T | null) => void;
  onStatus: (status: RealtimeStatus) => void;
  onError: (error: Error) => void;
};

const projectInfo = googleServices.project_info;
const apiKey = googleServices.client?.[0]?.api_key?.[0]?.current_key;
const databaseUrl = projectInfo?.firebase_url?.replace(/\/$/, '');
const sessionStorageKey = 'samar-x-modes-firebase-session';

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: { message?: string } }).error;
    if (error?.message) return error.message;
  }
  return fallback;
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function cloneValue<T>(value: T): T {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function applyEvent<T>(current: T | null, event: FirebaseEvent): T | null {
  if (event.path === '/') return event.data as T | null;

  const next = cloneValue(current) as Record<string, unknown>;
  if (!next || typeof next !== 'object') return current;

  const segments = event.path.split('/').filter(Boolean);
  let cursor = next;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      if (event.data === null) delete cursor[segment];
      else cursor[segment] = event.data;
      return;
    }

    const child = cursor[segment];
    if (!child || typeof child !== 'object' || Array.isArray(child)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  });

  return next as T;
}

export class FirebaseRealtimeStore<T> {
  private readonly options: RealtimeStoreOptions<T>;
  private readonly databasePath: string;
  private session: FirebaseSession | null = null;
  private source: EventSource | null = null;
  private reconnectTimer: number | null = null;
  private snapshot: T | null = null;
  private closed = false;

  constructor(options: RealtimeStoreOptions<T>) {
    this.options = options;
    this.databasePath = `${databaseUrl}/${options.path.replace(/^\/+/, '')}.json`;
  }

  async connect() {
    if (!apiKey || !databaseUrl) {
      const error = new Error('Firebase database configuration is incomplete.');
      this.options.onStatus('error');
      this.options.onError(error);
      return;
    }

    this.closed = false;
    this.options.onStatus('connecting');
    try {
      const session = await this.getSession();
      if (!this.closed) this.openStream(session.idToken);
    } catch (error) {
      this.reportError(error);
      this.options.onStatus('offline');
    }
  }

  close() {
    this.closed = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.source?.close();
    this.source = null;
  }

  async save(data: T) {
    const session = await this.getSession();
    const response = await fetch(`${this.databasePath}?auth=${encodeURIComponent(session.idToken)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await readJson(response);
    if (!response.ok) {
      const error = new Error(getErrorMessage(payload, 'Firebase database write failed.'));
      this.reportError(error);
      throw error;
    }

    this.snapshot = data;
    this.options.onStatus('connected');
  }

  private async getSession(forceRefresh = false): Promise<FirebaseSession> {
    if (!forceRefresh && this.session && this.session.expiresAt > Date.now() + 60_000) {
      return this.session;
    }

    if (this.session?.refreshToken) {
      const refreshed = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey as string)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.session.refreshToken,
          }),
        },
      );
      const payload = await readJson(refreshed);
      if (refreshed.ok && payload && typeof payload === 'object') {
        const tokenPayload = payload as {
          id_token?: string;
          refresh_token?: string;
          expires_in?: string;
        };
        if (tokenPayload.id_token && tokenPayload.refresh_token && tokenPayload.expires_in) {
          this.session = {
            idToken: tokenPayload.id_token,
            refreshToken: tokenPayload.refresh_token,
            expiresAt: Date.now() + Number(tokenPayload.expires_in) * 1000,
          };
          this.persistSession();
          return this.session;
        }
      }
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey as string)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
      },
    );
    const payload = await readJson(response);
    if (!response.ok || !payload || typeof payload !== 'object') {
      throw new Error(getErrorMessage(payload, 'Firebase anonymous sign-in failed.'));
    }

    const tokenPayload = payload as {
      idToken?: string;
      refreshToken?: string;
      expiresIn?: string;
    };
    if (!tokenPayload.idToken || !tokenPayload.refreshToken || !tokenPayload.expiresIn) {
      throw new Error('Firebase anonymous sign-in returned an invalid session.');
    }

    this.session = {
      idToken: tokenPayload.idToken,
      refreshToken: tokenPayload.refreshToken,
      expiresAt: Date.now() + Number(tokenPayload.expiresIn) * 1000,
    };
    this.persistSession();
    return this.session;
  }

  private persistSession() {
    if (!this.session) return;
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(this.session));
  }

  private openStream(idToken: string) {
    if (this.closed) return;
    this.source?.close();

    const source = new EventSource(
      `${this.databasePath}?auth=${encodeURIComponent(idToken)}`,
    );
    this.source = source;

    const handleData = (event: Event) => {
      try {
        const message = JSON.parse((event as MessageEvent<string>).data) as FirebaseEvent;
        this.snapshot = applyEvent(this.snapshot, message);
        this.options.onData(this.snapshot);
      } catch (error) {
        this.reportError(error);
      }
    };

    source.addEventListener('put', handleData);
    source.addEventListener('patch', handleData);
    source.addEventListener('cancel', () => {
      this.options.onStatus('error');
      this.scheduleReconnect();
    });
    source.addEventListener('auth_revoked', () => {
      this.session = null;
      this.scheduleReconnect();
    });
    source.onopen = () => this.options.onStatus('connected');
    source.onerror = () => {
      source.close();
      this.options.onStatus('reconnecting');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.closed || this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        const session = await this.getSession(true);
        this.openStream(session.idToken);
      } catch (error) {
        this.reportError(error);
        this.options.onStatus('offline');
        this.scheduleReconnect();
      }
    }, 3_000);
  }

  private reportError(error: unknown) {
    this.options.onError(error instanceof Error ? error : new Error(String(error)));
  }
}
