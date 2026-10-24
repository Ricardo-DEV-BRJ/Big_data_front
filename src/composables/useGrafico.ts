/**
 * Estilo común de los gráficos ApexCharts, según el tema claro u oscuro.
 *
 * Paleta categórica (identidad de series), validada para daltonismo en ambos
 * modos. Se asigna siempre en este orden y el color sigue a la entidad, no a su
 * posición: una serie conserva su color aunque un filtro oculte otras.
 * Secuencial (magnitud: mapas de calor, tramos): un solo tono, de claro a oscuro.
 * Estado (bien / atención / grave / crítico): reservado, nunca para series.
 */
import type { ApexOptions } from 'apexcharts'
import { computed } from 'vue'
import { useTheme } from 'vuetify'

export const SERIES_CLARO = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
export const SERIES_OSCURO = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

// Azul de claro a oscuro (pasos 150 … 650).
export const SECUENCIAL = ['#b7d3f6', '#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281']

// Escala ordinal de 5 pasos (p. ej. tramos de antigüedad): de menos a más intensa en cada modo.
const ORDINAL_CLARO = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281']
const ORDINAL_OSCURO = ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4']

export const ESTADO = { bien: '#0ca30c', atencion: '#fab219', grave: '#ec835a', critico: '#d03b3b' }

const TINTA = {
  claro: { texto: '#52514e', suave: '#898781', rejilla: '#e1e0d9', eje: '#c3c2b7', superficie: '#ffffff' },
  oscuro: { texto: '#c3c2b7', suave: '#898781', rejilla: '#2c2c2a', eje: '#383835', superficie: '#1a1a19' },
}

// Textos de ApexCharts en español (meses y días de los ejes de fecha).
const LOCALE_ES = {
  name: 'es',
  options: {
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  },
}

type Objeto = Record<string, unknown>

function esObjeto (v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Mezcla profunda: los arreglos y valores de "extra" reemplazan a los de "base".
export function combinar<T extends Objeto> (base: T, extra: Objeto): T {
  const resultado: Objeto = { ...base }
  for (const [clave, valor] of Object.entries(extra)) {
    const previo = resultado[clave]
    resultado[clave] = esObjeto(previo) && esObjeto(valor) ? combinar(previo, valor) : valor
  }
  return resultado as T
}

export function useGrafico () {
  const tema = useTheme()
  const oscuro = computed(() => tema.current.value.dark)
  const tinta = computed(() => (oscuro.value ? TINTA.oscuro : TINTA.claro))
  const series = computed(() => (oscuro.value ? SERIES_OSCURO : SERIES_CLARO))
  const ordinal = computed(() => (oscuro.value ? ORDINAL_OSCURO : ORDINAL_CLARO))

  const base = computed<ApexOptions>(() => ({
    chart: {
      background: 'transparent',
      foreColor: tinta.value.texto,
      fontFamily: 'Roboto, system-ui, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 400 },
      parentHeightOffset: 0,
      locales: [LOCALE_ES],
      defaultLocale: 'es',
    },
    theme: { mode: oscuro.value ? 'dark' : 'light' },
    colors: series.value,
    grid: {
      borderColor: tinta.value.rejilla,
      strokeDashArray: 0,
      padding: { left: 8, right: 8 },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      labels: { colors: tinta.value.texto },
      markers: { size: 6, shape: 'circle' },
      itemMargin: { horizontal: 10 },
    },
    xaxis: {
      axisBorder: { color: tinta.value.eje },
      axisTicks: { show: false },
      labels: { style: { colors: tinta.value.suave } },
      crosshairs: { stroke: { color: tinta.value.eje } },
    },
    yaxis: { labels: { style: { colors: tinta.value.suave } } },
    tooltip: { theme: oscuro.value ? 'dark' : 'light' },
    states: { hover: { filter: { type: 'darken' } } },
    plotOptions: {
      bar: { borderRadius: 4, borderRadiusApplication: 'end' },
      pie: { donut: { size: '68%' } },
    },
    noData: { text: 'Sin datos para el período' },
  }))

  // Opciones base + las de cada gráfico.
  function opciones (extra: ApexOptions): ApexOptions {
    return combinar(base.value as Objeto, extra as Objeto) as ApexOptions
  }

  return { oscuro, tinta, series, ordinal, opciones }
}
