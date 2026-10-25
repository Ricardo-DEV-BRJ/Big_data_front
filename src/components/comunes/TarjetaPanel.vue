<script setup lang="ts">
  /**
   * Tarjeta contenedora de cada bloque del panel: título, subtítulo, acciones
   * (selectores propios del bloque) y estados de carga, error y sin datos.
   */
  defineProps<{
    titulo: string
    subtitulo?: string
    icono?: string
    cargando?: boolean
    error?: string
    vacio?: boolean
    alto?: number | string
  }>()

  defineEmits<{ reintentar: [] }>()
</script>

<template>
  <v-card class="tarjeta-panel h-100 d-flex flex-column" elevation="0" rounded="lg">
    <div class="d-flex flex-wrap align-start ga-3 px-5 pt-5 pb-2">
      <div class="d-flex align-start ga-3 encabezado">
        <v-avatar
          v-if="icono"
          color="primary"
          rounded="lg"
          size="36"
          variant="tonal"
        >
          <v-icon :icon="icono" size="20" />
        </v-avatar>

        <div class="min-w-0">
          <h3 class="text-title-medium font-weight-bold">{{ titulo }}</h3>
          <div v-if="subtitulo" class="text-body-small text-medium-emphasis">{{ subtitulo }}</div>
        </div>
      </div>
      <!-- Los controles propios del bloque bajan de línea si no caben junto al título. -->
      <div v-if="$slots.acciones" class="d-flex flex-wrap align-center ga-2 ms-auto">
        <slot name="acciones" />
      </div>
    </div>

    <div class="flex-grow-1 px-3 pb-3 position-relative" :style="alto ? { minHeight: `${alto}px` } : undefined">
      <v-progress-linear v-if="cargando" class="position-absolute top-0" color="primary" indeterminate />

      <v-alert
        v-if="error"
        class="ma-2"
        density="compact"
        :text="error"
        type="error"
        variant="tonal"
      >
        <template #append>
          <v-btn size="small" variant="text" @click="$emit('reintentar')">Reintentar</v-btn>
        </template>
      </v-alert>

      <v-empty-state
        v-else-if="vacio && !cargando"
        icon="mdi-chart-box-outline"
        size="48"
        text="No hay datos para el período o los filtros elegidos."
        title="Sin datos"
      />

      <slot v-else />
    </div>
  </v-card>
</template>

<style scoped>
.tarjeta-panel {
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.encabezado {
  flex: 1 1 260px;
  min-width: 0;
}

.min-w-0 {
  min-width: 0;
}
</style>
