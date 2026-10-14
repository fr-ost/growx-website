export const REVOKED_MESSAGE: string;
export const SIGNED_OUT_MESSAGE: string;
export type GuardState = "signed_out" | "pending" | "active" | "paused" | "revoked";
export type Verdict = "active" | "revoked" | "unauthenticated" | "unavailable";
export function interpretResponse(status: number, body: unknown): Verdict;
export interface GuardDeps {
  apiBase: string;
  getAccessToken: () => Promise<string | null>;
  clearAuth: () => Promise<void>;
  stopAllOperations: (reason: string) => Promise<void>;
  pauseOperations?: (reason: string) => Promise<void>;
  resumeOperations?: () => Promise<void>;
  saveNotice?: (message: string | null) => Promise<void>;
  notify?: (message: string) => void;
  storage?: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<void> } | null;
  scheduleWake?: (ms: number) => void;
  fetchFn?: (url: string, init: RequestInit) => Promise<Response>;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (t: unknown) => void;
  now?: () => number;
  checkEveryMs?: number;
  freshMs?: number;
  requestTimeoutMs?: number;
  retry?: { baseMs: number; maxMs: number; maxAttempts: number };
  slowEveryMs?: number;
}
export interface SessionGuard {
  readonly state: GuardState;
  epoch(): number;
  isCurrent(e: number): boolean;
  runIfCurrent<T>(e: number, fn: () => T): T | undefined;
  canRun(): boolean;
  validate(opts?: { reason?: string; force?: boolean }): Promise<GuardState>;
  assertActive(): Promise<{ ok: boolean; state: GuardState }>;
  onLogin(): Promise<{ ok: boolean; reason?: "revoked" | "unauthenticated" | "unavailable" }>;
  logout(): Promise<void>;
  reportVerdict(v: Verdict): Promise<void>;
  start(opts: { signedIn: boolean }): Promise<GuardState>;
  stop(): void;
}
export function createSessionGuard(deps: GuardDeps): SessionGuard;
