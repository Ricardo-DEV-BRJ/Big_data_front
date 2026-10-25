<script setup lang="ts">
  // Antigüedad de la cartera: cuánto está por vencer y cuánto lleva 1-30, 31-60, 61-90 o más de 90 días vencido.
  import type { Antiguedad } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { estado } = useFiltros()
  // Es una foto a la fecha de corte: solo se filtra por sucursal.
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Antiguedad>('/cobranza/antiguedad', { sucursal: estado.sucursal }))
  const { opciones, ordinal, tinta } = useGrafico()

  const tramos = computed(() => datos.value?.tramos ?? [])
  const nombre = (t: string) => (t === 'Por vencer' || t === 'Más de 90' ? t : `${t} días`)

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    colors: tramos.value.map(t => ordinal.value[t.orden_tramo - 1]!),
    plotOptions: { bar: { distributed: true, columnWidth: '55%', dataLabels: { position: 'top' } } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 600 },
      formatter: (_v: number, o?: { dataPointIndex: number }) => fmtPct(tramos.value[o?.dataPointIndex ?? 0]?.pct),
    },
    xaxis: { categories: tramos.value.map(t => nombre(t.tramo)) },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtMoneda(v)} · ${fmtEntero(tramos.value[o?.dataPointIndex ?? 0]?.facturas)} facturas`,
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-calendar-alert"
    subtitulo="Saldo pendiente según los días de vencido"
    titulo="Antigüedad de la cartera"
    :vacio="tramos.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Columnas del saldo por cobrar por tramo de antigüedad"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Por cobrar', data: tramos.map(t => t.monto) }]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
