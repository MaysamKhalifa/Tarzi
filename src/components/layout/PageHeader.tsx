'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  rightElement?: React.ReactNode
  transparent?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
  backHref,
  rightElement,
  transparent = false,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) router.push(backHref)
    else router.back()
  }

  return (
    <header
      className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3"
      style={{
        background: transparent ? 'transparent' : 'white',
        borderBottom: transparent ? 'none' : '1px solid #f0f0f0',
      }}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: '#f5f5f5' }}
        >
          <ChevronLeft size={20} color="#1a1a1a" />
        </button>
      )}
      <div className="flex-1">
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#9e9e9e', marginTop: 1 }}>{subtitle}</p>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  )
}
