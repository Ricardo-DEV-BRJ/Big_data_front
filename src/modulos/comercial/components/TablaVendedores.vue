<script setup lang="ts">
  // Ranking de vendedores con margen, descuentos, cobranza, devoluciones y comisión.
  import type { Vendedor } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Vendedor[]>('/vendedores', filtros.value))
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: '#', key: 'ranking', width: 50 },
    { title: 'Vendedor', key: 'vendedor' },
    { title: 'Ventas', key: 'transacciones', align: 'end' as const },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Cumplimiento', key: 'cumplimiento_pct', width: 170 },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
    { title: 'Descuento', key: 'descuento_pct', align: 'end' as const },
    { title: 'Cobrado', key: 'tasa_cobro_pct', align: 'end' as const },
    { title: 'Devol.', key: 'devoluciones', align: 'end' as const },
    { title: 'Comisión', key: 'comision', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-format-list-numbered"
    subtitulo="Ordenados por venta neta"
    titulo="Desempeño de vendedores"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="10"
    >
      <template #[`item.vendedor`]="{ item }">
        <div class="font-weight-medium">{{ item.vendedor }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.sucursal }}</div>
      </template>

      <template #[`item.transacciones`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.cumplimiento_pct`]="{ value }">
        <div class="d-flex align-center ga-2">
          <v-progress-linear
            :color="value >= 100 ? 'success' : value >= 90 ? 'warning' : 'error'"
            height="6"
            :model-value="Math.min(value ?? 0, 100)"
            rounded
          />

          <span class="text-body-small">{{ fmtPct(value) }}</span>
        </div>
      </template>

      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.descuento_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.tasa_cobro_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.devoluciones`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.comision`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
