<script setup lang="ts">
  // Módulo Calidad de datos: problemas detectados en los reportes, ventas duplicadas y estado de los recálculos.
  import Ejecuciones from './components/Ejecuciones.vue'
  import ReglasCalidad from './components/ReglasCalidad.vue'
  import TablaDuplicados from './components/TablaDuplicados.vue'
</script>

<template>
  <ReglasCalidad />

  <v-row class="mt-1">
    <v-col cols="12"><TablaDuplicados /></v-col>
    <v-col cols="12"><Ejecuciones /></v-col>
  </v-row>
</template>
