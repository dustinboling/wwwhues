import { useState } from 'react';
import type { JSX } from 'react';
import { Link } from '../media/Link';
import { isMediaUrl } from '../lib/media';
import { usePrefersReducedMotion } from '../lib/reduced-motion';
import { cx } from '../lib/cx';

export type TabId = 'home' | 'visit' | 'help' | 'seasons' | 'arcade' | 'music' | 'more';

export interface TabDefinition {
  id: TabId;
  label: string;
  /** Route tabs link; More opens the sheet and carries no href. */
  href?: string;
  /** Routes that also light this tab (activeAlso rules). */
  activeAlso?: string[];
  medallion: string;
  medallionLit?: string;
}

export interface TabBarProps {
  tabs: TabDefinition[];
  currentPath: string;
  discArt: string;
  plateArt: string;
  /** Game variant: Arcade forced active, Home unlit, disc glow off. */
  arcadeActive?: boolean;
  /** Music stays lit while the shell player plays, on any tab. */
  musicPlaying?: boolean;
  /** Seasons press flourish hook (butterfly burst host). */
  onSeasonsPress?: () => void;
  /** More tab opens the More sheet (disclosure with expanded state). */
  onMoreTab?: () => void;
  moreOpen?: boolean;
  className?: string;
}

function MissingHrefTab({ tab, art }: { tab: TabDefinition; art: JSX.Element }): JSX.Element {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.error(`Hues TabBar: route tab "${tab.id}" has no href; pass hrefs or use HUES_TABS.`);
  }
  return (
    <span className="hues-tab__link" data-missing-href>
      {art}
      <span className="hues-tab__label">{tab.label}</span>
    </span>
  );
}

function isActive(tab: TabDefinition, currentPath: string, arcadeActive: boolean, musicPlaying: boolean): boolean {
  if (arcadeActive) return tab.id === 'arcade';
  if (tab.id === 'music' && musicPlaying) return true;
  if (tab.href !== undefined && currentPath === tab.href) return true;
  return tab.activeAlso?.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)) === true;
}

/**
 * Seven-tab bar with locked geometry (Mina §2.3): the plate, disc,
 * medallions, and labels are token constants, identical in every property.
 * Real tab links (current = aria-current page); More is a disclosure that
 * opens the More sheet; the Seasons disc spins its locked flourish on
 * press; no tab sounds, ever. Membership comes from HUES_TABS.
 */
export function TabBar({ tabs, currentPath, discArt, plateArt, arcadeActive = false, musicPlaying = false, onSeasonsPress, onMoreTab, moreOpen = false, className }: TabBarProps): JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const [flourish, setFlourish] = useState(false);
  return (
    <nav aria-label="Hues" className={cx('hues-tabbar', className)}>
      <div className="hues-tabbar__plate" role="presentation">
        <img
          src={plateArt}
          alt=""
          aria-hidden="true"
          crossOrigin={isMediaUrl(plateArt) ? 'anonymous' : undefined}
          className="hues-tabbar__plate-art"
        />
      </div>
      <ul className="hues-tabbar__tabs">
        {tabs.map((tab) => {
          const active = isActive(tab, currentPath, arcadeActive, musicPlaying);
          const isDisc = tab.id === 'seasons';
          const isMoreButton = tab.id === 'more' && onMoreTab !== undefined;
          const glow = isDisc && active && !arcadeActive;
          const medallionSrc = active && tab.medallionLit !== undefined ? tab.medallionLit : tab.medallion;
          const art = isDisc ? (
            <img
              src={discArt}
              alt=""
              aria-hidden="true"
              crossOrigin={isMediaUrl(discArt) ? 'anonymous' : undefined}
              data-glow={glow || undefined}
              data-flourish={flourish && !reducedMotion ? true : undefined}
              className="hues-tab__disc"
            />
          ) : (
            <img
              src={medallionSrc}
              alt=""
              aria-hidden="true"
              crossOrigin={isMediaUrl(medallionSrc) ? 'anonymous' : undefined}
              className="hues-tab__medallion"
            />
          );
          const onPress = (): void => {
            if (isDisc && !reducedMotion) {
              setFlourish(false);
              requestAnimationFrame(() => setFlourish(true));
            }
            if (isDisc) onSeasonsPress?.();
          };
          return (
            <li key={tab.id} className={cx('hues-tab', `hues-tab--${tab.id}`)} data-active={active || undefined}>
              {isMoreButton ? (
                <button type="button" aria-expanded={moreOpen} onClick={onMoreTab} className="hues-tab__link">
                  {art}
                  <span className="hues-tab__label">{tab.label}</span>
                </button>
              ) : tab.href === undefined ? (
                <MissingHrefTab tab={tab} art={art} />
              ) : (
                <Link
                  href={tab.href}
                  context="nav"
                  aria-current={active ? 'page' : undefined}
                  className="hues-tab__link"
                  onClick={isDisc ? onPress : undefined}
                >
                  {art}
                  <span className="hues-tab__label">{tab.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
