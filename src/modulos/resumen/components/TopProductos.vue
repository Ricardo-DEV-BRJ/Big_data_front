<script setup lang="ts">
  // Los 6 productos que más venden, con su participación y margen.
  import type { Producto } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Producto[]>('/productos', { ...filtros.value, limite: 6 }))

  const filas = computed(() => datos.value ?? [])
  const maximo = computed(() => Math.max(...filas.value.map(f => f.participacion_pct ?? 0), 1))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-podium"
    subtitulo="Por venta neta"
    titulo="Productos líderes"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-list class="bg-transparent py-0" lines="two">
      <v-list-item v-for="(p, i) in filas" :key="p.sku" class="px-2">
        <template #prepend>
          <v-avatar
            class="me-1"
            color="primary"
            rounded="lg"
            size="32"
            variant="tonal"
          >
            <span class="text-label-large font-weight-bold">{{ i + 1 }}</span>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">{{ p.producto }}</v-list-item-title>
        <v-list-item-subtitle>{{ p.categoria }} · margen {{ fmtPct(p.margen_pct) }}</v-list-item-subtitle>

        <v-progress-linear
          class="mt-2"
          color="primary"
          height="4"
          :model-value="(100 * (p.participacion_pct ?? 0)) / maximo"
          rounded
        />

        <template #append>
          <div class="text-end ms-3">
            <div class="font-weight-bold">{{ fmtMonedaCorta(p.venta_neta) }}</div>
            <div class="text-body-small text-medium-emphasis">{{ fmtPct(p.participacion_pct) }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </TarjetaPanel>
</template>
