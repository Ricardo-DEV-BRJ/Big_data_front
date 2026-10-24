<script setup lang="ts">
  // ¿El negocio vive del volumen o del valor? Venta y margen por rango de precio.
  import type { RangoPrecio } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<RangoPrecio[]>('/productos/rangos-precio'))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '50%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 500 },
      formatter: (_v: number, o?: { dataPointIndex: number }) => fmtPct(filas.value[o?.dataPointIndex ?? 0]?.participacion_pct),
    },
    xaxis: {
      categories: filas.value.map(f => [f.rango_precio, `${fmtMoneda(f.precio_minimo)} – ${fmtMoneda(f.precio_maximo)}`]),
    },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const f = filas.value[o?.dataPointIndex ?? 0]
          return `${fmtMoneda(v)} · ${fmtEntero(f?.productos)} productos · ${fmtEntero(f?.unidades)} u. · margen ${fmtPct(f?.margen_pct)}`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-tag-multiple-outline"
    subtitulo="Venta neta y participación por tercil de precio · todo el período"
    titulo="Rangos de precio"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="260"
      descripcion="Columnas de venta neta por rango de precio"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Venta neta', data: filas.map(f => f.venta_neta) }]"
      tipo="bar"
    />

    <div class="d-flex justify-space-around text-center px-2 pb-1">
      <div v-for="f in filas" :key="f.rango_precio">
        <div class="text-body-small text-medium-emphasis">Margen {{ f.rango_precio.toLowerCase() }}</div>
        <div class="text-title-medium font-weight-bold">{{ fmtPct(f.margen_pct) }}</div>
      </div>
    </div>
  </TarjetaPanel>
</template>
