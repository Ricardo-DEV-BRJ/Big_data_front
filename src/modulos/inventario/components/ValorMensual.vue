<script setup lang="ts">
  // Valor promedio del inventario por mes (capital inmovilizado).
  import type { InventarioMes } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<InventarioMes[]>('/inventario/mensual', filtros.value))
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'area' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: { categories: filas.value.map(f => fmtMes(f.mes)) },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return `${fmtMoneda(v)} · entraron ${fmtEntero(f?.entradas)} u., salieron ${fmtEntero(f?.salidas)} u.`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-areaspline"
    subtitulo="Valor promedio a costo, todas las sucursales elegidas"
    titulo="Valor del inventario"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="290"
      descripcion="Área del valor promedio del inventario por mes"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Valor promedio', data: filas.map(f => f.valor_inventario_promedio) }]"
      tipo="area"
    />
  </TarjetaPanel>
</template>
