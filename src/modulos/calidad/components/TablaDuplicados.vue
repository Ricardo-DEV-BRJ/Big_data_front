<script setup lang="ts">
  // Control de ventas duplicadas: los duplicados exactos (mismo id) ya se excluyen de las
  // métricas; los posibles duplicados (otro id, mismos datos, minutos después) se listan
  // para que administración los verifique contra el sistema administrativo.
  import type { Duplicados } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Duplicados>('/duplicados', { ...filtros.value, limite: 500 }))
  const filas = computed(() => datos.value?.ventas ?? [])

  const encabezados = [
    { title: 'Id', key: 'id' },
    { title: 'Fecha y hora', key: 'fecha_hora' },
    { title: 'Cliente', key: 'cliente' },
    { title: 'Producto', key: 'producto' },
    { title: 'Cantidad', key: 'cantidad', align: 'end' as const },
    { title: 'Total', key: 'total', align: 'end' as const },
    { title: 'Vendedor', key: 'vendedor' },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-content-duplicate"
    :subtitulo="datos
      ? `${fmtEntero(datos.duplicados_exactos)} duplicados exactos excluidos · ${fmtEntero(datos.posibles_en_periodo)} posibles en el período por ${fmtMoneda(datos.monto_posibles)}`
      : 'Ventas registradas dos veces'"
    titulo="Ventas duplicadas"
    @reintentar="recargar"
  >
    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="10"
      no-data-text="Sin posibles duplicados en el período"
    >
      <template #[`item.fecha_hora`]="{ item }">{{ (item.fecha_hora ?? item.fecha).replace('T', ' ').slice(0, 16) }}</template>

      <template #[`item.cliente`]="{ item }">
        <div>{{ item.cliente }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.identificacion }}</div>
      </template>

      <template #[`item.cantidad`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.total`]="{ value }">{{ fmtMoneda(value, true) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
