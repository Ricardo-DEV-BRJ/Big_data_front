<script setup lang="ts">
  // Reposición por producto: clase de rotación A/M/B (fórmula 3), inventario de seguridad
  // SS = Z·σd·√L (fórmula 1) y punto de reorden ROP = d̄·L + SS (fórmula 2).
  import type { EstadoStock, Reposicion } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero } from '@/utils/formato'

  const COLOR_ESTADO: Record<EstadoStock, string> = {
    'Agotado': 'error',
    'Bajo stock mínimo': 'error',
    'Reordenar': 'warning',
    'Normal': 'success',
  }
  const COLOR_CLASE: Record<string, string> = { A: 'success', M: 'warning', B: 'error' }

  const clase = ref<string | null>(null)
  const estadoStock = ref<string | null>(null)
  const { estado } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Reposicion>('/inventario/reposicion', { sucursal: estado.sucursal, clase: clase.value, estado: estadoStock.value, limite: 500 }),
    () => [clase.value, estadoStock.value],
  )
  const filas = computed(() => datos.value?.productos ?? [])
  const resumenEstados = computed(() => datos.value?.estados ?? [])

  const encabezados = [
    { title: 'Producto', key: 'producto' },
    { title: 'Clase', key: 'clase_rotacion', align: 'center' as const },
    { title: 'IR', key: 'indice_rotacion', align: 'end' as const },
    { title: 'Existencia', key: 'stock_actual', align: 'end' as const },
    { title: 'Demanda/día', key: 'demanda_diaria', align: 'end' as const },
    { title: 'L (días)', key: 'lead_time_dias', align: 'end' as const },
    { title: 'Stock seguridad', key: 'stock_seguridad', align: 'end' as const },
    { title: 'Punto reorden', key: 'punto_reorden', align: 'end' as const },
    { title: 'Estado', key: 'estado_stock' },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-truck-check-outline"
    subtitulo="IR = unidades vendidas ÷ inventario promedio · SS = Z·σd·√L · ROP = d̄·L + SS · existencia al cierre"
    titulo="Rotación A/M/B, stock de seguridad y punto de reorden"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-select
        v-model="clase"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="[{ title: 'A · Alta', value: 'A' }, { title: 'M · Media', value: 'M' }, { title: 'B · Baja', value: 'B' }]"
        label="Clase"
        variant="outlined"
      />

      <v-select
        v-model="estadoStock"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="['Agotado', 'Bajo stock mínimo', 'Reordenar', 'Normal']"
        label="Estado"
        variant="outlined"
      />
    </template>

    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-chip
        v-for="e in resumenEstados"
        :key="e.estado_stock"
        :color="COLOR_ESTADO[e.estado_stock]"
        size="small"
        variant="tonal"
      >
        {{ e.estado_stock }}: {{ fmtEntero(e.productos) }}
      </v-chip>
    </div>

    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="10"
      no-data-text="Sin datos de reposición"
    >
      <template #[`item.producto`]="{ item }">
        <div class="font-weight-medium">
          {{ item.producto }}
          <v-icon
            v-if="item.perecedero"
            class="ms-1"
            color="warning"
            icon="mdi-timer-sand"
            size="14"
            :title="`Perecedero · vida útil ${item.vida_util_dias ?? '—'} días`"
          />
        </div>

        <div class="text-body-small text-medium-emphasis">{{ item.sku }} · {{ item.categoria }} · {{ item.zona_almacen }}</div>
      </template>

      <template #[`item.clase_rotacion`]="{ value }">
        <v-chip :color="COLOR_CLASE[value]" size="small" variant="flat">{{ value }}</v-chip>
      </template>

      <template #[`item.indice_rotacion`]="{ value }">{{ value === null ? '—' : `${fmtDecimal(value)}×` }}</template>
      <template #[`item.stock_actual`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.demanda_diaria`]="{ value }">{{ value === null ? '—' : fmtDecimal(value) }}</template>
      <template #[`item.lead_time_dias`]="{ value }">{{ value === null ? '—' : fmtDecimal(value) }}</template>
      <template #[`item.stock_seguridad`]="{ value }">{{ value === null ? '—' : fmtEntero(value) }}</template>
      <template #[`item.punto_reorden`]="{ value }">{{ value === null ? '—' : fmtEntero(value) }}</template>

      <template #[`item.estado_stock`]="{ value }">
        <v-chip :color="COLOR_ESTADO[value as EstadoStock]" size="small" variant="tonal">{{ value }}</v-chip>
      </template>
    </v-data-table>
  </TarjetaPanel>
</template>

<style scoped>
.filtro {
  width: 180px;
}
</style>
