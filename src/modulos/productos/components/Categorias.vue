<script setup lang="ts">
  // Peso de cada categoría en la venta (treemap) y su margen.
  import type { Agrupado } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros, opciones: opcionesFiltro } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Agrupado[]>('/categorias', filtros.value))
  const { opciones, series } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  // El color de cada categoría sale de su posición en la lista fija de categorías (no de su ranking).
  function color (categoria: string | undefined): string {
    const lista = opcionesFiltro.value?.categorias ?? []
    return series.value[Math.max(0, lista.indexOf(categoria ?? '')) % series.value.length]!
  }

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'treemap' },
    legend: { show: false },
    colors: filas.value.map(f => color(f.categoria)),
    plotOptions: { treemap: { distributed: true, enableShades: false, borderRadius: 4 } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    dataLabels: {
      enabled: true,
      style: { fontSize: '13px', fontWeight: 600, colors: ['#ffffff'] },
      formatter: (texto: string, o?: { dataPointIndex: number }) => [texto, fmtPct(filas.value[o?.dataPointIndex ?? 0]?.participacion_pct)],
    },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtMoneda(v)} · margen ${fmtPct(filas.value[o?.dataPointIndex ?? 0]?.margen_pct)}`,
      },
    },
  }))

  const encabezados = [
    { title: 'Categoría', key: 'categoria' },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Part.', key: 'participacion_pct', align: 'end' as const },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-shape-outline"
    subtitulo="Tamaño = venta neta"
    titulo="Categorías"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="260"
      descripcion="Treemap de venta neta por categoría"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Venta neta', data: filas.map(f => ({ x: f.categoria, y: f.venta_neta })) }]"
      tipo="treemap"
    />

    <v-data-table
      class="bg-transparent mt-2"
      density="compact"
      :headers="encabezados"
      hide-default-footer
      :items="filas"
      :items-per-page="-1"
    >
      <template #[`item.categoria`]="{ value }">
        <span class="punto" :style="{ background: color(value) }" />{{ value }}
      </template>

      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.participacion_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>

<style scoped>
.punto {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
