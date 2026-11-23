'use client'

import { useEffect, useRef, useState } from 'react'

/*
  The Seasons butterflies, second edition (Dustin, 2026-11-13):
  pressing the Seasons tab releases a flight of painterly
  butterflies — real colourways (monarch, morpho, swallowtail,
  painted lady…) drawn as little paintings: gradient wings with
  dark borders, veins, border spots and hindwing eyespots. They
  flutter up the screen on fresh randomised paths and are gone
  in seconds. Compositor-only motion (transform/opacity), nodes
  removed after each flight, and nothing at all for visitors
  who prefer reduced motion.
*/

interface Palette {
  name: string
  light: string
  deep: string
  border: string
  spot: string
}

const PALETTES: Palette[] = [
  { name: 'Monarch', light: '#f9c04a', deep: '#e25822', border: '#2b2118', spot: '#fff5e6' },
  { name: 'Blue morpho', light: '#aee3ff', deep: '#2456c8', border: '#14264f', spot: '#dff2ff' },
  { name: 'Swallowtail', light: '#ffe066', deep: '#e0a100', border: '#33302a', spot: '#fffbe8' },
  { name: 'Purple emperor', light: '#d9b8ff', deep: '#5e2b97', border: '#241531', spot: '#ffffff' },
  { name: 'Painted lady', light: '#ffd1dc', deep: '#c94f6d', border: '#402028', spot: '#ffffff' },
  { name: 'Red admiral', light: '#ff9a5c', deep: '#b3231b', border: '#1f1512', spot: '#ffffff' },
  { name: 'Green hairstreak', light: '#c8f169', deep: '#3d9970', border: '#1e3325', spot: '#fffbe8' },
  { name: 'Holly blue', light: '#d6e9ff', deep: '#7aa5d2', border: '#2c3e50', spot: '#ffffff' },
]

interface Fly {
  id: number
  palette: number
  size: number
  xOff: number
  delay: number
  dur: number
  drift: number
  sway: number
  flap: number
}

let nextId = 1

function makeBatch(count: number): Fly[] {
  const flies: Fly[] = []
  for (let i = 0; i < count; i++) {
    flies.push({
      id: nextId++,
      palette: Math.floor(Math.random() * PALETTES.length),
      size: 23 + Math.random() * 13,
      xOff: (Math.random() - 0.5) * 160,
      delay: Math.random() * 420,
      dur: 3600 + Math.random() * 1800,
      drift: (Math.random() - 0.5) * 200,
      sway: 24 + Math.random() * 48,
      flap: 0.19 + Math.random() * 0.16,
    })
  }
  return flies
}

/** One painted wing pair (left), mirrored for the right. */
function WingSide({ gid, p }: { gid: string; p: Palette }) {
  return (
    <g>
      {/* Forewing */}
      <path
        d="M31 21 C25 7 11 1 5.5 7.5 C1.5 12.5 6 20 14.5 23.5 C21 26 27.5 25.5 31 24.5 Z"
        fill={`url(#${gid})`}
        stroke={p.border}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Hindwing with a small swallowtail point */}
      <path
        d="M31 25.5 C23 24.5 11.5 26.5 9.5 33.5 C8.6 36.8 6.8 39.5 4.8 41.6 C7.4 41.8 9.8 41 11.6 39.6 C13.5 43.4 19 44.8 24 42.8 C28.5 41 30.8 36.5 31 32 Z"
        fill={`url(#${gid})`}
        stroke={p.border}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Veins */}
      <path d="M30 22.5 C23 16 15 11 8.5 9.5 M30 23.5 C22 20 13 18.5 7 19 M30 27 C23 28 16 30.5 12 34.5" stroke="rgba(30,20,10,0.20)" strokeWidth="0.8" fill="none" />
      {/* Border spots */}
      <circle cx="9" cy="11.5" r="1.5" fill={p.spot} opacity="0.95" />
      <circle cx="7.6" cy="17.5" r="1.3" fill={p.spot} opacity="0.95" />
      <circle cx="12.5" cy="21.5" r="1.1" fill={p.spot} opacity="0.9" />
      <circle cx="13.5" cy="37.5" r="1.2" fill={p.spot} opacity="0.9" />
      {/* Hindwing eyespot */}
      <circle cx="17.5" cy="33" r="2.3" fill={p.border} opacity="0.85" />
      <circle cx="17.5" cy="33" r="0.9" fill={p.spot} />
    </g>
  )
}

