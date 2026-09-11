import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../lib/api'

/** Guard de UI: evita mostrar el panel sin token. La seguridad real la
 *  impone el backend, que valida el JWT en cada request. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/admin/login" replace />
}
