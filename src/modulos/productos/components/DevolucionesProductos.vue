<script setup lang="ts">
  // Tasa de devolución por categoría y productos con más dinero devuelto.
  import type { Devoluciones } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Devoluciones>('/devoluciones', { ...filtros.value, limite: 5 }))
  const { opciones, tinta } = useGrafico()

  const categorias = computed(() => datos.value?.categorias ?? [])
  const productos = computed(() => datos.value?.productos ?? [])

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '60%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      style: { colors: [tinta.value.texto], fontSize: '12px', fontWeight: 500 },
      formatter: (v: number) => fmtPct(v),
    },
    xaxis: {
      categories: categorias.value.map(c => c.categoria),
      min: 0,
      max: Math.max(...categorias.value.map(c => c.tasa_devolucion_pct ?? 0), 1) * 1.3,
      labels: { show: false },
      axisBorder: { show: false },
    },
    grid: { yaxis: { lines: { show: false } } },
    tooltip: {
      y: {
        formatter: (v: number, o?: { dataPointIndex: number }) => {
          const c = categorias.value[o?.dataPointIndex ?? 0]
          return `${fmtPct(v)} · ${fmtEntero(c?.devoluciones)} devoluciones · ${fmtMonedaCorta(c?.monto_devuelto)}`
        },
      },
    },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-keyboard-return"
    subtitulo="% de ventas devueltas por categoría"
    titulo="Devoluciones"
    :vacio="categorias.length === 0"
    @reintentar="recargar"
  >
    <Grafico
      :alto="250"
      descripcion="Barras de tasa de devolución por categoría"
      :opciones="opcionesGrafico"
      :series="[{ name: 'Tasa de devolución', data: categorias.map(c => c.tasa_devolucion_pct) }]"
      tipo="bar"
    />

    <div class="text-label-large font-weight-bold px-2 mt-2">Más dinero devuelto</div>

    <v-list class="bg-transparent py-0" density="compact">
      <v-list-item v-for="p in productos" :key="p.sku" :subtitle="`${p.categoria} · ${fmtEntero(p.devoluciones)} devoluciones`" :title="p.producto">
        <template #append>
          <div class="text-end">
            <div class="font-weight-bold">{{ fmtMonedaCorta(p.monto_devuelto) }}</div>
            <div class="text-body-small text-medium-emphasis">{{ fmtPct(p.tasa_devolucion_pct) }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </TarjetaPanel>
</template>
