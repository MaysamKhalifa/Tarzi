'use client'

import { useLanguage } from '@/lib/context/LanguageContext'
import type { Language } from '@/lib/i18n'

const LANGS: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'ar', label: 'Arabic', native: 'ع' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
]

interface Props {
  userId?: string
  compact?: boolean
}

export default function LanguageSelector({ userId, compact = false }: Props) {
  const { lang, setLanguage } = useLanguage()

  if (compact) {
    return (
      <div className="flex gap-1">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code, userId)}
            className="w-9 h-9 rounded-xl font-bold text-xs transition-all"
            style={{
              background: lang === l.code ? '#e91e8c' : '#f5f5f5',
              color: lang === l.code ? 'white' : '#555',
            }}
            title={l.label}
          >
            {l.native}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code, userId)}
          className="flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
          style={{
            border: `2px solid ${lang === l.code ? '#e91e8c' : '#e8e8e8'}`,
            background: lang === l.code ? '#fce4ec' : 'white',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: lang === l.code ? '#e91e8c' : '#1a1a1a' }}>
            {l.label}
          </span>
          <span style={{ fontSize: 16, color: lang === l.code ? '#e91e8c' : '#9e9e9e' }}>
            {l.native}
          </span>
        </button>
      ))}
    </div>
  )
}
