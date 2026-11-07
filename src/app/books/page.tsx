import { Suspense } from 'react'
import { Spinner } from '@/components/ui'
import BooksExplorer from './BooksExplorer'

export const metadata = { title: 'Libros · NEXUS' }

// BooksExplorer lee ?authorId= con useSearchParams, por eso va dentro de Suspense
export default function BooksPage() {
  return (
    <Suspense fallback={<Spinner label="Cargando libros..." />}>
      <BooksExplorer />
    </Suspense>
  )
}
