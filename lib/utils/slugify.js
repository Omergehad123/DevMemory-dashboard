/**
 * Generates an SEO-friendly URL slug from any title or name string.
 * Supports Unicode/Arabic/multilingual characters.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^\p{L}\p{N}]+/gu, '-') // replace any non-alphanumeric unicode char with -
    .replace(/^-+|-+$/g, '') // trim leading/trailing -
    .replace(/-+/g, '-'); // collapse consecutive -
}
