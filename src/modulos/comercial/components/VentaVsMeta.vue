<script setup lang="ts">
  // Venta neta de cada vendedor frente a su meta del período (misma unidad: barras agrupadas).
  import type { Vendedor } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Vendedor[]>('/vendedores', filtros.value))
  const { opciones, series, tinta } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    colors: [series.value[0]!, tinta.value.eje],
    plotOptions: { bar: { horizontal: true, barHeight: '70%' } },
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: filas.value.map(f => f.vendedor), labels: { formatter: (v: string) => fmtMonedaCorta(Number(v)) } },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v: number) => fmtMoneda(v) },
      x: {
        formatter: (_v: string, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return f ? `${f.vendedor} · ${f.sucursal} · ${fmtPct(f.cumplimiento_pct)} de la meta` : ''
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-tie-outline"
    subtitulo="Venta neta sin IVA contra la meta de los meses del período"
    titulo="Vendedores: venta y meta"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="Math.max(320, filas.length * 34 + 70)"
      descripcion="Barras agrupadas de venta y meta por vendedor"
      :opciones="opcionesGrafico"
      :series="[
        { name: 'Venta neta', data: filas.map(f => f.venta_neta) },
        { name: 'Meta', data: filas.map(f => f.meta ?? 0) },
      ]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
