/*
  Round medallion badges for menu rows (Dustin, 2026-11-12) —
  drawn in code in the family of the tab bar's cloisonné
  medallions: an enamel disc, a gold ring, a cream glyph.
  Shared by the More sheet and the account page's link list.
*/

export type MenuBadgeKind =
  | 'account'
  | 'dahlias'
  | 'gather'
  | 'story'
  | 'volunteer'
  | 'arcade'
  | 'thisorthat'
  | 'give'

const FILLS: Record<MenuBadgeKind, string> = {
  account: '#23362b',
  dahlias: '#9e3d34',
  gather: '#a8842f',
  story: '#54707f',
  volunteer: '#5f7052',
  arcade: '#23362b',
  thisorthat: '#9e3d34',
  give: '#54707f',
}

function Glyph({ kind }: { kind: MenuBadgeKind }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'account':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5.5 19.25c.9-3.1 3.4-4.75 6.5-4.75s5.6 1.65 6.5 4.75" />
        </svg>
      )
    case 'dahlias':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="12" cy="8" rx="1.8" ry="2.9" transform={`rotate(${a} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'gather':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <rect x="5" y="6" width="14" height="13" rx="2" />
          <path d="M5 10.25h14" />
          <path d="M9 4v3M15 4v3" />
          <circle cx="12" cy="14.75" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'story':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <path d="M12 6.75C10.1 5.2 7.6 4.7 5 5v11.75c2.6-.3 5.1.2 7 1.75 1.9-1.55 4.4-2.05 7-1.75V5c-2.6-.3-5.1.2-7 1.75Z" />
          <path d="M12 6.75v11.75" />
        </svg>
      )
    case 'volunteer':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <path d="M12 20.5v-7.25" />
          <path d="M12 13.25c-3.1 0-5.25-2.1-5.25-5.25 3.15 0 5.25 2.15 5.25 5.25Z" />
          <path d="M12 11.25c0-3.15 2.1-5.25 5.25-5.25 0 3.15-2.15 5.25-5.25 5.25Z" />
        </svg>
      )
    case 'arcade':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <circle cx="12" cy="12" r="8.25" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180
            return (
              <circle
                key={a}
                cx={12 + 5.4 * Math.cos(rad)}
                cy={12 + 5.4 * Math.sin(rad)}
                r="0.95"
                fill="currentColor"
                stroke="none"
              />
            )
          })}
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'thisorthat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <path d="M12 20s-7.25-4.6-9.1-9C1.55 8.1 3.3 5 6.35 5c2.05 0 3.6 1.15 5.65 3.35C14.05 6.15 15.6 5 17.65 5 20.7 5 22.45 8.1 21.1 11c-1.85 4.4-9.1 9-9.1 9Z" />
        </svg>
      )
    case 'give':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[19px] w-[19px]" {...common}>
          <rect x="5.5" y="12" width="13" height="8" />
          <rect x="4.5" y="8.5" width="15" height="3.5" />
          <path d="M12 8.5V20" />
          <circle cx="9.4" cy="6.4" r="1.7" />
          <circle cx="14.6" cy="6.4" r="1.7" />
        </svg>
      )
  }
}

export default function MenuBadge({ kind }: { kind: MenuBadgeKind }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[#f7f1de] shadow-[inset_0_0_0_2px_rgba(247,241,222,0.22)] ring-1 ring-[#b08d37]"
      style={{ backgroundColor: FILLS[kind] }}
    >
      <Glyph kind={kind} />
    </span>
  )
}
