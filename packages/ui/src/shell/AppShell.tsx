import { useEffect, useState } from 'react';
import type { ComponentType, JSX, ReactNode } from 'react';
import { useAnnounceProvider } from '../lib/announce';
import { cx } from '../lib/cx';
import { LiveRegion } from '../feedback/LiveRegion';
import type { ThemeName } from '@hues/tokens/tokens';

export type ShellDensity = 'comfortable' | 'compact';

export interface AppShellProps {
  /** Per-property theme layer; sets data-theme on the shell. */
  theme?: ThemeName;
  /** Visitor surfaces run comfortable; admin surfaces run compact. */
  density?: ShellDensity;
  /** Skip link target id (game shells target the game region). */
  mainId?: string;
  skipLabel?: string;
  header?: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
  player?: ReactNode;
  notices?: ReactNode;
  offline?: boolean;
  children: ReactNode;
  /** Fired when a new worker waits; the app shows UpdateNotice (Apply at route boundaries). */
  onServiceWorkerUpdate?: (apply: () => void) => void;
  onOfflineReady?: () => void;
  className?: string;
}

/**
 * One frame for every property: top region, routed content, bottom region,
 * and shell overlays. Renders header (banner), exactly one labelled
 * navigation, one main, and footer (contentinfo), with the skip link first.
 * Shell variants are token and composition differences, never codebases.
 */
export function AppShell({
  theme = 'park',
  density = 'comfortable',
  mainId = 'content',
  skipLabel = 'Skip to content',
  header,
  navigation,
  footer,
  player,
  notices,
  offline = false,
  children,
  onServiceWorkerUpdate,
  onOfflineReady,
  className,
}: AppShellProps): JSX.Element {
  const { context: AnnounceContext, regionRef, announce } = useAnnounceProvider();
  return (
    <AnnounceContext.Provider value={announce}>
      <div className={cx('hues-shell', className)} data-theme={theme} data-density={density} data-offline={offline || undefined}>
        <a href={`#${mainId}`} className="hues-skip-link">
          {skipLabel}
        </a>
        {header}
        {navigation}
        <main id={mainId} data-route-main tabIndex={-1} className="hues-shell__main">
          {children}
        </main>
        {footer}
        {player}
        {notices}
        <LiveRegion regionRef={regionRef} />
        <PwaRegistrar onUpdate={onServiceWorkerUpdate} onReady={onOfflineReady} />
      </div>
    </AnnounceContext.Provider>
  );
}

type RegisterHook = () => {
  needRefresh: [boolean, (value: boolean) => void];
  offlineReady: [boolean, (value: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

function PwaRegistrar({ onUpdate, onReady }: { onUpdate?: (apply: () => void) => void; onReady?: () => void }): JSX.Element | null {
  const [useRegister, setUseRegister] = useState<ComponentType<{
    onUpdate?: (apply: () => void) => void;
    onReady?: () => void;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('virtual:pwa-register/react')
      .then((module: { useRegisterSW: RegisterHook }) => {
        if (!cancelled) setUseRegister(() => RegistrarInner(module.useRegisterSW));
      })
      .catch(() => {
        // No PWA plugin in this build (prerender, tests): registration off.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (useRegister === null) return null;
  const Inner = useRegister;
  return <Inner onUpdate={onUpdate} onReady={onReady} />;
}

function RegistrarInner(useRegisterSW: RegisterHook): ComponentType<{ onUpdate?: (apply: () => void) => void; onReady?: () => void }> {
  return function Registrar({ onUpdate, onReady }: { onUpdate?: (apply: () => void) => void; onReady?: () => void }): JSX.Element | null {
    const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({});
    const [needsRefresh] = needRefresh;
    const [isReady] = offlineReady;
    useEffect(() => {
      if (needsRefresh) onUpdate?.(() => void updateServiceWorker(true));
    }, [needsRefresh, onUpdate, updateServiceWorker]);
    useEffect(() => {
      if (isReady) onReady?.();
    }, [isReady, onReady]);
    return null;
  };
}
