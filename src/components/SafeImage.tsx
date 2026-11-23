'use client'

import Image from 'next/image'
import { useState } from 'react'

/*
  A hero painting that can never show the browser's broken-image
  tile (Dustin, 2026-11-13: Safari's blue question-mark tile is
  jarring). The frame always carries a soft blur wash of the
  painting itself; the sharp image fades in over it once loaded.
  If the image ever fails — a dropped connection, a mid-deploy
  moment — the wash simply stays: no glyph, no blue tile, ever.
*/
export function SafeImage({
  src,
  alt,
  width,
  height,
  blurDataURL,
  className = '',
  priority = false,
}: {
  src: string
  alt: string
  width: number
  height: number
  blurDataURL?: string
  className?: string
  priority?: boolean
}) {
  const [state, setState] = useState<'loading' | 'ok' | 'failed'>('loading')
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundColor: '#e9e2cc',
        ...(blurDataURL
          ? {
              backgroundImage: `url(${blurDataURL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
    >
      {state !== 'failed' ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          onLoad={() => setState('ok')}
          onError={() => setState('failed')}
          className="object-cover"
          style={{
            opacity: state === 'ok' ? 1 : 0,
            transition: 'opacity 700ms ease',
          }}
        />
      ) : null}
    </div>
  )
}
