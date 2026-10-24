<script setup lang="ts">
  // Ventas por nivel de descuento: cuánto cuestan las promociones y qué pasa con el margen.
  import type { Descuento } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Descuento[]>('/descuentos', filtros.value))

  const filas = computed(() => datos.value ?? [])
  const costo = computed(() => filas.value.reduce((s, f) => s + f.descuento, 0))

  const encabezados = [
    { title: 'Descuento', key: 'descuento_pct' },
    { title: '% de ventas', key: 'pct_transacciones', align: 'end' as const },
    { title: 'Unid. por venta', key: 'unidades_por_venta', align: 'end' as const },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Descontado', key: 'descuento', align: 'end' as const },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-sale-outline"
    :subtitulo="`Costo total de las promociones: ${fmtMoneda(costo)}`"
    titulo="Descuentos"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      hide-default-footer
      :items="filas"
      :items-per-page="-1"
    >
      <template #[`item.descuento_pct`]="{ value }">
        <v-chip :color="value ? 'primary' : undefined" rounded="lg" size="small" variant="tonal">
          {{ value ? `${fmtEntero(value)} %` : 'Sin descuento' }}
        </v-chip>
      </template>

      <template #[`item.pct_transacciones`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.unidades_por_venta`]="{ value }">{{ fmtDecimal(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.descuento`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
