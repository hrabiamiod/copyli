export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

const COMMON_PASSWORDS = new Set([
  'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwerty123', 'qwerty12', 'iloveyou1', 'admin123', 'letmein1',
  'welcome1', 'monkey123', 'dragon12', 'master12', 'sunshine1',
]);

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: 'Haslo musi miec co najmniej 8 znakow' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Haslo nie moze miec wiecej niz 128 znakow' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Haslo musi zawierac co najmniej jedna litere' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Haslo musi zawierac co najmniej jedna cyfre' };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, error: 'To haslo jest zbyt popularne, wybierz inne' };
  }
  return { valid: true };
}

export function sanitizeString(str: string, maxLength = 100): string {
  return str.trim().slice(0, maxLength);
}
