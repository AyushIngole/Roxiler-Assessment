export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\];'/\\]).{8,16}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name) {
  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return '';
}

export function validateAddress(address) {
  if (!address || address.trim().length === 0) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return '';
}

export function validateEmail(email) {
  if (!EMAIL_REGEX.test(email || '')) return 'Enter a valid email address';
  return '';
}

export function validatePassword(password) {
  if (!PASSWORD_REGEX.test(password || '')) {
    return 'Password must be 8-16 characters with at least one uppercase letter and one special character';
  }
  return '';
}
