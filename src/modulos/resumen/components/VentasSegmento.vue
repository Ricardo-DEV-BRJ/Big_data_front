<script setup lang="ts">
  // Participación de cada tipo de cliente en la venta neta (dona).
  import type { Segmento } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  // Orden fijo: cada tipo de cliente conserva su color en todo el panel.
  const TIPOS = ['Persona natural', 'Empresa', 'Gobierno', 'Extranjero']

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Segmento[]>('/segmentos', filtros.value))
  const { opciones, series } = useGrafico()

  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) => TIPOS.indexOf(a.tipo_cliente) - TIPOS.indexOf(b.tipo_cliente)))
  const total = computed(() => filas.value.reduce((s, f) => s + f.venta_neta, 0))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'donut' },
    labels: filas.value.map(f => f.tipo_cliente),
    colors: filas.value.map(f => series.value[Math.max(0, TIPOS.indexOf(f.tipo_cliente))]!),
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            value: { formatter: (v: string) => fmtMonedaCorta(Number(v)) },
            total: { show: true, label: 'Venta neta', formatter: () => fmtMonedaCorta(total.value) },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v: number) => `${fmtMoneda(v)} · ${fmtPct(total.value ? (100 * v) / total.value : null)}` } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-group-outline"
    subtitulo="Venta neta por tipo de cliente"
    titulo="Ventas por segmento"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Dona de venta neta por tipo de cliente"
      :opciones="opcionesGrafico"
      :series="filas.map(f => f.venta_neta)"
      tipo="donut"
    />
  </TarjetaPanel>
</template>
