<script setup lang="ts">
  // Cartera de cada sucursal y qué parte está vencida.
  import type { Antiguedad } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { estado } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Antiguedad>('/cobranza/antiguedad', { sucursal: estado.sucursal }))

  const filas = computed(() => (datos.value?.por_sucursal ?? []).map(f => ({
    ...f,
    pct_vencido: f.monto ? (100 * f.monto_vencido) / f.monto : null,
  })))

  const encabezados = [
    { title: 'Sucursal', key: 'sucursal' },
    { title: 'Por cobrar', key: 'monto', align: 'end' as const },
    { title: 'Vencido', key: 'monto_vencido', align: 'end' as const },
    { title: '% vencido', key: 'pct_vencido', width: 140 },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-store-clock-outline"
    subtitulo="A la fecha de corte"
    titulo="Cartera por sucursal"
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
      <template #[`item.monto`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.monto_vencido`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.pct_vencido`]="{ value }">
        <div class="d-flex align-center ga-2">
          <v-progress-linear color="error" height="6" :model-value="value ?? 0" rounded />
          <span class="text-body-small">{{ fmtPct(value) }}</span>
        </div>
      </template>
    </v-data-table>
  </TarjetaPanel>
</template>
