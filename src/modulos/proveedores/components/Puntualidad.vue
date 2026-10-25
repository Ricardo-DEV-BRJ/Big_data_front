<script setup lang="ts">
  // Puntualidad de cada proveedor: % de entregas tardías y días de entrega.
  import type { Proveedor } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Proveedor[]>('/proveedores'))
  const { opciones, series, tinta } = useGrafico()

  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) => (b.pct_entregas_tarde ?? 0) - (a.pct_entregas_tarde ?? 0)))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    colors: [series.value[1]!],
    plotOptions: { bar: { horizontal: true, barHeight: '58%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 500 },
      formatter: (v: number) => fmtPct(v),
    },
    xaxis: {
      categories: filas.value.map(f => f.proveedor),
      min: 0,
      max: Math.max(...filas.value.map(f => f.pct_entregas_tarde ?? 0), 1) * 1.3,
      labels: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { labels: { maxWidth: 200 } },
    grid: { yaxis: { lines: { show: false } } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return `${fmtPct(v)} tardías (${fmtEntero(f?.entregas_tarde)} de ${fmtEntero(f?.ordenes_recibidas)}) · entrega en ${fmtDecimal(f?.dias_entrega_promedio)} días · ${fmtDecimal(f?.dias_retraso_promedio)} días de retraso promedio`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-clock-alert-outline"
    subtitulo="% de órdenes recibidas después de la fecha prometida"
    titulo="Puntualidad de proveedores"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Barras del porcentaje de entregas tardías por proveedor"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Entregas tardías', data: filas.map(f => f.pct_entregas_tarde) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
