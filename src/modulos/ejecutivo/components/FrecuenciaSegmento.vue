<script setup lang="ts">
  // Frecuencia de compra por segmento RFM: clientes y compras promedio de cada segmento.
  import type { SegmentoRfm } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<SegmentoRfm[]>('/clientes/rfm'))
  const { opciones } = useGrafico()

  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) => (b.frecuencia_promedio ?? 0) - (a.frecuencia_promedio ?? 0)))
  const series = computed(() => [
    { name: 'Compras promedio por cliente', data: filas.value.map(f => f.frecuencia_promedio ?? 0) },
  ])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
    dataLabels: { enabled: true, formatter: (v: number) => fmtDecimal(v) },
    xaxis: { categories: filas.value.map(f => `${f.segmento_rfm} (${fmtEntero(f.clientes)})`) },
    tooltip: { y: { formatter: (v: number) => `${fmtDecimal(v)} compras` } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-clock-outline"
    subtitulo="Compras promedio por cliente en cada segmento RFM (clientes entre paréntesis)"
    titulo="Frecuencia de compra por segmento"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico :alto="320" :opciones="opcionesGrafico" :series="series" tipo="bar" />
  </TarjetaPanel>
</template>
