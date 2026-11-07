// Devuelve el código de error de Prisma (P2002, P2025, ...) si existe
export function prismaCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return undefined
}
