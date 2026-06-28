import { z } from 'zod';
import { loginSchema } from './schemas';

export type LoginInput = z.infer<typeof loginSchema>;

export type FieldErrors = {
  [K in keyof LoginInput]?: string[];
};

export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'rate_limited'
  | 'validation_error'
  | 'unknown';

export interface AuthErrorData {
  code: AuthErrorCode;
  message: string;
}

export type AuthResult = 
  | { ok: true; redirectTo: string }
  | { ok: false; error: AuthErrorData; fieldErrors?: FieldErrors };
