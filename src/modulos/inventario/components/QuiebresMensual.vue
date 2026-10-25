<script setup lang="ts">
  // Días-producto sin existencia por mes: cuándo fallan las reposiciones.
  import type { InventarioMes } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<InventarioMes[]>('/inventario/mensual', filtros.value))
  const { opciones, series } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    colors: [series.value[1]!],
    plotOptions: { bar: { columnWidth: '55%' } },
    xaxis: { categories: filas.value.map(f => fmtMes(f.mes)), labels: { rotate: -45 } },
    yaxis: { labels: { formatter: (v: number) => fmtEntero(v) } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtEntero(v)} días sin stock · ${fmtEntero(filas.value[o?.dataPointIndex ?? 0]?.productos_con_quiebre)} producto-sucursal afectados`,
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-package-variant-remove"
    subtitulo="Suma de días que cada producto pasó sin existencia en cada sucursal"
    titulo="Quiebres de stock por mes"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="290"
      descripcion="Columnas de días sin existencia por mes"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Días sin stock', data: filas.map(f => f.dias_quiebre) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
