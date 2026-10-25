<script setup lang="ts">
  // Top de productos por venta neta, unidades o margen, con filtro de categoría.
  import type { Producto } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  type Orden = 'ingreso' | 'unidades' | 'margen'
  const MEDIDAS: Record<Orden, { titulo: string, campo: 'venta_neta' | 'unidades' | 'margen' }> = {
    ingreso: { titulo: 'Venta neta', campo: 'venta_neta' },
    unidades: { titulo: 'Unidades', campo: 'unidades' },
    margen: { titulo: 'Margen', campo: 'margen' },
  }

  const orden = ref<Orden>('ingreso')
  const categoria = ref<string | null>(null)
  const { filtros, opciones: opcionesFiltro } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Producto[]>('/productos', { ...filtros.value, orden: orden.value, categoria: categoria.value, limite: 10 }),
    () => [orden.value, categoria.value],
  )
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  const medida = computed(() => MEDIDAS[orden.value])
  const valores = computed(() => filas.value.map(f => f[medida.value.campo]))
  const formato = (v: number) => (orden.value === 'unidades' ? fmtEntero(v) : fmtMonedaCorta(v))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '62%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: { colors: [tinta.value.texto], fontWeight: 500, fontSize: '12px' },
      formatter: (v: number) => formato(v),
    },
    xaxis: {
      categories: filas.value.map(f => f.producto),
      min: 0,
      max: Math.max(...valores.value, 0) * 1.25,
      labels: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { labels: { maxWidth: 220, style: { fontSize: '12px' } } },
    grid: { yaxis: { lines: { show: false } } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const p = filas.value[o?.dataPointIndex ?? 0]
          const texto = orden.value === 'unidades' ? `${fmtEntero(v)} unidades` : fmtMoneda(v)
          return `${texto} · margen ${fmtPct(p?.margen_pct)} · ${p?.categoria ?? ''}`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-podium"
    :subtitulo="`Top 10 por ${medida.titulo.toLowerCase()}`"
    titulo="Ranking de productos"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-select
        v-model="categoria"
        class="selector"
        clearable
        density="compact"
        hide-details
        :items="opcionesFiltro?.categorias ?? []"
        label="Categoría"
        variant="outlined"
      />

      <v-btn-toggle
        v-model="orden"
        color="primary"
        density="compact"
        mandatory
        rounded="lg"
        variant="outlined"
      >
        <v-btn size="small" value="ingreso">Venta</v-btn>
        <v-btn size="small" value="unidades">Unidades</v-btn>
        <v-btn size="small" value="margen">Margen</v-btn>
      </v-btn-toggle>
    </template>

    <Grafico
      :alto="400"
      descripcion="Barras horizontales del top 10 de productos"
      :opciones="opcionesGrafico"
      :series="[{ name: medida.titulo, data: valores }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>

<style scoped>
.selector {
  width: 190px;
}
</style>
