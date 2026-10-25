<script setup lang="ts">
  // Crecimiento de la venta neta contra el mes anterior (escala divergente: sube / baja).
  import type { PuntoMensual } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtVariacion } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<PuntoMensual[]>('/ventas/mensuales', filtros.value))
  const { opciones, series, tinta } = useGrafico()

  // El primer mes no tiene contra qué compararse.
  const filas = computed(() => (datos.value ?? []).filter(f => f.crecimiento_pct !== null))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        colors: { ranges: [{ from: -1000, to: -0.0001, color: series.value[7]! }, { from: 0, to: 1000, color: series.value[0]! }] },
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: { colors: [tinta.value.texto], fontSize: '11px', fontWeight: 500 },
      formatter: (v: number) => fmtVariacion(v),
    },
    xaxis: { categories: filas.value.map(f => fmtMes(f.mes)), labels: { rotate: -45, hideOverlappingLabels: false } },
    yaxis: { labels: { formatter: (v: number) => fmtVariacion(v) } },
    tooltip: { y: { formatter: (v: number) => fmtVariacion(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-swap-vertical"
    subtitulo="Venta neta contra el mes anterior · azul sube, rojo baja"
    titulo="Crecimiento mensual"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="320"
      descripcion="Columnas de crecimiento porcentual mensual"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Crecimiento', data: filas.map(f => f.crecimiento_pct) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
