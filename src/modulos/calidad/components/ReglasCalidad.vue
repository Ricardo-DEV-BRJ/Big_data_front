<script setup lang="ts">
  // Reglas de calidad de cada dataset: cuántas filas fallan y su estado (con ícono y texto, no solo color).
  import type { ReglaCalidad } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtPct } from '@/utils/formato'

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<ReglaCalidad[]>('/calidad'))
  const filas = computed(() => datos.value ?? [])

  function estado (r: ReglaCalidad) {
    if (r.regla === 'sin_archivos') {
      return { color: 'warning', icono: 'mdi-folder-alert-outline', texto: 'Sin archivos' }
    }
    if (!r.filas_afectadas) {
      return { color: 'success', icono: 'mdi-check-circle', texto: 'Correcto' }
    }
    if ((r.pct ?? 0) >= 1) {
      return { color: 'error', icono: 'mdi-alert-octagon', texto: 'Revisar' }
    }
    return { color: 'warning', icono: 'mdi-alert', texto: 'Atención' }
  }

  const resumen = computed(() => {
    const conProblemas = filas.value.filter(r => r.filas_afectadas > 0)
    const datasets = [...new Set(filas.value.map(r => r.dataset))]
    const sinArchivos = filas.value.filter(r => r.regla === 'sin_archivos').length
    return [
      { titulo: 'Reglas revisadas', valor: fmtEntero(filas.value.length), detalle: `En ${fmtEntero(datasets.length)} datasets`, icono: 'mdi-format-list-checks' },
      { titulo: 'Reglas con problemas', valor: fmtEntero(conProblemas.length), detalle: conProblemas.length > 0 ? 'Ver detalle abajo' : 'Todo en orden', icono: 'mdi-alert-outline' },
      { titulo: 'Filas afectadas', valor: fmtEntero(conProblemas.reduce((s, r) => s + r.filas_afectadas, 0)), detalle: 'Suma de todas las reglas', icono: 'mdi-table-alert' },
      { titulo: 'Datasets sin archivos', valor: fmtEntero(sinArchivos), detalle: sinArchivos ? 'Sus métricas quedan vacías' : 'Todos cargados', icono: 'mdi-folder-alert-outline' },
    ]
  })

  const encabezados = [
    { title: 'Estado', key: 'estado', width: 130 },
    { title: 'Dataset', key: 'dataset' },
    { title: 'Regla', key: 'descripcion' },
    { title: 'Filas afectadas', key: 'filas_afectadas', align: 'end' as const },
    { title: '% del dataset', key: 'pct', align: 'end' as const },
  ]
</script>

<template>
  <v-row>
    <v-col
      v-for="k in resumen"
      :key="k.titulo"
      cols="12"
      lg="3"
      sm="6"
    >
      <TarjetaKpi
        :cargando="cargando"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>

    <v-col cols="12">
      <TarjetaPanel
        :cargando="cargando"
        :error="error"
        icono="mdi-shield-check-outline"
        subtitulo="Se revisan en cada recálculo de métricas"
        titulo="Reglas de calidad"
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
          <template #[`item.estado`]="{ item }">
            <v-chip
              :color="estado(item).color"
              :prepend-icon="estado(item).icono"
              rounded="lg"
              size="small"
              variant="tonal"
            >
              {{ estado(item).texto }}
            </v-chip>
          </template>

          <template #[`item.dataset`]="{ value }"><v-chip rounded="lg" size="small" variant="outlined">{{ value }}</v-chip></template>

          <template #[`item.descripcion`]="{ item }">
            <div class="text-wrap py-1">{{ item.descripcion }}</div>
            <div class="text-body-small text-medium-emphasis">{{ item.regla }}</div>
          </template>

          <template #[`item.filas_afectadas`]="{ value }">{{ fmtEntero(value) }}</template>
          <template #[`item.pct`]="{ value }">{{ fmtPct(value, 3) }}</template>
        </v-data-table>
      </TarjetaPanel>
    </v-col>
  </v-row>
</template>
