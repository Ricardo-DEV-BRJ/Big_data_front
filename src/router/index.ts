/**
 * router/index.ts
 *
 * El panel (/panel/<módulo>) usa PanelLayout y una ruta hija por cada módulo de src/modulos.
 */

import type { Rol } from '@/services/auth'
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import PanelLayout from '@/layouts/PanelLayout.vue'
import { MODULOS } from '@/modulos'
import CambiarPasswordView from '@/pages/CambiarPasswordView.vue'
import LoginView from '@/pages/LoginView.vue'
import { cerrarSesion, inicioPorRol, usuarioActual } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: LoginView, meta: { title: 'Iniciar sesión', publico: true } },
    { path: '/cambiar-password', component: CambiarPasswordView, meta: { title: 'Cambiar contraseña' } },
    { path: '/', redirect: '/panel/ejecutivo' },
    // Ruta anterior del dashboard.
    { path: '/Dashboard', redirect: '/panel/ejecutivo' },
    {
      path: '/panel',
      component: PanelLayout,
      redirect: '/panel/ejecutivo',
      children: MODULOS.map(m => ({
        path: m.ruta,
        name: m.ruta,
        component: m.componente,
        meta: { title: m.titulo, roles: m.roles },
      })),
    },
    { path: '/:pathMatch(.*)*', redirect: '/panel/ejecutivo' },
  ],
})

router.beforeEach(to => {
  const usuario = usuarioActual()
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (!usuario || !token) {
      return true
    }
    return usuario.must_change_password ? '/cambiar-password' : inicioPorRol(usuario.rol)
  }

  if (!usuario || !token) {
    cerrarSesion()
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (usuario.must_change_password && to.path !== '/cambiar-password') {
    return '/cambiar-password'
  }
  if (!usuario.must_change_password && to.path === '/cambiar-password') {
    return inicioPorRol(usuario.rol)
  }

  const roles = to.meta.roles as Rol[] | undefined
  if (roles && !roles.includes(usuario.rol)) {
    return inicioPorRol(usuario.rol)
  }
  return true
})

router.afterEach(to => {
  document.title = to.meta.title ? `${String(to.meta.title)} · AgroData JM` : 'AgroData JM'
})

window.addEventListener('auth:expired', () => {
  void router.replace('/login')
})
window.addEventListener('auth:password-change-required', () => {
  void router.replace('/cambiar-password')
})

export default router
