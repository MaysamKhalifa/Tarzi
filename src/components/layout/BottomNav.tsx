'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scissors, ShoppingBag, User, MessageCircle } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { cart } = useApp()
  const { t } = useLanguage()

  const navItems = [
    { href: '/home',    label: t('nav', 'home'),    icon: Home },
    { href: '/tailors', label: t('nav', 'tailors'), icon: Scissors },
    { href: '/chat',    label: t('nav', 'chat'),    icon: MessageCircle },
    { href: '/bag',     label: t('nav', 'bag'),     icon: ShoppingBag },
    { href: '/profile', label: t('nav', 'profile'), icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isBag = href === '/bag'
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all"
              style={{ color: isActive ? '#e91e8c' : '#9e9e9e', minWidth: 52 }}>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isBag && cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ background: '#e91e8c', fontSize: 10, fontWeight: 700 }}>
                    {cart.length}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
