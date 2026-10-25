/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

import VueApexCharts from 'vue3-apexcharts'
import router from '../router'
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  app.use(vuetify)
  app.use(router)
  // Registra el componente <apexchart> en toda la aplicación.
  app.use(VueApexCharts)
}
