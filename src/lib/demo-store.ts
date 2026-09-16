export interface DemoUser {
  id: string;
  email: string;
  name?: string;
}

export interface DemoSession {
  user: DemoUser;
}

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT";

export interface UserProfileRow {
  id: string;
  user_id: string;
  preferred_name: string | null;
  age: number | null;
  generation: string | null;
  skill_level: string;
  skill_score: number;
  personality: string | null;
}

export interface DashboardPrefsRow {
  user_id: string;
  chart_indicators: string[];
  layout_config: Record<string, unknown>;
  favorite_sections: string[];
}

export interface InteractionRow {
  user_id: string;
  interaction_type: string;
  section: string;
  details: Record<string, unknown>;
  duration_seconds: number;
  created_at: string;
}

export interface TutorialProgressRow {
  user_id: string;
  tutorial_id: string;
  completed: boolean;
  completion_time_seconds?: number;
  was_helpful?: boolean;
}

export interface ConversationRow {
  id: string;
  user_id: string;
  created_at: string;
  was_helpful?: boolean;
  messages?: unknown;
}

interface StoredUser extends DemoUser {
  passwordHash: string;
}

interface DemoState {
  users: StoredUser[];
  sessionUserId: string | null;
  profiles: UserProfileRow[];
  prefs: DashboardPrefsRow[];
  interactions: InteractionRow[];
  tutorials: TutorialProgressRow[];
  conversations: ConversationRow[];
}

const STORAGE_KEY = "nexo-trade-demo-db";

const listeners = new Set<(event: AuthChangeEvent, session: DemoSession | null) => void>();

function emptyState(): DemoState {
  return {
    users: [],
    sessionUserId: null,
    profiles: [],
    prefs: [],
    interactions: [],
    tutorials: [],
    conversations: [],
  };
}

function readState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function writeState(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toPublicUser(user: StoredUser): DemoUser {
  return { id: user.id, email: user.email, name: user.name };
}

function currentSession(state: DemoState): DemoSession | null {
  if (!state.sessionUserId) return null;
  const user = state.users.find((u) => u.id === state.sessionUserId);
  if (!user) return null;
  return { user: toPublicUser(user) };
}

function notify(event: AuthChangeEvent, session: DemoSession | null) {
  listeners.forEach((listener) => listener(event, session));
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export const demoAuth = {
  async getSession(): Promise<{ data: { session: DemoSession | null } }> {
    return { data: { session: currentSession(readState()) } };
  },

  async getUser(): Promise<{ data: { user: DemoUser | null } }> {
    return { data: { user: currentSession(readState())?.user ?? null } };
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: DemoSession | null) => void) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    };
  },

  async signInWithPassword(credentials: { email: string; password: string }) {
    const state = readState();
    const email = credentials.email.trim().toLowerCase();
    const user = state.users.find((item) => item.email === email);
    if (!user || user.passwordHash !== (await hashPassword(credentials.password))) {
      return { data: { session: null }, error: new Error("Invalid email or password") };
    }

    state.sessionUserId = user.id;
    writeState(state);
    const session = currentSession(state);
    notify("SIGNED_IN", session);
    return { data: { session }, error: null };
  },

  async signUp(input: {
    email: string;
    password: string;
    options?: { data?: { name?: string } };
  }) {
    const state = readState();
    const email = input.email.trim().toLowerCase();
    if (state.users.some((user) => user.email === email)) {
      return { data: { session: null }, error: new Error("An account with this email already exists") };
    }

    const user: StoredUser = {
      id: createId("user"),
      email,
      name: input.options?.data?.name,
      passwordHash: await hashPassword(input.password),
    };
    state.users.push(user);
    state.sessionUserId = user.id;
    writeState(state);
    const session = currentSession(state);
    notify("SIGNED_IN", session);
    return { data: { session }, error: null };
  },

  async signOut() {
    const state = readState();
    state.sessionUserId = null;
    writeState(state);
    notify("SIGNED_OUT", null);
    return { error: null };
  },

  async resetPasswordForEmail(_email: string) {
    return { error: null };
  },
};

export const demoDb = {
  getProfile(userId: string): UserProfileRow | null {
    return readState().profiles.find((profile) => profile.user_id === userId) ?? null;
  },

  upsertProfile(payload: Omit<UserProfileRow, "id"> & { id?: string }): UserProfileRow {
    const state = readState();
    const existing = state.profiles.find((profile) => profile.user_id === payload.user_id);
    const next: UserProfileRow = {
      id: existing?.id ?? payload.id ?? createId("profile"),
      user_id: payload.user_id,
      preferred_name: payload.preferred_name,
      age: payload.age,
      generation: payload.generation,
      skill_level: payload.skill_level,
      skill_score: payload.skill_score,
      personality: payload.personality,
    };

    if (existing) {
      Object.assign(existing, next);
    } else {
      state.profiles.push(next);
    }
    writeState(state);
    return next;
  },

  updateProfile(userId: string, updates: Partial<UserProfileRow>) {
    const state = readState();
    const existing = state.profiles.find((profile) => profile.user_id === userId);
    if (!existing) return null;
    Object.assign(existing, updates);
    writeState(state);
    return existing;
  },

  upsertPrefs(payload: DashboardPrefsRow) {
    const state = readState();
    const existing = state.prefs.find((item) => item.user_id === payload.user_id);
    if (existing) Object.assign(existing, payload);
    else state.prefs.push(payload);
    writeState(state);
  },

  addInteraction(row: Omit<InteractionRow, "created_at">) {
    const state = readState();
    state.interactions.push({ ...row, created_at: new Date().toISOString() });
    writeState(state);
  },

  getInteractions(userId: string, sinceIso?: string) {
    return readState().interactions.filter((item) => {
      if (item.user_id !== userId) return false;
      if (sinceIso && item.created_at < sinceIso) return false;
      return true;
    });
  },

  getCompletedTutorials(userId: string) {
    return readState().tutorials.filter((item) => item.user_id === userId && item.completed);
  },

  upsertTutorial(row: TutorialProgressRow) {
    const state = readState();
    const existing = state.tutorials.find(
      (item) => item.user_id === row.user_id && item.tutorial_id === row.tutorial_id,
    );
    if (existing) Object.assign(existing, row);
    else state.tutorials.push(row);
    writeState(state);
  },

  updateTutorial(userId: string, tutorialId: string, updates: Partial<TutorialProgressRow>) {
    const state = readState();
    const existing = state.tutorials.find(
      (item) => item.user_id === userId && item.tutorial_id === tutorialId,
    );
    if (!existing) return;
    Object.assign(existing, updates);
    writeState(state);
  },

  addConversation(userId: string, messages?: unknown) {
    const state = readState();
    const row: ConversationRow = {
      id: createId("convo"),
      user_id: userId,
      created_at: new Date().toISOString(),
      messages,
    };
    state.conversations.push(row);
    writeState(state);
    return row;
  },

  getConversations(userId: string, sinceIso?: string) {
    return readState().conversations.filter((item) => {
      if (item.user_id !== userId) return false;
      if (sinceIso && item.created_at < sinceIso) return false;
      return true;
    });
  },

  updateConversation(id: string, updates: Partial<ConversationRow>) {
    const state = readState();
    const existing = state.conversations.find((item) => item.id === id);
    if (!existing) return;
    Object.assign(existing, updates);
    writeState(state);
  },
};
