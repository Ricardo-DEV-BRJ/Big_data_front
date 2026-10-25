<script setup lang="ts">
  // Participación de dólares y bolívares en lo facturado cada mes (columnas al 100 %).
  import type { Monedas } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtMoneda } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Monedas>('/monedas', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value?.por_mes ?? [])
  const meses = computed(() => [...new Set(filas.value.map(f => f.mes))])
  const valor = (mes: string, moneda: string) => filas.value.find(f => f.mes === mes && f.moneda === moneda)?.total ?? 0

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar', stacked: true, stackType: '100%' },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 0 } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    xaxis: { categories: meses.value.map(m => fmtMes(m)), labels: { rotate: -45 } },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)} %` } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-cash-sync"
    subtitulo="% de lo facturado que se cobró en cada moneda"
    titulo="Dólares y bolívares"
    :vacio="meses.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Columnas al 100 % de facturación en dólares y bolívares por mes"
      :opciones="opcionesGrafico"
      :series="[
        { name: 'Dólares (USD)', data: meses.map(m => valor(m, 'USD')) },
        { name: 'Bolívares (VES)', data: meses.map(m => valor(m, 'VES')) },
      ]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
