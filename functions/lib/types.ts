export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  ENVIRONMENT?: string;
  APP_URL?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string | null;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  email_verified: number;
  display_name: string | null;
  avatar_url: string | null;
  password_hash: string | null;
  failed_login_count: number;
  locked_until: string | null;
  created_at: string;
  deleted_at: string | null;
}
