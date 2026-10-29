<script setup lang="ts">
  // Alerta de margen negativo (6.4.4.4): productos vendidos por debajo de su costo, por
  // descuentos o porque el costo de reposición subió y el precio no se actualizó.
  import type { MargenNegativo } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtenerApi } from '@/services/metricas'
  import { fmtEntero, fmtFecha, fmtMoneda, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtenerApi<MargenNegativo[]>('tasas/margen-negativo', { limite: 100 }))
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: 'Producto', key: 'producto' },
    { title: 'Ventas', key: 'ventas', align: 'end' as const },
    { title: 'Pérdida', key: 'margen', align: 'end' as const },
    { title: 'Precio / costo actual', key: 'precio_actual', align: 'end' as const },
    { title: 'Desc. máx.', key: 'descuento_maximo', align: 'end' as const },
    { title: 'Última', key: 'ultima_fecha' },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-trending-down"
    subtitulo="Ventas cuya base imponible quedó por debajo del costo · todo el período"
    titulo="Alertas de margen negativo"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="5"
      no-data-text="Ninguna venta con margen negativo"
    >
      <template #[`item.producto`]="{ item }">
        <div class="font-weight-medium">{{ item.producto }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.sku }} · {{ item.categoria }}</div>
      </template>

      <template #[`item.ventas`]="{ value }">{{ fmtEntero(value) }}</template>

      <template #[`item.margen`]="{ value }">
        <span class="text-error font-weight-medium">{{ fmtMoneda(value, true) }}</span>
      </template>

      <template #[`item.precio_actual`]="{ item }">{{ fmtMoneda(item.precio_actual, true) }} / {{ fmtMoneda(item.costo_actual, true) }}</template>
      <template #[`item.descuento_maximo`]="{ value }">{{ fmtPct(value, 0) }}</template>
      <template #[`item.ultima_fecha`]="{ value }">{{ fmtFecha(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
