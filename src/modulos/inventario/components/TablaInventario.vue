<script setup lang="ts">
  // Detalle por producto y sucursal: dónde se pierden ventas, qué no rota y qué sobra.
  import type { InventarioItem } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMonedaCorta } from '@/utils/formato'

  const VISTAS = [
    { title: 'Más venta perdida', value: 'venta_perdida' },
    { title: 'Más días sin stock', value: 'quiebre' },
    { title: 'Menor rotación', value: 'rotacion_baja' },
    { title: 'Más cobertura (sobrestock)', value: 'cobertura' },
    { title: 'Más valor inmovilizado', value: 'valor' },
  ]

  const orden = ref('venta_perdida')
  const categoria = ref<string | null>(null)
  const { estado, opciones } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<InventarioItem[]>('/inventario', { sucursal: estado.sucursal, categoria: categoria.value, orden: orden.value, limite: 100 }),
    () => [orden.value, categoria.value],
  )
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: 'Producto', key: 'producto' },
    { title: 'Sucursal', key: 'sucursal' },
    { title: 'Existencia', key: 'stock_actual', align: 'end' as const },
    { title: 'Valor', key: 'valor_inventario_actual', align: 'end' as const },
    { title: 'Rotación', key: 'rotacion', align: 'end' as const },
    { title: 'Cobertura', key: 'dias_cobertura', align: 'end' as const },
    { title: 'Días sin stock', key: 'dias_quiebre', align: 'end' as const },
    { title: 'Venta perdida', key: 'venta_perdida_usd', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-clipboard-list-outline"
    subtitulo="Hasta 100 combinaciones de producto y sucursal · todo el período"
    titulo="Detalle de inventario"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-select
        v-model="categoria"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="opciones?.categorias ?? []"
        label="Categoría"
        variant="outlined"
      />

      <v-select
        v-model="orden"
        class="filtro"
        density="compact"
        hide-details
        :items="VISTAS"
        label="Ver"
        variant="outlined"
      />
    </template>

    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="10"
      no-data-text="Sin datos de inventario"
    >
      <template #[`item.producto`]="{ item }">
        <div class="font-weight-medium">{{ item.producto }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.sku }} · {{ item.categoria }}</div>
      </template>

      <template #[`item.stock_actual`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.valor_inventario_actual`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.rotacion`]="{ value }">{{ value === null ? '—' : `${fmtDecimal(value)}×` }}</template>
      <template #[`item.dias_cobertura`]="{ value }">{{ value === null ? 'Sin ventas' : `${fmtEntero(value)} días` }}</template>

      <template #[`item.dias_quiebre`]="{ value }">
        <span :class="value > 0 ? 'text-error font-weight-medium' : ''">{{ fmtEntero(value) }}</span>
      </template>

      <template #[`item.venta_perdida_usd`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>

<style scoped>
.filtro {
  width: 210px;
}
</style>
