export function sanitizeInput(value: string, maxLength = 500): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength)
}

export function sanitizeEmail(email: string): string {
  return email.replace(/[^a-zA-Z0-9._%+\-@]/g, '').slice(0, 254)
}

export function sanitizeTel(tel: string): string {
  return tel.replace(/[^0-9+\-\s()]/g, '').slice(0, 20)
}
