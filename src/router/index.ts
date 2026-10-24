/**
 * router/index.ts
 *
 * El panel (/panel/<módulo>) usa PanelLayout y una ruta hija por cada módulo de src/modulos.
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import PanelLayout from '@/layouts/PanelLayout.vue'
import { MODULOS } from '@/modulos'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/panel/resumen' },
    // Ruta anterior del dashboard.
    { path: '/Dashboard', redirect: '/panel/resumen' },
    {
      path: '/panel',
      component: PanelLayout,
      redirect: '/panel/resumen',
      children: MODULOS.map(m => ({
        path: m.ruta,
        name: m.ruta,
        component: m.componente,
        meta: { title: m.titulo },
      })),
    },
    { path: '/:pathMatch(.*)*', redirect: '/panel/resumen' },
  ],
})

router.afterEach(to => {
  document.title = to.meta.title ? `${String(to.meta.title)} · Panel de ventas` : 'Panel de ventas'
})

export default router
