<script setup lang="ts">
  // Módulo Inventario: valor, rotación, quiebres de stock y venta perdida.
  import KpisInventario from './components/KpisInventario.vue'
  import QuiebresMensual from './components/QuiebresMensual.vue'
  import RotacionSucursal from './components/RotacionSucursal.vue'
  import TablaInventario from './components/TablaInventario.vue'
  import ValorMensual from './components/ValorMensual.vue'
</script>

<template>
  <KpisInventario />

  <v-row class="mt-1">
    <v-col cols="12" lg="7"><ValorMensual /></v-col>
    <v-col cols="12" lg="5"><RotacionSucursal /></v-col>
    <v-col cols="12"><QuiebresMensual /></v-col>
    <v-col cols="12"><TablaInventario /></v-col>
  </v-row>
</template>
