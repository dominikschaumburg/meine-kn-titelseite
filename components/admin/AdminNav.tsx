'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/settings', label: 'Einstellungen' },
    { href: '/admin/templates', label: 'Templates' },
  ]

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Meine Titelseite</h1>
        <p className="text-sm text-gray-500 mt-1">Adminbereich</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={logout}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Abmelden
        </button>
      </div>
    </nav>
  )
}
