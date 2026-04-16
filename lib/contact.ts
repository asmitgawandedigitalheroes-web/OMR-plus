/**
 * Central contact configuration.
 * TODO: Replace WHATSAPP_PHONE with the client's actual WhatsApp number
 * (country code + number, no spaces or +). Example: '971501234567' for UAE +971 50 123 4567
 */
export const WHATSAPP_PHONE = '971500000000'; // ← UPDATE THIS

/**
 * Build a wa.me deep-link URL with the correct phone number.
 */
export function waUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}
