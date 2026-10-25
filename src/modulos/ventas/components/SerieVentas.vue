<script setup lang="ts">
  // Venta neta en el tiempo, por día, semana o mes.
  import type { PuntoDiario, PuntoMensual, PuntoSemanal } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtFecha, fmtMes, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  type Escala = 'diarias' | 'semanales' | 'mensuales'

  const escala = ref<Escala>('semanales')
  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<(PuntoDiario | PuntoSemanal | PuntoMensual)[]>(`/ventas/${escala.value}`, filtros.value),
    () => escala.value,
  )
  const { opciones } = useGrafico()

  const filas = computed(() => datos.value ?? [])

  // Fecha de cada punto (día, lunes de la semana o primer día del mes) en milisegundos.
  function instante (f: PuntoDiario | PuntoSemanal | PuntoMensual): number {
    const fecha = 'fecha' in f ? f.fecha : ('semana' in f ? f.semana : f.mes)
    return Date.parse(`${fecha}T00:00:00Z`)
  }

  function etiqueta (f: PuntoDiario | PuntoSemanal | PuntoMensual): string {
    if ('fecha' in f) {
      return fmtFecha(f.fecha)
    }
    if ('semana' in f) {
      return `Semana del ${fmtFecha(f.semana)}`
    }
    return fmtMes(f.mes)
  }

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'area' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 95] } },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: { type: 'datetime', labels: { datetimeUTC: true } },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: {
      intersect: false,
      x: { formatter: (_v: number, o?: { dataPointIndex: number }) => etiqueta(filas.value[o?.dataPointIndex ?? 0]!) },
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) =>
          `${fmtMoneda(v)} · ${fmtEntero(filas.value[o?.dataPointIndex ?? 0]?.transacciones)} ventas`,
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-areaspline"
    subtitulo="Venta neta sin IVA"
    titulo="Tendencia de ventas"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-btn-toggle
        v-model="escala"
        color="primary"
        density="compact"
        mandatory
        rounded="lg"
        variant="outlined"
      >
        <v-btn size="small" value="diarias">Día</v-btn>
        <v-btn size="small" value="semanales">Semana</v-btn>
        <v-btn size="small" value="mensuales">Mes</v-btn>
      </v-btn-toggle>
    </template>

    <Grafico
      :alto="340"
      descripcion="Área de venta neta en el tiempo"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Venta neta', data: filas.map(f => [instante(f), f.venta_neta]) }]"
      tipo="area"
    />
  </TarjetaPanel>
</template>
