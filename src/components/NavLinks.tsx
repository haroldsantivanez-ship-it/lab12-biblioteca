'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Autores', match: (p: string) => p === '/' || p.startsWith('/authors') },
  { href: '/books', label: 'Libros', match: (p: string) => p.startsWith('/books') },
]

// Menú de navegación con el enlace activo resaltado
export default function NavLinks() {
  const pathname = usePathname()
  return (
    <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
      {LINKS.map((l) => {
        const active = l.match(pathname)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35),0_0_18px_-6px_rgba(34,211,238,0.8)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}
