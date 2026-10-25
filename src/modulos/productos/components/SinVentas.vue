<script setup lang="ts">
  // Productos del inventario que no se vendieron: candidatos a liquidar o descontinuar.
  import type { ProductoCatalogo } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMoneda } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<ProductoCatalogo[]>('/productos/sin-ventas', filtros.value))

  const filas = computed(() => datos.value ?? [])
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-package-variant-remove"
    subtitulo="Están en inventario y no tuvieron ventas en el período"
    titulo="Productos sin ventas"
    @reintentar="recargar"
  >
    <v-list v-if="filas.length > 0" class="bg-transparent py-0" density="compact">
      <v-list-item
        v-for="p in filas"
        :key="p.sku"
        prepend-icon="mdi-alert-circle-outline"
        :subtitle="`${p.sku} · ${p.categoria ?? 'Sin categoría'}`"
        :title="p.producto"
      >
        <template #append>
          <span class="text-body-small text-medium-emphasis">Costo {{ fmtMoneda(p.costo_unitario, true) }}</span>
        </template>
      </v-list-item>
    </v-list>

    <div v-else-if="!cargando" class="d-flex align-center ga-2 pa-4 text-body-medium">
      <v-icon color="success" icon="mdi-check-circle" /> Todos los productos tuvieron ventas.
    </div>
  </TarjetaPanel>
</template>
