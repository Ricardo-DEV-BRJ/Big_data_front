<script setup lang="ts">
  // Unidades vendidas por mes frente a la previsión (promedio móvil de 3 meses y
  // suavizamiento exponencial simple). El último punto es el pronóstico del mes siguiente.
  import type { Prevision } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes, fmtPct } from '@/utils/formato'

  const categoria = ref<string | null>(null)
  const { opciones: opcionesFiltro } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Prevision>('/prevision', { categoria: categoria.value, limite: 1 }),
    () => categoria.value,
  )
  const { opciones } = useGrafico()

  const serie = computed(() => datos.value?.serie ?? [])
  const series = computed(() => [
    { name: 'Real', type: 'column', data: serie.value.map(s => s.unidades_reales) },
    { name: 'Promedio móvil (3 meses)', type: 'line', data: serie.value.map(s => s.promedio_movil) },
    { name: 'Suavizamiento exponencial', type: 'line', data: serie.value.map(s => s.suavizamiento) },
  ])

  const subtitulo = computed(() => {
    const d = datos.value
    if (!d) return 'Unidades por mes'
    return `MAPE promedio móvil ${fmtPct(d.mape_promedio_movil)} · suavizamiento ${fmtPct(d.mape_suavizamiento)} · último mes = pronóstico`
  })

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'line' },
    stroke: { width: [0, 3, 3], curve: 'smooth', dashArray: [0, 0, 5] },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
    markers: { size: [0, 3, 3] },
    xaxis: { categories: serie.value.map(s => fmtMes(s.mes) + (s.pronostico ? ' (prev.)' : '')) },
    yaxis: { labels: { formatter: (v: number) => fmtEntero(v) } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number | null) => (v === null || v === undefined ? '—' : `${fmtEntero(v)} unid.`) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-timeline-variant"
    :subtitulo="subtitulo"
    titulo="Ventas vs. previsión"
    :vacio="serie.length === 0"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-select
        v-model="categoria"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="opcionesFiltro?.categorias ?? []"
        label="Categoría"
        variant="outlined"
      />
    </template>

    <Grafico :alto="360" :opciones="opcionesGrafico" :series="series" tipo="line" />
  </TarjetaPanel>
</template>

<style scoped>
.filtro {
  width: 210px;
}
</style>
