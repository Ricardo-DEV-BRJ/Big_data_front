<script setup lang="ts">
  // Rotación del inventario y venta perdida de cada sucursal.
  import type { InventarioSucursal } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMonedaCorta } from '@/utils/formato'

  // Siempre todas las sucursales, para compararlas.
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<InventarioSucursal[]>('/inventario/resumen'))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) => (b.rotacion ?? 0) - (a.rotacion ?? 0)))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '58%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 500 },
      formatter: (v: number, o?: { dataPointIndex: number }) => `${fmtDecimal(v)}× · ${fmtEntero(filas.value[o?.dataPointIndex ?? 0]?.dias_inventario)} días`,
    },
    xaxis: {
      categories: filas.value.map(f => f.sucursal),
      min: 0,
      max: Math.max(...filas.value.map(f => f.rotacion ?? 0), 1) * 1.5,
      labels: { show: false },
      axisBorder: { show: false },
    },
    grid: { yaxis: { lines: { show: false } } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return `${fmtDecimal(v)} veces · ${fmtEntero(f?.productos_con_quiebre)} productos con quiebre · venta perdida ${fmtMonedaCorta(f?.venta_perdida_usd)}`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-sync"
    subtitulo="Veces que se vendió el inventario promedio y días que dura · todo el período"
    titulo="Rotación por sucursal"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="290"
      descripcion="Barras de rotación de inventario por sucursal"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Rotación', data: filas.map(f => f.rotacion) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
