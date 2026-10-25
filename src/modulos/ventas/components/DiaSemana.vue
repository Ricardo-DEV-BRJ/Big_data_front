<script setup lang="ts">
  // Venta neta promedio por día de la semana.
  import type { DiaSemana } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { DIAS_SEMANA, fmtEntero, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<DiaSemana[]>('/ventas/dia-semana', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '55%' } },
    xaxis: { categories: filas.value.map(f => DIAS_SEMANA[f.dia_semana - 1]!.slice(0, 3)) },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      x: { formatter: (_v: string, o?: { dataPointIndex: number }) => DIAS_SEMANA[(filas.value[o?.dataPointIndex ?? 0]?.dia_semana ?? 1) - 1]! },
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtMoneda(v)} por día · ${fmtEntero(filas.value[o?.dataPointIndex ?? 0]?.transacciones_promedio_dia)} ventas`,
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-calendar-week-outline"
    subtitulo="Venta neta promedio de cada día"
    titulo="Día de la semana"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="290"
      descripcion="Columnas de venta promedio por día de la semana"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Venta neta promedio', data: filas.map(f => f.venta_neta_promedio_dia) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
