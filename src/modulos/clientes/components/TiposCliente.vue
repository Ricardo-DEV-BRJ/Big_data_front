<script setup lang="ts">
  // Comparación de segmentos por tipo de documento (V, J, E, G): volumen, rentabilidad y pago.
  import type { Segmento } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Segmento[]>('/segmentos', filtros.value))
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: 'Tipo de cliente', key: 'tipo_cliente' },
    { title: 'Clientes', key: 'clientes', align: 'end' as const },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Part.', key: 'participacion_pct', align: 'end' as const },
    { title: 'Ticket', key: 'ticket_promedio', align: 'end' as const },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
    { title: 'A crédito', key: 'pct_ventas_credito', align: 'end' as const },
    { title: 'Días de cobro', key: 'dias_cobro_promedio', align: 'end' as const },
    { title: 'Morosidad', key: 'morosidad_pct', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-card-account-details-outline"
    subtitulo="Según el prefijo de la identificación: V persona, J empresa, E extranjero, G gobierno"
    titulo="Tipos de cliente"
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
      <template #[`item.tipo_cliente`]="{ value }"><strong>{{ value }}</strong></template>
      <template #[`item.clientes`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.participacion_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.ticket_promedio`]="{ value }">{{ fmtMoneda(value) }}</template>
      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.pct_ventas_credito`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.dias_cobro_promedio`]="{ value }">{{ fmtDecimal(value) }}</template>
      <template #[`item.morosidad_pct`]="{ value }">{{ fmtPct(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
