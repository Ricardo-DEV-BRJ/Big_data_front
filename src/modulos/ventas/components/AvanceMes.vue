<script setup lang="ts">
  // Venta acumulada del mes frente al ritmo necesario para llegar a la meta.
  import type { Proyeccion, PuntoDiario } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { estado, mesActual } = useFiltros()
  const filtrosMes = () => ({ mes: mesActual.value, sucursal: estado.sucursal })
  const diario = useConsulta(() => obtener<PuntoDiario[]>('/ventas/diarias', filtrosMes()), () => mesActual.value)
  const proyeccion = useConsulta(() => obtener<Proyeccion | null>('/ventas/proyeccion', filtrosMes()), () => mesActual.value)
  const { opciones, tinta, series: colores } = useGrafico()

  const dias = computed(() => diario.datos.value ?? [])
  const p = computed(() => proyeccion.datos.value)
  const totalDias = computed(() => p.value?.dias_mes ?? dias.value.length)

  const series = computed(() => {
    const resultado: { name: string, data: (number | null)[] }[] = [
      { name: 'Acumulado real', data: dias.value.map(d => d.acumulado_mes) },
    ]
    const meta = p.value?.meta
    if (meta) {
      resultado.push({ name: 'Ritmo de la meta', data: Array.from({ length: totalDias.value }, (_, i) => Math.round((meta * (i + 1)) / totalDias.value)) })
    }
    return resultado
  })

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'line' },
    stroke: { width: [3, 2], dashArray: [0, 6], curve: 'straight' },
    colors: [colores.value[0]!, tinta.value.suave],
    markers: { size: 0, hover: { size: 5 } },
    xaxis: { categories: Array.from({ length: totalDias.value }, (_, i) => String(i + 1)), tickAmount: 10, title: { text: 'Día del mes' } },
    yaxis: { min: 0, labels: { formatter: (v: number) => fmtMonedaCorta(v) } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="diario.cargando.value || proyeccion.cargando.value"
    :error="diario.error.value || proyeccion.error.value"
    icono="mdi-flag-checkered"
    :subtitulo="p ? `${fmtMes(p.mes)} · meta ${fmtMoneda(p.meta)} · cumplimiento proyectado ${fmtPct(p.cumplimiento_proyectado_pct)}` : 'Mes en curso'"
    titulo="Avance del mes"
    :vacio="dias.length === 0"
    @reintentar="diario.recargar(); proyeccion.recargar()"
  >
    <Grafico
      :alto="320"
      descripcion="Líneas de venta acumulada del mes y ritmo de la meta"
      :opciones="opcionesGrafico"
      :series="series"
      tipo="line"
    />
  </TarjetaPanel>
</template>
