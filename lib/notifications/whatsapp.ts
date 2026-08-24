/**
 * WhatsApp integration notes
 * --------------------------
 * This app does NOT integrate the WhatsApp Business API. It only builds
 * real `wa.me` deep links that open a chat with the configured number.
 * The number itself lives in Settings (admin-editable), defaulting to a
 * fictional demo number — see types/settings.ts.
 */
export function buildWhatsAppLink(phoneDigitsOnly: string, message?: string) {
  const digits = phoneDigitsOnly.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
