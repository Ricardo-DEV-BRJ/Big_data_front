<script setup lang="ts">
  // Venta neta por sucursal (barras horizontales, ordenadas de mayor a menor).
  import type { Sucursal } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { rango } = useFiltros()
  // Siempre todas las sucursales, para compararlas entre sí.
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Sucursal[]>('/sucursales', rango.value))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => Array.isArray(datos.value) ? datos.value : [])
  const seriesGrafico = computed(() => [{ name: 'Venta neta', data: filas.value.map(f => f.venta_neta) }])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '58%', dataLabels: { position: 'top' } } },
    // Participación como etiqueta directa al final de cada barra.
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: { colors: [tinta.value.texto], fontWeight: 500, fontSize: '12px' },
      formatter: (v: number, o?: { dataPointIndex: number }) => `${fmtMonedaCorta(v)} · ${fmtPct(filas.value[o?.dataPointIndex ?? 0]?.participacion_pct)}`,
    },
    // Los montos van como etiqueta en cada barra; el eje de valores se oculta.
    xaxis: {
      categories: filas.value.map(f => f.sucursal),
      min: 0,
      max: Math.max(...filas.value.map(f => f.venta_neta), 0) * 1.45,
      labels: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-store-outline"
    subtitulo="Venta neta y participación de cada sucursal"
    titulo="Ventas por sucursal"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Barras horizontales de venta neta por sucursal"
      :opciones="opcionesGrafico"
      :series="seriesGrafico"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