function ButterflySvg({ fly }: { fly: Fly }) {
  const p = PALETTES[fly.palette]
  const gid = `bfly-${fly.id}`
  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" className="block h-full w-full">
      <defs>
        <linearGradient id={gid} x1="0.85" y1="0.15" x2="0.1" y2="0.9">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="100%" stopColor={p.deep} />
        </linearGradient>
      </defs>
      <WingSide gid={gid} p={p} />
      <g transform="translate(64 0) scale(-1 1)">
        <WingSide gid={gid} p={p} />
      </g>
      {/* Antennae */}
      <path d="M30.8 15.5 Q26 7.5 20.5 5.5 M33.2 15.5 Q38 7.5 43.5 5.5" stroke="#2e2620" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="20.2" cy="5.4" r="1.4" fill="#2e2620" />
      <circle cx="43.8" cy="5.4" r="1.4" fill="#2e2620" />
      {/* Body + head */}
      <ellipse cx="32" cy="27" rx="2.3" ry="9.5" fill="#2e2620" />
      <ellipse cx="32" cy="27" rx="1" ry="8" fill="#4a3d31" opacity="0.7" />
      <circle cx="32" cy="17" r="2.5" fill="#2e2620" />
    </svg>
  )
}

function Flyer({ fly, vh }: { fly: Fly; vh: number }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const steps = 9
    const frames: Keyframe[] = []
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const x = fly.drift * t + Math.sin(t * Math.PI * 3.1 + fly.id) * fly.sway * (1 - t * 0.45)
      const y = -vh * 0.88 * t
      const rot = Math.sin(t * Math.PI * 3.1 + fly.id) * 16
      frames.push({
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        opacity: t < 0.12 ? String(t / 0.12) : t > 0.78 ? String(1 - (t - 0.78) / 0.22) : '1',
        offset: t,
      })
    }
    const anim = el.animate(frames, {
      duration: fly.dur,
      delay: fly.delay,
      easing: 'ease-out',
      fill: 'both',
    })
    return () => anim.cancel()
  }, [fly, vh])

  return (
    <div
      ref={ref}
      className="absolute opacity-0"
      style={{
        left: `calc(50% + ${fly.xOff}px)`,
        bottom: '104px',
        width: fly.size,
        height: fly.size * 0.75,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          animation: `hues-butterfly-flap ${fly.flap}s ease-in-out infinite`,
          filter: 'drop-shadow(0 2px 3px rgba(46, 54, 32, 0.25))',
        }}
      >
        <ButterflySvg fly={fly} />
      </div>
    </div>
  )
}

export function ButterflyLayer({ burstKey }: { burstKey: number }) {
  const [flies, setFlies] = useState<Fly[]>([])
  const [vh, setVh] = useState(800)

  useEffect(() => {
    if (burstKey === 0) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    setVh(window.innerHeight)
    const batch = makeBatch(16)
    setFlies((cur) => [...cur.slice(-28), ...batch])
    const t = setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id))
      setFlies((cur) => cur.filter((f) => !ids.has(f.id)))
    }, 6400)
    return () => clearTimeout(t)
  }, [burstKey])

  if (!flies.length) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
      <style>{`@keyframes hues-butterfly-flap { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.46); } }`}</style>
      {flies.map((f) => (
        <Flyer key={f.id} fly={f} vh={vh} />
      ))}
    </div>
  )
}
