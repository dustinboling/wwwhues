import type { TabDefinition } from './TabBar';

/**
 * Settled tab membership (Mina §2.3): Home, Visit, Help, Seasons (raised
 * disc to /whats-in-season), Arcade, Music, More. Apps add their artwork
 * pack to these entries; membership, order, labels, hrefs, and activeAlso
 * rules never vary by property. More opens the More sheet (no href).
 */
export const HUES_TABS: ReadonlyArray<Omit<TabDefinition, 'medallion' | 'medallionLit'>> = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'visit', label: 'Visit', href: '/visit' },
  { id: 'help', label: 'Help', href: '/help', activeAlso: ['/sponsor', '/volunteer'] },
  { id: 'seasons', label: 'Seasons', href: '/whats-in-season', activeAlso: ['/whats-in-season'] },
  { id: 'arcade', label: 'Arcade', href: '/arcade' },
  { id: 'music', label: 'Music', href: '/music' },
  { id: 'more', label: 'More' },
];
