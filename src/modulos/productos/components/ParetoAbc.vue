<script setup lang="ts">
  // Curva de Pareto: % acumulado de la venta según el ranking de productos, con las clases A, B y C.
  import type { Abc } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  // La clasificación ABC es de todo el período.
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Abc>('/productos/abc'))
  const { opciones, tinta } = useGrafico()

  const productos = computed(() => datos.value?.productos ?? [])
  const resumen = computed(() => datos.value?.resumen ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'area' },
    stroke: { width: 2, curve: 'straight' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
    xaxis: {
      type: 'numeric',
      tickAmount: 10,
      title: { text: 'Productos ordenados de mayor a menor venta' },
      labels: { formatter: (v: string) => fmtEntero(Number(v)) },
    },
    yaxis: { min: 0, max: 100, tickAmount: 5, labels: { formatter: (v: number) => `${v} %` } },
    annotations: {
      yaxis: [80, 95].map(y => ({
        y,
        borderColor: tinta.value.eje,
        strokeDashArray: 4,
        label: { text: y === 80 ? 'Fin clase A (80 %)' : 'Fin clase B (95 %)', position: 'right', style: { background: 'transparent', color: tinta.value.texto } },
      })),
    },
    tooltip: {
      x: { formatter: (v: number) => `Puesto ${v}` },
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const p = productos.value[o?.dataPointIndex ?? 0]
          return `${fmtPct(v)} acumulado · ${p?.producto ?? ''} (clase ${p?.clase_abc ?? ''})`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-chart-bell-curve-cumulative"
    subtitulo="Pareto por ingreso (80/15/5) · distinto de la clase de rotación A/M/B del módulo Inventario"
    titulo="Pareto y clasificación ABC por ingreso"
    :vacio="productos.length === 0"
    @reintentar="recargar"
  >
    <div class="d-flex flex-wrap ga-2 px-2 mb-1">
      <v-chip
        v-for="r in resumen"
        :key="r.clase_abc"
        rounded="lg"
        size="small"
        variant="tonal"
      >
        <strong class="me-1">Clase {{ r.clase_abc }}</strong>
        {{ fmtEntero(r.productos) }} productos · {{ fmtPct(r.participacion_pct) }} · {{ fmtMonedaCorta(r.venta_neta) }}
      </v-chip>
    </div>

    <Grafico
      :alto="330"
      descripcion="Curva de Pareto del porcentaje acumulado de ventas"
      :opciones="opcionesGrafico"
      :series="[{ name: '% acumulado', data: productos.map((p, i) => [i + 1, p.acumulado_pct]) }]"
      tipo="area"
    />
  </TarjetaPanel>
</template>
