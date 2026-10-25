<script setup lang="ts">
  // Ficha de clientes con búsqueda: compras, cartera, segmento RFM y valor de vida.
  import type { Cliente } from '@/services/metricas'
  import { computed, ref, watch } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtFecha, fmtMoneda, fmtMonedaCorta } from '@/utils/formato'

  const ORDENES = [
    { title: 'Venta neta', value: 'ingreso' },
    { title: 'Margen', value: 'margen' },
    { title: 'Frecuencia', value: 'frecuencia' },
    { title: 'Por cobrar', value: 'pendiente' },
    { title: 'Vencido', value: 'vencido' },
    { title: 'Sin comprar hace más', value: 'recencia' },
    { title: 'Valor de vida', value: 'clv' },
  ]

  const { opciones } = useFiltros()
  const orden = ref('ingreso')
  const tipo = ref<string | null>(null)
  const segmento = ref<string | null>(null)
  const texto = ref('')
  const buscar = ref('')
  // Espera a que se deje de escribir para consultar.
  let espera: ReturnType<typeof setTimeout> | undefined
  watch(texto, valor => {
    clearTimeout(espera)
    espera = setTimeout(() => {
      buscar.value = valor.trim()
    }, 350)
  })

  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Cliente[]>('/clientes', {
      orden: orden.value, tipo: tipo.value, segmento: segmento.value, buscar: buscar.value, limite: 100,
    }),
    () => [orden.value, tipo.value, segmento.value, buscar.value],
  )
  const filas = computed(() => datos.value ?? [])

  const encabezados = [
    { title: '#', key: 'ranking', width: 60 },
    { title: 'Cliente', key: 'cliente' },
    { title: 'Tipo', key: 'tipo_cliente' },
    { title: 'Segmento', key: 'segmento_rfm' },
    { title: 'Compras', key: 'transacciones', align: 'end' as const },
    { title: 'Venta neta', key: 'venta_neta', align: 'end' as const },
    { title: 'Ticket', key: 'ticket_promedio', align: 'end' as const },
    { title: 'Última compra', key: 'ultima_compra' },
    { title: 'Por cobrar', key: 'pendiente', align: 'end' as const },
    { title: 'Vencido', key: 'monto_vencido', align: 'end' as const },
    { title: 'CLV', key: 'clv_estimado', align: 'end' as const },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-search-outline"
    subtitulo="Hasta 100 clientes según el orden elegido · todo el período"
    titulo="Clientes"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-text-field
        v-model="texto"
        class="filtro buscador"
        clearable
        density="compact"
        hide-details
        label="Buscar nombre o cédula/RIF"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />

      <v-select
        v-model="tipo"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="opciones?.tipos_cliente ?? []"
        label="Tipo"
        variant="outlined"
      />

      <v-select
        v-model="segmento"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="opciones?.segmentos_rfm ?? []"
        label="Segmento"
        variant="outlined"
      />

      <v-select
        v-model="orden"
        class="filtro"
        density="compact"
        hide-details
        :items="ORDENES"
        label="Ordenar por"
        variant="outlined"
      />
    </template>

    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="10"
      no-data-text="No hay clientes con esos filtros"
    >
      <template #[`item.cliente`]="{ item }">
        <div class="font-weight-medium">{{ item.cliente }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.identificacion }} · {{ item.sucursal_habitual }}</div>
      </template>

      <template #[`item.segmento_rfm`]="{ value }">
        <v-chip rounded="lg" size="small" variant="tonal">{{ value }}</v-chip>
      </template>

      <template #[`item.transacciones`]="{ value }">{{ fmtEntero(value) }}</template>
      <template #[`item.venta_neta`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
      <template #[`item.ticket_promedio`]="{ value }">{{ fmtMoneda(value) }}</template>
      <template #[`item.ultima_compra`]="{ value }">{{ fmtFecha(value) }}</template>
      <template #[`item.pendiente`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.monto_vencido`]="{ value }">
        <span :class="value > 0 ? 'text-error font-weight-medium' : ''">{{ fmtMonedaCorta(value) }}</span>
      </template>

      <template #[`item.clv_estimado`]="{ value }">{{ fmtMonedaCorta(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>

<style scoped>
.filtro {
  width: 170px;
}

.buscador {
  width: 250px;
}
</style>
