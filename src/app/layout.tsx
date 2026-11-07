import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavLinks from "@/components/NavLinks";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS · Biblioteca",
  description: "Gestión de autores y libros con Next.js, Prisma y Supabase",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Fondo animado */}
        <div className="space-bg" aria-hidden>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <header className="scan-line sticky top-0 z-40 border-b border-white/5 bg-[#04050d]/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="group flex items-center gap-3">
              <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 font-mono text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(168,85,247,0.9)] transition group-hover:rotate-6">
                N
              </span>
              <span className="leading-tight">
                <span className="block font-mono text-sm font-semibold tracking-[0.25em] text-white">
                  NEXUS
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:block">
                  Biblioteca digital
                </span>
              </span>
            </Link>
            {/* NavLinks usa usePathname, por eso va dentro de Suspense */}
            <Suspense
              fallback={<div className="h-10 w-40 rounded-2xl border border-white/10 bg-white/[0.03]" />}
            >
              <NavLinks />
            </Suspense>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
          Next.js · Prisma · Supabase — Lab 12
        </footer>
      </body>
    </html>
  );
}
