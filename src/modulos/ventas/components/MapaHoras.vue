<script setup lang="ts">
  // Mapa de calor día de la semana × hora: cuándo se concentran las ventas.
  import type { CeldaHora } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { SECUENCIAL, useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { DIAS_SEMANA, fmtEntero, fmtMoneda } from '@/utils/formato'

  const medida = ref<'transacciones' | 'venta_neta'>('transacciones')
  const { estado } = useFiltros()
  // Es un acumulado de todo el período; solo se filtra por sucursal.
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<CeldaHora[]>('/ventas/horas', { sucursal: estado.sucursal }))
  const { opciones, tinta } = useGrafico()

  const horas = computed(() => [...new Set((datos.value ?? []).map(c => c.hora))].toSorted((a, b) => a - b))

  // Una serie por día (domingo abajo, lunes arriba) con un punto por hora.
  const series = computed(() => [...DIAS_SEMANA].toReversed().map((dia, i) => {
    const numero = 7 - i
    return {
      name: dia.slice(0, 3),
      data: horas.value.map(h => {
        const celda = (datos.value ?? []).find(c => c.dia_semana === numero && c.hora === h)
        return { x: `${h}:00`, y: celda ? celda[medida.value] : 0 }
      }),
    }
  }))

  const maximo = computed(() => Math.max(...(datos.value ?? []).map(c => c[medida.value]), 1))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'heatmap' },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    legend: { show: false },
    plotOptions: {
      heatmap: {
        radius: 4,
        enableShades: false,
        colorScale: {
          ranges: SECUENCIAL.map((color, i) => ({
            from: (maximo.value * i) / SECUENCIAL.length,
            to: (maximo.value * (i + 1)) / SECUENCIAL.length + (i === SECUENCIAL.length - 1 ? 1 : 0),
            color,
          })),
        },
      },
    },
    xaxis: { labels: { style: { colors: tinta.value.suave } } },
    tooltip: { y: { formatter: (v: number) => (medida.value === 'venta_neta' ? fmtMoneda(v) : `${fmtEntero(v)} ventas`) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-clock-time-four-outline"
    subtitulo="Más oscuro = más actividad · todo el período"
    titulo="Horas pico"
    :vacio="horas.length === 0"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-btn-toggle
        v-model="medida"
        color="primary"
        density="compact"
        mandatory
        rounded="lg"
        variant="outlined"
      >
        <v-btn size="small" value="transacciones">Ventas</v-btn>
        <v-btn size="small" value="venta_neta">Monto</v-btn>
      </v-btn-toggle>
    </template>

    <Grafico
      :alto="320"
      descripcion="Mapa de calor de ventas por día de la semana y hora"
      :opciones="opcionesGrafico"
      :series="series"
      tipo="heatmap"
    />
  </TarjetaPanel>
</template>
