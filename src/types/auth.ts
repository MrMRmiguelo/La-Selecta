import { User, Session } from '@supabase/supabase-js';

export interface UserSession {
  user: User;
  session: Session;
}

export interface AuthError {
  message: string;
}

export type AuthResponse = {
  error: AuthError | null;
  data?: {
    user: User | null;
    session: Session | null;
  };
};