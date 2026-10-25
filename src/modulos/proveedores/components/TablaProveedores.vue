<script setup lang="ts">
  // Ficha de cada proveedor: órdenes, montos, costos, entregas y margen.
  import type { Proveedor } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Proveedor[]>('/proveedores'))
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: 'Proveedor', key: 'proveedor' },
    { title: 'Órdenes', key: 'ordenes', align: 'end' as const },
    { title: 'En tránsito', key: 'ordenes_en_transito', align: 'end' as const },
    { title: 'Comprado', key: 'monto_comprado', align: 'end' as const },
    { title: 'Costo unit. prom.', key: 'costo_promedio_unitario', align: 'end' as const },
    { title: 'Días de entrega', key: 'dias_entrega_promedio', align: 'end' as const },
    { title: 'Tardías', key: 'pct_entregas_tarde', align: 'end' as const },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-truck-delivery-outline"
    subtitulo="Ordenados por monto comprado"
    titulo="Proveedores"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="comfortable"
      :headers="encabezados"
      hide-default-footer
      :items="filas"
      :items-per-page="-1"
    >
      <template #[`item.proveedor`]="{ value }"><strong>{{ value }}</strong></template>
      <template #[`item.ordenes`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.ordenes_en_transito`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.monto_comprado`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.costo_promedio_unitario`]="{ value }">{{ fmtMoneda(value, true) }}</template>
      <template #[`item.dias_entrega_promedio`]="{ value }">{{ fmtDecimal(value) }}</template>
      <template #[`item.pct_entregas_tarde`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
