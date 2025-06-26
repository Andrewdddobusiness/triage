export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email address format
 * @param email - The email address to validate
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }

  // Updated regex that requires a proper TLD (at least 2 characters)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  // Additional check to ensure the email ends with a valid TLD
  const tldRegex = /\.[a-zA-Z]{2,}$/;
  if (!tldRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }

  if (password.length > 128) {
    return { isValid: false, error: "Password is too long (max 128 characters)" };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" };
  }

  return { isValid: true };
}

/**
 * Validates name field
 * @param name - The name to validate
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Name is too long (max 50 characters)" };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  return { isValid: true };
}

/**
 * Validates password confirmation
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
}

/**
 * Gets password strength level
 * @param password - The password to check
 * @returns Object with strength level and description
 */
export function getPasswordStrength(password: string): {
  level: "weak" | "medium" | "strong" | "very-strong";
  description: string;
} {
  if (!password) {
    return { level: "weak", description: "Enter a password" };
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Bonus for very long passwords
  if (password.length >= 16) score++;

  if (score <= 2) {
    return { level: "weak", description: "Weak password" };
  } else if (score <= 4) {
    return { level: "medium", description: "Medium strength" };
  } else if (score <= 5) {
    return { level: "strong", description: "Strong password" };
  } else {
    return { level: "very-strong", description: "Very strong password" };
  }
}
