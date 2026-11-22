'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
}

export default function StarRating({ value, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          style={{ cursor: interactive ? 'pointer' : 'default', lineHeight: 0, padding: interactive ? 2 : 0 }}
        >
          <Star
            size={size}
            color={i <= Math.round(value) ? '#f5a623' : '#e0e0e0'}
            fill={i <= Math.round(value) ? '#f5a623' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}
