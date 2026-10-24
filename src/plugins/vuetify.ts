/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import { es } from 'vuetify/locale'
import { dark_JM, light_JM } from '@/theme/temaJM'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: { locale: 'es', messages: { es } },
  theme: {
    defaultTheme: 'light_JM',
    themes: {
      light_JM,
      dark_JM,
    },
  },
})
