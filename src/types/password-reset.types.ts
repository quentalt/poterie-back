export interface PasswordResetCode {
  id: number;
  user_id: number;
  code_hash: string;   // SHA-256 du code à 6 chiffres, jamais le code brut
  expires_at: Date;
  used_at: Date | null;
  attempts: number;    // Protège contre le brute-force
  created_at: Date;
}

export interface RequestResetDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;   // Nécessaire pour retrouver l'utilisateur sans session
  code: string;    // Les 6 chiffres recopiés depuis l'email
  password: string;
}

export interface VerifyCodeDto {
  email: string;
  code: string;
}
