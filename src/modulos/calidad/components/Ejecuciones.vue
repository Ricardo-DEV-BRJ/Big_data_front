<script setup lang="ts">
  // Historial de recálculos de métricas: cuándo corrieron, cuánto tardaron y si fallaron.
  import type { Estado } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtFecha } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Estado>('/estado'))
  const filas = computed(() => datos.value?.ejecuciones ?? [])

  const ESTADOS: Record<string, { color: string, icono: string, texto: string }> = {
    ok: { color: 'success', icono: 'mdi-check-circle', texto: 'Correcto' },
    error: { color: 'error', icono: 'mdi-alert-octagon', texto: 'Error' },
    en_curso: { color: 'info', icono: 'mdi-progress-clock', texto: 'En curso' },
  }

  // La hora viene en UTC; se muestra en la hora local del navegador.
  function hora (fecha: string | null): string {
    return fecha ? new Date(fecha).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
  }

  const encabezados = [
    { title: 'Estado', key: 'estado', width: 130 },
    { title: 'Inicio', key: 'inicio' },
    { title: 'Duración', key: 'segundos', align: 'end' as const },
    { title: 'Fecha de corte', key: 'fecha_corte' },
    { title: 'Ventas leídas', key: 'filas_ventas', align: 'end' as const },
    { title: 'Detalle', key: 'detalle' },
  ]

  function detalle (texto: string | null, estado: string): string {
    if (!texto) {
      return ''
    }
    if (estado !== 'ok') {
      return texto
    }
    try {
      const d = JSON.parse(texto) as { datasets: Record<string, boolean> }
      const faltan = Object.entries(d.datasets).filter(([, v]) => !v).map(([k]) => k)
      return faltan.length > 0 ? `Sin archivos: ${faltan.join(', ')}` : 'Todos los datasets leídos'
    } catch {
      return ''
    }
  }
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-history"
    subtitulo="Últimos 10 recálculos (manuales o de la tarea diaria)"
    titulo="Recálculos de métricas"
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
      <template #[`item.estado`]="{ value }">
        <v-chip
          :color="ESTADOS[value]?.color"
          :prepend-icon="ESTADOS[value]?.icono"
          rounded="lg"
          size="small"
          variant="tonal"
        >
          {{ ESTADOS[value]?.texto ?? value }}
        </v-chip>
      </template>

      <template #[`item.inicio`]="{ value }">{{ hora(value) }}</template>
      <template #[`item.segundos`]="{ value }">{{ value === null ? '—' : `${fmtDecimal(value)} s` }}</template>
      <template #[`item.fecha_corte`]="{ value }">{{ fmtFecha(value) }}</template>
      <template #[`item.filas_ventas`]="{ value }">{{ fmtEntero(value) }}</template>

      <template #[`item.detalle`]="{ item }">
        <div class="text-wrap text-body-small">{{ detalle(item.detalle, item.estado) }}</div>
      </template>
    </v-data-table>
  </TarjetaPanel>
</template>
