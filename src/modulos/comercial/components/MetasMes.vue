<script setup lang="ts">
  // Meta frente a venta real de cada vendedor en el mes elegido.
  import type { MetaVendedor } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { estado, mesActual } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<MetaVendedor[]>('/metas', { mes: mesActual.value, sucursal: estado.sucursal }),
    () => mesActual.value,
  )
  const filas = computed(() => [...(datos.value ?? [])].toSorted((a, b) => (b.cumplimiento_pct ?? 0) - (a.cumplimiento_pct ?? 0)))

  const encabezados = [
    { title: 'Vendedor', key: 'vendedor' },
    { title: 'Meta', key: 'meta', align: 'end' as const },
    { title: 'Real', key: 'venta_neta', align: 'end' as const },
    { title: 'Diferencia', key: 'diferencia', align: 'end' as const },
    { title: 'Cumplimiento', key: 'cumplimiento_pct', width: 170 },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-calendar-check-outline"
    :subtitulo="mesActual ? `Mes de ${fmtMes(`${mesActual}-01`)}` : 'Último mes'"
    titulo="Metas del mes"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="8"
    >
      <template #[`item.vendedor`]="{ item }">
        <div class="font-weight-medium">{{ item.vendedor }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.sucursal }}</div>
      </template>

      <template #[`item.meta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.diferencia`]="{ value }">
        <span :class="value >= 0 ? 'text-success' : 'text-error'">{{ value >= 0 ? '+' : '−' }}{{ fmtMonedaCorta(Math.abs(value)) }}</span>
      </template>

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
    </v-data-table>
  </TarjetaPanel>
</template>
