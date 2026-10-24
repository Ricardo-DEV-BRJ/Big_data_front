<script setup lang="ts">
  // Segmentos RFM (recencia, frecuencia, monto): cuántos clientes hay en cada uno y cuánto venden.
  import type { SegmentoRfm } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  // Qué hacer con cada segmento.
  const ACCIONES: Record<string, { icono: string, accion: string }> = {
    'Campeones': { icono: 'mdi-trophy-outline', accion: 'Cuidarlos: atención preferente y novedades primero' },
    'Leales': { icono: 'mdi-heart-outline', accion: 'Programas de fidelidad y venta cruzada' },
    'Nuevos o prometedores': { icono: 'mdi-sprout-outline', accion: 'Acompañar las primeras compras' },
    'Necesitan atención': { icono: 'mdi-bell-outline', accion: 'Ofertas personalizadas para reactivarlos' },
    'En riesgo': { icono: 'mdi-alert-outline', accion: 'Contactar antes de perderlos' },
    'Perdidos o inactivos': { icono: 'mdi-sleep', accion: 'Campañas de recuperación de bajo costo' },
  }

  const { datos, cargando, error, recargar } = useConsulta(() => obtener<SegmentoRfm[]>('/clientes/rfm'))
  const filas = computed(() => datos.value ?? [])
  const totalClientes = computed(() => filas.value.reduce((s, f) => s + f.clientes, 0))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-account-star-outline"
    subtitulo="Recencia, frecuencia y monto de compra · todo el período"
    titulo="Segmentos RFM"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-list class="bg-transparent py-0" lines="three">
      <v-list-item v-for="f in filas" :key="f.segmento_rfm" class="px-2">
        <template #prepend>
          <v-avatar color="primary" rounded="lg" size="36" variant="tonal">
            <v-icon :icon="ACCIONES[f.segmento_rfm]?.icono ?? 'mdi-account'" size="20" />
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">{{ f.segmento_rfm }}</v-list-item-title>

        <v-list-item-subtitle>
          {{ fmtEntero(f.clientes) }} clientes ({{ fmtPct(totalClientes ? (100 * f.clientes) / totalClientes : null) }})
          · compran {{ fmtDecimal(f.frecuencia_promedio) }} veces · CLV {{ fmtMonedaCorta(f.clv_promedio) }}
        </v-list-item-subtitle>

        <div class="text-body-small text-medium-emphasis">{{ ACCIONES[f.segmento_rfm]?.accion }}</div>

        <template #append>
          <div class="text-end ms-2">
            <div class="font-weight-bold">{{ fmtPct(f.participacion_pct) }}</div>
            <div class="text-body-small text-medium-emphasis">de la venta</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </TarjetaPanel>
</template>
