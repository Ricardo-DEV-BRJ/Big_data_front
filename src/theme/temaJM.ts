/**
 * Temas claro y oscuro de la aplicación. Los colores de los gráficos
 * (paleta categórica validada para daltonismo en ambos modos) están en
 * src/composables/useGrafico.ts y siguen estos mismos tonos.
 */
const light_JM = {
  dark: false,
  colors: {
    'background': '#f3f3f1',
    'surface': '#ffffff',
    'primary': '#0ca30c',
    'secondary': '#52514e',
    'segundo': '#D92026',
    'success': '#0ca30c',
    'warning': '#fab219',
    'error': '#d03b3b',
    'info': '#2a78d6',
    'on-background': '#0b0b0b',
    'on-surface': '#0b0b0b',
  },
}

const dark_JM = {
  dark: true,
  colors: {
    'background': '#0d0d0d',
    'surface': '#1a1a19',
    'primary': '#0ca30c',
    'secondary': '#c3c2b7',
    'segundo': '#8fe8b5',
    'success': '#0ca30c',
    'warning': '#fab219',
    'error': '#d03b3b',
    'info': '#3987e5',
    'on-background': '#f0efec',
    'on-surface': '#f0efec',
  },
}

export {
  dark_JM,
  light_JM,
}
