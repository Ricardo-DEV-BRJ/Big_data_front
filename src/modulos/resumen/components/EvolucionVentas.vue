<script setup lang="ts">
  // Venta neta y margen por mes (misma unidad, un solo eje).
  import type { PuntoMensual } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<PuntoMensual[]>('/ventas/mensuales', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => Array.isArray(datos.value) ? datos.value : [])
  const series = computed(() => [
    { name: 'Venta neta', data: filas.value.map(m => m.venta_neta) },
    { name: 'Margen bruto', data: filas.value.map(m => m.margen) },
  ])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'area' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 95] } },
    markers: { size: 0, hover: { size: 6 } },
    xaxis: { categories: filas.value.map(m => fmtMes(m.mes)) },
    yaxis: { labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-areaspline"
    subtitulo="Venta neta sin IVA y margen bruto por mes"
    titulo="Evolución de ventas"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico :alto="400" :opciones="opcionesGrafico" :series="series" tipo="area" />
  </TarjetaPanel>
</template>
