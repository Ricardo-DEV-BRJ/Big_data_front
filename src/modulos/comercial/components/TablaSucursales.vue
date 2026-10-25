<script setup lang="ts">
  // Sucursales con su ubicación, ventas, margen, ticket y cobranza.
  import type { Sucursal } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { rango } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Sucursal[]>('/sucursales', rango.value))
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: 'Sucursal', key: 'sucursal' },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Part.', key: 'participacion_pct', align: 'end' as const },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
    { title: 'Por cobrar', key: 'pendiente', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-map-marker-outline"
    subtitulo="Todas las sucursales en el período"
    titulo="Sucursales"
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
      <template #[`item.sucursal`]="{ item }">
        <div class="font-weight-medium">{{ item.sucursal }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.ciudad }}, {{ item.estado_geo }}</div>
      </template>

      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.participacion_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.pendiente`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
