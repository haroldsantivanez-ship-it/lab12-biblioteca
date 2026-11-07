'use client'

import type { ReactNode } from 'react'

// Componentes de interfaz reutilizables — tema futurista (vidrio + neón)

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15),0_0_24px_-6px_rgba(34,211,238,0.6)] disabled:opacity-60'

export function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
        {label}
      </span>
      {children}
    </label>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_0_24px_-6px_rgba(168,85,247,0.8)] hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.9)] hover:brightness-110',
    secondary:
      'border border-white/12 bg-white/[0.04] text-slate-200 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-200',
    danger:
      'border border-rose-400/25 bg-rose-500/[0.06] text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/15 hover:shadow-[0_0_20px_-6px_rgba(244,63,94,0.7)]',
    ghost: 'text-slate-300 hover:bg-white/5 hover:text-cyan-200',
  }[variant]
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${styles} ${className}`}
      {...props}
    />
  )
}

export const linkButtonClass =
  'inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-200'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`glass animate-rise rounded-2xl p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  )
}

export function SectionTitle({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        {children}
      </h2>
      {right}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="glass glow-hover animate-rise group relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl transition group-hover:bg-cyan-400/25" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="neon-text mt-2 font-mono text-3xl font-semibold tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200">
      {children}
    </span>
  )
}

export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300/80">
      <span className="relative h-5 w-5">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)]" />
      </span>
      {label}
    </div>
  )
}

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'success'
  children: ReactNode
}) {
  const style =
    kind === 'error'
      ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
  return (
    <p
      className={`animate-rise rounded-xl border px-4 py-2.5 text-sm backdrop-blur ${style}`}
    >
      {kind === 'error' ? '⚠ ' : '✓ '}
      {children}
    </p>
  )
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-rise max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0a0c1a]/95 p-6 shadow-[0_0_80px_-20px_rgba(168,85,247,0.6)] sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="neon-text text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && (
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
            {kicker}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
