<script setup lang="ts">
  // Cobros esperados por semana según la fecha de vencimiento de lo que está por cobrar.
  import type { SemanaFlujo } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtFecha, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const { estado } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<SemanaFlujo[]>('/cobranza/flujo-proyectado', { sucursal: estado.sucursal }))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  const total = computed(() => filas.value.reduce((s, f) => s + f.monto, 0))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { colors: [tinta.value.texto], fontSize: '11px', fontWeight: 500 },
      formatter: (v: number) => fmtMonedaCorta(v),
    },
    xaxis: { categories: filas.value.map(f => fmtFecha(f.semana).replace(/ \d{4}$/, '')) },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      x: { formatter: (_v: string, o?: { dataPointIndex: number }) => `Semana del ${fmtFecha(filas.value[o?.dataPointIndex ?? 0]?.semana)}` },
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtMoneda(v)} · ${fmtEntero(filas.value[o?.dataPointIndex ?? 0]?.facturas)} facturas`,
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-cash-fast"
    :subtitulo="`${fmtMoneda(total)} por vencer en las próximas semanas`"
    titulo="Flujo de cobro esperado"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="280"
      descripcion="Columnas de cobros esperados por semana"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Por cobrar', data: filas.map(f => f.monto) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
