<script setup lang="ts">
  // Clientes que más deben (vencido primero) y los que no han pagado nada de lo que deben.
  import type { Cliente } from '@/services/metricas'
  import { computed, ref } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtFecha, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const vista = ref<'vencido' | 'pendiente' | 'morosos'>('vencido')
  const { datos, cargando, error, recargar } = useConsulta(
    () => (vista.value === 'morosos'
      ? obtener<Cliente[]>('/clientes/morosos', { limite: 50 })
      : obtener<Cliente[]>('/clientes', { orden: vista.value, limite: 50 })),
    () => vista.value,
  )
  // En "por cobrar" y "vencido" solo interesan los que deben algo.
  const filas = computed(() => (datos.value ?? []).filter(c => c.pendiente > 0))

  const encabezados = [
    { title: 'Cliente', key: 'cliente' },
    { title: 'Tipo', key: 'tipo_cliente' },
    { title: 'Por cobrar', key: 'pendiente', align: 'end' as const },
    { title: 'Vencido', key: 'monto_vencido', align: 'end' as const },
    { title: '% sin pagar', key: 'pct_pendiente', align: 'end' as const },
    { title: 'Última compra', key: 'ultima_compra' },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-alert-outline"
    subtitulo="A quién cobrar primero"
    titulo="Deudores"
    @reintentar="recargar"
  >
    <template #acciones>
      <v-btn-toggle
        v-model="vista"
        color="primary"
        density="compact"
        mandatory
        rounded="lg"
        variant="outlined"
      >
        <v-btn size="small" value="vencido">Más vencido</v-btn>
        <v-btn size="small" value="pendiente">Más por cobrar</v-btn>
        <v-btn size="small" value="morosos">No han pagado nada</v-btn>
      </v-btn-toggle>
    </template>

    <v-data-table
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      :items="filas"
      :items-per-page="8"
      no-data-text="No hay clientes en esta situación"
    >
      <template #[`item.cliente`]="{ item }">
        <div class="font-weight-medium">{{ item.cliente }}</div>
        <div class="text-body-small text-medium-emphasis">{{ item.identificacion }}</div>
      </template>

      <template #[`item.pendiente`]="{ value }">{{ fmtMonedaCorta(value) }}</template>

      <template #[`item.monto_vencido`]="{ value }">
        <span :class="value > 0 ? 'text-error font-weight-medium' : ''">{{ fmtMonedaCorta(value) }}</span>
      </template>

      <template #[`item.pct_pendiente`]="{ value }">{{ fmtPct(value) }}</template>
      <template #[`item.ultima_compra`]="{ value }">{{ fmtFecha(value) }}</template>
    </v-data-table>
  </TarjetaPanel>
</template>
