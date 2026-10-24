<script setup lang="ts">
  // Clientes activos por mes, separados en nuevos (dados de alta ese mes) y recurrentes.
  import type { NuevosRecurrentes } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<NuevosRecurrentes[]>('/clientes/nuevos-recurrentes', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar', stacked: true },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, borderRadiusWhenStacked: 'last' } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    xaxis: { categories: filas.value.map(f => fmtMes(f.mes)), labels: { rotate: -45 } },
    yaxis: { labels: { formatter: (v: number) => fmtEntero(v) } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => `${fmtEntero(v)} clientes` } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-sync-outline"
    subtitulo="Clientes que compraron cada mes"
    titulo="Nuevos y recurrentes"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="320"
      descripcion="Columnas apiladas de clientes recurrentes y nuevos por mes"
      :opciones="opcionesGrafico"
      :series="[
        { name: 'Recurrentes', data: filas.map(f => f.recurrentes) },
        { name: 'Nuevos', data: filas.map(f => f.nuevos) },
      ]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
