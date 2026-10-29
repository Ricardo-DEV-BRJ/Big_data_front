<script setup lang="ts">
  // Módulo Tablero ejecutivo: reproduce el prototipo de la Figura 18 del Capítulo VI.
  import AlertasActivas from './components/AlertasActivas.vue'
  import FrecuenciaSegmento from './components/FrecuenciaSegmento.vue'
  import KpisEjecutivo from './components/KpisEjecutivo.vue'
  import MatrizRotacion from './components/MatrizRotacion.vue'
  import VentasPrevision from './components/VentasPrevision.vue'
</script>

<template>
  <KpisEjecutivo />

  <v-row class="mt-1">
    <v-col cols="12" lg="8"><VentasPrevision /></v-col>
    <v-col cols="12" lg="4"><AlertasActivas /></v-col>
    <v-col cols="12" lg="6"><MatrizRotacion /></v-col>
    <v-col cols="12" lg="6"><FrecuenciaSegmento /></v-col>
  </v-row>
</template>
