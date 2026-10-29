import { apiCall } from '@/config/api'

// Roles de la Tabla 18 (mismo valor que usuarios.rol en la API).
export type Rol = 'gerente' | 'administracion' | 'vendedor' | 'almacen' | 'administrador'

export const ETIQUETAS_ROL: Record<Rol, string> = {
  gerente: 'Gerencia',
  administracion: 'Administración',
  vendedor: 'Ventas',
  almacen: 'Almacén',
  administrador: 'Soporte TI',
}

// Mismos grupos que config/roles.js del backend.
export const GRUPOS: Record<'comercial' | 'finanzas' | 'operaciones' | 'direccion' | 'sistema', Rol[]> = {
  comercial: ['vendedor', 'gerente', 'administracion', 'administrador'],
  finanzas: ['gerente', 'administracion', 'administrador'],
  operaciones: ['gerente', 'almacen', 'administrador'],
  direccion: ['gerente', 'administrador'],
  sistema: ['administrador'],
}

export interface UsuarioSesion {
  id: number
  email: string
  rol: Rol
  must_change_password: boolean
}

interface RespuestaLogin {
  token: string
  usuario: UsuarioSesion
}

export function usuarioActual (): UsuarioSesion | null {
  const guardado = localStorage.getItem('usuario')
  if (!guardado) {
    return null
  }

  try {
    return JSON.parse(guardado) as UsuarioSesion
  } catch {
    cerrarSesion()
    return null
  }
}

export function guardarSesion (token: string, usuario: UsuarioSesion) {
  localStorage.setItem('token', token)
  localStorage.setItem('usuario', JSON.stringify(usuario))
}

export function cerrarSesion () {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export function inicioPorRol (rol: Rol) {
  const inicio: Record<Rol, string> = {
    gerente: '/panel/ejecutivo',
    administrador: '/panel/ejecutivo',
    administracion: '/panel/pagos',
    vendedor: '/panel/ventas',
    almacen: '/panel/inventario',
  }
  return inicio[rol] ?? '/login'
}

export async function iniciarSesion (email: string, password: string) {
  const respuesta = await apiCall('auth/login', { email, password }, 'POST') as { data: RespuestaLogin }
  guardarSesion(respuesta.data.token, respuesta.data.usuario)
  return respuesta.data.usuario
}

export async function actualizarPassword (passwordActual: string | undefined, passwordNuevo: string) {
  const respuesta = await apiCall('auth/change-password', {
    password_actual: passwordActual,
    password_nuevo: passwordNuevo,
  }, 'POST') as { data: { token: string } }
  const usuario = usuarioActual()
  if (!usuario) {
    throw new Error('La sesión no está disponible')
  }
  guardarSesion(respuesta.data.token, { ...usuario, must_change_password: false })
  return { ...usuario, must_change_password: false }
}
