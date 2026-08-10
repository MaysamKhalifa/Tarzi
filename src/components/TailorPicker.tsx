'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Scissors, Check, Search, X } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

/* ── Real tailor shape from profiles table ── */
export interface RealTailor {
  id: string
  full_name: string | null
  shop_name: string | null
  area: string | null
  city: string | null
  avatar_url: string | null
}

export function tailorDisplayName(t: RealTailor): string {
  return t.shop_name || t.full_name || 'Tailor'
}

/* ── Searchable Tailor Picker ── */
export default function TailorPicker({
  value,
  tailors,
  loading,
  onChange,
}: {
  value: string
  tailors: RealTailor[]
  loading: boolean
  onChange: (id: string, name: string) => void
}) {
  const { t } = useLanguage()
  const selected = tailors.find(tl => tl.id === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = tailors.filter(tl =>
    query === '' ||
    tailorDisplayName(tl).toLowerCase().includes(query.toLowerCase()) ||
    (tl.area ?? '').toLowerCase().includes(query.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #e8e8e8',
    background: '#fafafa',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger row */}
      <div
        onClick={() => { if (!loading) { setOpen(o => !o); setQuery('') } }}
        className="flex items-center justify-between cursor-pointer"
        style={{ ...inputStyle, paddingRight: 40, color: selected ? '#1a1a1a' : '#9e9e9e' }}
      >
        <span>
          {loading
            ? t('booking', 'loading_tailors')
            : selected
              ? `${tailorDisplayName(selected)}${selected.area ? ` – ${selected.area}` : ''}`
              : t('booking', 'any_tailor')}
        </span>
        <ChevronDown
          size={16}
          color="#9e9e9e"
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 rounded-2xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #f0f0f0' }}
        >
          {/* Search input */}
          <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #f5f5f5' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#f5f5f5' }}>
              <Search size={14} color="#9e9e9e" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('booking', 'search_tailor_placeholder')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ fontSize: 13, color: '#1a1a1a' }}
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={12} color="#9e9e9e" />
                </button>
              )}
            </div>
          </div>

          {/* Option list */}
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {/* "Any tailor" option */}
            <button
              onClick={() => { onChange('', ''); setOpen(false) }}
              className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-gray-50"
              style={{ borderBottom: '1px solid #f9f9f9' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#f5f5f5' }}>
                <Scissors size={14} color="#9e9e9e" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: value === '' ? '#e91e8c' : '#1a1a1a' }}>
                  {t('booking', 'any_tailor')}
                </p>
                <p style={{ fontSize: 11, color: '#9e9e9e' }}>{t('booking', 'any_tailor_desc')}</p>
              </div>
              {value === '' && <Check size={14} color="#e91e8c" className="ml-auto flex-shrink-0" />}
            </button>

            {filtered.length === 0 && !loading && (
              <p style={{ fontSize: 13, color: '#9e9e9e', padding: '16px', textAlign: 'center' }}>{t('booking', 'no_tailors_found')}</p>
            )}

            {filtered.map(tl => (
              <button
                key={tl.id}
                onClick={() => { onChange(tl.id, tailorDisplayName(tl)); setOpen(false) }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-gray-50"
                style={{ borderBottom: '1px solid #f9f9f9' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: '#fce4ec' }}>
                  {tl.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={tl.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Scissors size={14} color="#e91e8c" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: value === tl.id ? '#e91e8c' : '#1a1a1a' }}>
                    {tailorDisplayName(tl)}
                  </p>
                  <p style={{ fontSize: 11, color: '#9e9e9e' }}>
                    {[tl.area, tl.city].filter(Boolean).join(', ') || 'Dubai'}
                  </p>
                </div>
                {value === tl.id && <Check size={14} color="#e91e8c" className="flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
