<script setup lang="ts">
  // Dependencia de los mayores clientes: % de la venta que hacen los top 10, 20, 50 y 100.
  import type { Concentracion } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Concentracion>('/clientes/concentracion'))
  const { opciones, tinta } = useGrafico()

  const c = computed(() => datos.value)
  const valores = computed(() => (c.value ? [c.value.top10_pct, c.value.top20_pct, c.value.top50_pct, c.value.top100_pct] : []))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '50%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 600 },
      formatter: (v: number) => fmtPct(v),
    },
    xaxis: { categories: ['Top 10', 'Top 20', 'Top 50', 'Top 100'] },
    yaxis: { min: 0, max: 100, tickAmount: 4, labels: { formatter: (v: number) => `${v} %` } },
    tooltip: { y: { formatter: (v: number) => `${fmtPct(v)} de la venta neta` } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-pie"
    :subtitulo="c ? `${fmtEntero(c.clientes_80_pct)} de ${fmtEntero(c.clientes)} clientes hacen el 80 % de la venta` : 'Todo el período'"
    titulo="Concentración de clientes"
    :vacio="!c"
    @reintentar="recargar"
  >
    <Grafico
      :alto="280"
      descripcion="Columnas del porcentaje de venta de los mayores clientes"
      :opciones="opcionesGrafico"
      :series="[{ name: '% de la venta', data: valores }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
