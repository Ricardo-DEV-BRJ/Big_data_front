<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  // Cada layout (p. ej. PanelLayout) define su menú, barra superior y v-main.
</script>

<style>
/* Montos y fechas de las tablas en una sola línea. */
.v-data-table td {
  white-space: nowrap;
}
</style>
