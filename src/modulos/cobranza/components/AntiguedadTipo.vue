<script setup lang="ts">
  // Cartera de cada tipo de cliente repartida por tramo de antigüedad (barras apiladas).
  import type { Antiguedad } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const TRAMOS = ['Por vencer', '1-30', '31-60', '61-90', 'Más de 90']

  const { estado } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Antiguedad>('/cobranza/antiguedad', { sucursal: estado.sucursal }))
  const { opciones, ordinal } = useGrafico()

  const filas = computed(() => datos.value?.por_tipo ?? [])
  const tipos = computed(() => {
    const total = (t: string) => filas.value.filter(f => f.tipo_cliente === t).reduce((s, f) => s + f.monto, 0)
    return [...new Set(filas.value.map(f => f.tipo_cliente))].toSorted((a, b) => total(b) - total(a))
  })
  const series = computed(() => TRAMOS.map(tramo => ({
    name: tramo === 'Por vencer' || tramo === 'Más de 90' ? tramo : `${tramo} días`,
    data: tipos.value.map(t => filas.value.find(f => f.tipo_cliente === t && f.tramo === tramo)?.monto ?? 0),
  })))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar', stacked: true },
    colors: ordinal.value,
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4, borderRadiusWhenStacked: 'last' } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    xaxis: { categories: tipos.value, labels: { formatter: (v: string) => fmtMonedaCorta(Number(v)) } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-cash-outline"
    subtitulo="Saldo por cobrar de cada tipo de cliente según antigüedad"
    titulo="Cartera por tipo de cliente"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Barras apiladas de cartera por tipo de cliente y tramo"
      :opciones="opcionesGrafico"
      :series="series"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
