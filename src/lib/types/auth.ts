// SPEC: CLAUDE.md > Error Codes > CB-AUTH-*
// Auth types used across auth helpers, server actions, and middleware

export type AuthErrorCode =
  | "CB-AUTH-001" // Invalid credentials
  | "CB-AUTH-002" // Session expired
  | "CB-AUTH-003" // Not authorized (not team member)
  | "CB-AUTH-004" // Not authorized (not admin role)
  | "CB-AUTH-010" // Magic link send failed
  | "CB-AUTH-011"; // Client email not found

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError };
