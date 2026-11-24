/**
 * Required-custom-header CSRF control (SecOps #2, plan §2.1(b)): the one
 * program-wide header every state-changing request carries. Defined here
 * so the Worker proxy, the app's fetch layer, and the offline
 * mutation-queue replay all send the same bytes — a single source, never
 * three spellings.
 */
export const HUES_CSRF_HEADER = 'X-Hues-CSRF';

export const HUES_CSRF_VALUE = '1';
