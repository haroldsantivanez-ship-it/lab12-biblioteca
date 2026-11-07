import { Suspense } from 'react'
import { Spinner } from '@/components/ui'
import AuthorDetail from './AuthorDetail'

export const metadata = { title: 'Autor · NEXUS' }

// AuthorDetail lee el [id] con useParams, por eso va dentro de Suspense
export default function AuthorPage() {
  return (
    <Suspense fallback={<Spinner label="Cargando perfil" />}>
      <AuthorDetail />
    </Suspense>
  )
}
