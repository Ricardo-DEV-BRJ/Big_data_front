<script setup lang="ts">
  // Lo que cuesta cobrar con cada método: comisión bancaria y pérdida cambiaria (misma unidad, apiladas).
  import type { MetodoPago } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<MetodoPago[]>('/pagos', filtros.value))
  const { opciones, series } = useGrafico()

  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) =>
    (b.comision_bancaria + b.perdida_cambiaria) - (a.comision_bancaria + a.perdida_cambiaria)))

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar', stacked: true },
    colors: [series.value[1]!, series.value[7]!],
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4, borderRadiusWhenStacked: 'last' } },
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    xaxis: { categories: filas.value.map(f => f.metodo_pago), labels: { formatter: (v: string) => fmtMonedaCorta(Number(v)) } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => fmtMoneda(v) } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-cash-minus"
    subtitulo="Comisión bancaria y pérdida por la subida de la tasa entre venta y pago"
    titulo="Costo de cobrar"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="300"
      descripcion="Barras apiladas de comisión bancaria y pérdida cambiaria por método"
      :opciones="opcionesGrafico"
      :series="[
        { name: 'Comisión bancaria', data: filas.map(f => f.comision_bancaria) },
        { name: 'Pérdida cambiaria', data: filas.map(f => f.perdida_cambiaria) },
      ]"
      tipo="bar"
    />
  </TarjetaPanel>
</template>
