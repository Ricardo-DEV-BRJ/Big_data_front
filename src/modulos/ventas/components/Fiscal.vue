<script setup lang="ts">
  // Base imponible e IVA por mes, para la declaración.
  import type { MesFiscal } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes, fmtMoneda } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<MesFiscal[]>('/fiscal', filtros.value))

  const filas = computed(() => [...(datos.value ?? [])].toReversed())
  const totales = computed(() => filas.value.reduce(
    (t, f) => ({ base: t.base + f.base_imponible, iva: t.iva + f.iva, total: t.total + f.total }),
    { base: 0, iva: 0, total: 0 },
  ))

  const encabezados = [
    { title: 'Mes', key: 'mes' },
    { title: 'Facturas', key: 'facturas', align: 'end' as const },
    { title: 'Base imponible', key: 'base_imponible', align: 'end' as const },
    { title: 'IVA', key: 'iva', align: 'end' as const },
    { title: 'Total', key: 'total', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-bank-outline"
    :subtitulo="`IVA del período: ${fmtMoneda(totales.iva)} sobre ${fmtMoneda(totales.base)}`"
    titulo="Impuestos (IVA)"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="6"
    >
      <template #[`item.mes`]="{ value }">{{ fmtMes(value) }}</template>
      <template #[`item.facturas`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.base_imponible`]="{ value }">{{ fmtMoneda(value) }}</template>
      <template #[`item.iva`]="{ value }">{{ fmtMoneda(value) }}</template>
      <template #[`item.total`]="{ value }">{{ fmtMoneda(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
