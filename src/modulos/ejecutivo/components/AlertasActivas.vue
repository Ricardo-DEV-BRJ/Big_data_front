<script setup lang="ts">
  // Alertas activas: inventario bajo el mínimo o por reordenar, perecederos en riesgo
  // de vencimiento y posibles ventas duplicadas.
  import type { Ejecutivo } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'

  const ICONOS: Record<string, string> = {
    Inventario: 'mdi-package-variant',
    Vencimiento: 'mdi-timer-sand',
    Duplicados: 'mdi-content-duplicate',
    Tasa: 'mdi-clock-alert-outline',
    Margen: 'mdi-trending-down',
  }

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Ejecutivo>('/ejecutivo', filtros.value))
  const alertas = computed(() => datos.value?.alertas ?? [])
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-bell-alert-outline"
    :subtitulo="`${alertas.length} alertas · existencias al cierre de los datos`"
    titulo="Alertas activas"
    :vacio="alertas.length === 0"
    @reintentar="recargar"
  >
    <v-list class="bg-transparent lista" density="compact" lines="two">
      <v-list-item v-for="(a, i) in alertas" :key="i" :subtitle="a.detalle" :title="a.titulo">
        <template #prepend>
          <v-avatar :color="a.nivel === 'alta' ? 'error' : 'warning'" size="32" variant="tonal">
            <v-icon :icon="ICONOS[a.tipo] ?? 'mdi-alert-outline'" size="18" />
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
  </TarjetaPanel>
</template>

<style scoped>
.lista {
  max-height: 380px;
  overflow-y: auto;
}
</style>
