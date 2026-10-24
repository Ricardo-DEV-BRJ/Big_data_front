<script setup lang="ts">
  // Evolución diaria de la tasa de cambio (Bs por USD).
  import type { Monedas, Tasa } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtFecha, fmtMes, fmtVariacion } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Tasa[]>('/tasa-cambio', filtros.value))
  const mensual = useConsulta(() => obtener<Monedas>('/monedas', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  const meses = computed(() => mensual.datos.value?.tasa ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'area' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
    xaxis: { type: 'datetime', labels: { datetimeUTC: true } },
    yaxis: { labels: { formatter: (v: number) => fmtDecimal(Math.round(v)) } },
    tooltip: {
      x: { formatter: (_v: number, o?: { dataPointIndex: number }) => fmtFecha(filas.value[o?.dataPointIndex ?? 0]?.fecha) },
      y: { formatter: (v: number) => `${fmtDecimal(v)} Bs por USD` },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-line"
    subtitulo="Bolívares por dólar, día a día"
    titulo="Tasa de cambio"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="260"
      descripcion="Área de la tasa de cambio diaria"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Tasa', data: filas.map(f => [Date.parse(`${f.fecha}T00:00:00Z`), f.tasa]) }]"
      tipo="area"
    />

    <div class="d-flex flex-wrap ga-2 px-2">
      <v-chip
        v-for="m in meses.slice(-6)"
        :key="m.mes"
        rounded="lg"
        size="small"
        variant="tonal"
      >
        {{ fmtMes(m.mes) }}: <strong class="ms-1">{{ fmtVariacion(m.devaluacion_pct) }}</strong>
      </v-chip>
    </div>
  </TarjetaPanel>
</template>
