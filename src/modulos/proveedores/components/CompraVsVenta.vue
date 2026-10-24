<script setup lang="ts">
  // Lo comprado a cada proveedor frente a lo que venden sus productos y el margen que dejan.
  import type { Proveedor } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Proveedor[]>('/proveedores'))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '60%' } },
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: filas.value.map(f => f.proveedor.split(' ')), labels: { trim: false } },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v: number) => fmtMoneda(v) },
      x: {
        formatter: (_v: string, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return f ? `${f.proveedor} · margen de sus productos ${fmtPct(f.margen_pct)}` : ''
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-scale-unbalanced"
    subtitulo="Monto comprado, venta neta y margen de sus productos · todo el período"
    titulo="Compras, ventas y margen"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Columnas agrupadas de compras, ventas y margen por proveedor"
      :opciones="opcionesGrafico"
      :series="[
        { name: 'Comprado', data: filas.map(f => f.monto_comprado) },
        { name: 'Venta neta', data: filas.map(f => f.venta_neta) },
        { name: 'Margen', data: filas.map(f => f.margen) },
      ]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
