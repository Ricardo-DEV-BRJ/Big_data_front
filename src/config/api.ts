import axios from 'axios'

interface SesionGuardada {
  must_change_password?: boolean
}

function notificarCambioDeSesion (evento: string) {
  window.dispatchEvent(new CustomEvent(evento))
}

export async function apiCall (endpoint = '', data: unknown = {}, method = 'GET') {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    return await axios.request({
      url: `${import.meta.env.VITE_API_URL}${endpoint}`,
      method,
      headers,
      data,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const respuesta = error.response?.data as { must_change_password?: boolean } | undefined

      if (status === 401 && endpoint !== 'auth/login') {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        notificarCambioDeSesion('auth:expired')
      } else if (status === 403 && respuesta?.must_change_password) {
        const usuario = localStorage.getItem('usuario')
        if (usuario) {
          try {
            const sesion = JSON.parse(usuario) as SesionGuardada
            localStorage.setItem('usuario', JSON.stringify({ ...sesion, must_change_password: true }))
          } catch {
            localStorage.removeItem('usuario')
          }
        }
        notificarCambioDeSesion('auth:password-change-required')
      }
    }
    throw error
  }
}
