<script setup lang="ts">
  // Retención por cohorte: de los clientes dados de alta cada mes, qué % sigue comprando después.
  import type { Cohorte } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { SECUENCIAL, useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Cohorte[]>('/clientes/cohortes'))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  const cohortes = computed(() => [...new Set(filas.value.map(f => f.cohorte))])
  const maxMeses = computed(() => Math.max(...filas.value.map(f => f.meses_desde_alta), 0))

  // Una fila por cohorte (la más reciente abajo) y una columna por meses desde el alta.
  const series = computed(() => [...cohortes.value].toReversed().map(c => ({
    name: `${fmtMes(c)} (${fmtEntero(filas.value.find(f => f.cohorte === c)?.clientes_cohorte)})`,
    data: Array.from({ length: maxMeses.value + 1 }, (_, m) => {
      const celda = filas.value.find(f => f.cohorte === c && f.meses_desde_alta === m)
      // -1 = mes que todavía no ocurre para esa cohorte (se pinta como celda vacía).
      return { x: m === 0 ? 'Alta' : `Mes ${m}`, y: celda ? celda.retencion_pct : -1 }
    }),
  })))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'heatmap' },
    legend: { show: false },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', fontWeight: 500, colors: ['#ffffff'] },
      formatter: (v: number) => (v < 0 ? '' : `${Math.round(v)}`),
    },
    plotOptions: {
      heatmap: {
        radius: 3,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: -1, to: -0.5, color: tinta.value.rejilla },
            { from: 0, to: 40, color: SECUENCIAL[1]! },
            { from: 40, to: 60, color: SECUENCIAL[2]! },
            { from: 60, to: 80, color: SECUENCIAL[3]! },
            { from: 80, to: 95, color: SECUENCIAL[4]! },
            { from: 95, to: 101, color: SECUENCIAL[5]! },
          ],
        },
      },
    },
    tooltip: { y: { formatter: (v: number) => (v < 0 ? 'Aún sin datos' : `${fmtPct(v)} siguen comprando`) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-table-large"
    subtitulo="% de cada cohorte de alta que compra en los meses siguientes"
    titulo="Retención por cohorte"
    :vacio="cohortes.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="Math.max(260, cohortes.length * 30 + 60)"
      descripcion="Mapa de calor de retención por cohorte de alta"
      :opciones="opcionesGrafico"
      :series="series"
      tipo="heatmap"
    />
  </TarjetaPanel>
</template>
