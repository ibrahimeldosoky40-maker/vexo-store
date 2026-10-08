/** Client-only helper: remember the visitor's language so the proxy honours it next visit. */
export function rememberLocale(locale: string) {
  document.cookie = `VEXO_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}
