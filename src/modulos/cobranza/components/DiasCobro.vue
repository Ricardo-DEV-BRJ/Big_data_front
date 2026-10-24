<script setup lang="ts">
  // Días promedio de cobro de las ventas a crédito, mes a mes.
  import type { MesCobranza } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMes, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<MesCobranza[]>('/cobranza/dso', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => (datos.value ?? []).filter(f => f.dias_cobro_promedio !== null))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'line' },
    stroke: { width: 2, curve: 'smooth' },
    markers: { size: 5, strokeWidth: 2, strokeColors: 'rgb(var(--v-theme-surface))', hover: { size: 7 } },
    xaxis: { categories: filas.value.map(f => fmtMes(f.mes)), labels: { rotate: -45 } },
    yaxis: { min: 0, labels: { formatter: (v: number) => `${fmtEntero(v)} d` } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return `${fmtDecimal(v)} días · ${fmtPct(f?.pct_pagadas_con_atraso)} pagadas con atraso`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-timer-sand"
    subtitulo="Por mes de venta · los meses recientes aún tienen facturas sin cobrar"
    titulo="Días de cobro"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="280"
      descripcion="Línea de días promedio de cobro por mes"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Días de cobro', data: filas.map(f => f.dias_cobro_promedio) }]"
      tipo="line"
    />
  </TarjetaPanel>
</template>
