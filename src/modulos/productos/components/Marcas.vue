<script setup lang="ts">
  // Desempeño por marca: venta, participación, margen y devoluciones.
  import type { Agrupado } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Agrupado[]>('/marcas', filtros.value))

  const filas = computed(() => datos.value ?? [])
  const maximo = computed(() => Math.max(...filas.value.map(f => f.participacion_pct ?? 0), 1))

  const encabezados = [
    { title: 'Marca', key: 'marca' },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Participación', key: 'participacion_pct', width: 160 },
    { title: 'Margen', key: 'margen_pct', align: 'end' as const },
    { title: 'Devolución', key: 'tasa_devolucion_pct', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-label-multiple-outline"
    subtitulo="Ordenadas por venta neta"
    titulo="Marcas"
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
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.participacion_pct`]="{ value }">
        <div class="d-flex align-center ga-2">
          <v-progress-linear color="primary" height="6" :model-value="(100 * (value ?? 0)) / maximo" rounded />
          <span class="text-body-small">{{ fmtPct(value) }}</span>
        </div>
      </template>

      <template #[`item.margen_pct`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.tasa_devolucion_pct`]="{ value }">{{ fmtPct(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
