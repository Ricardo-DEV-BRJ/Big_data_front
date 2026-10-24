<script setup lang="ts">
  // Módulo Resumen: vista general del negocio en el período elegido.
  import EvolucionVentas from './components/EvolucionVentas.vue'
  import KpisResumen from './components/KpisResumen.vue'
  import MetaMes from './components/MetaMes.vue'
  import TopProductos from './components/TopProductos.vue'
  import VentasSegmento from './components/VentasSegmento.vue'
  import VentasSucursal from './components/VentasSucursal.vue'
</script>

<template>
  <KpisResumen />

  <v-row class="mt-1">
    <v-col cols="12" lg="8"><EvolucionVentas /></v-col>
    <v-col cols="12" lg="4"><MetaMes /></v-col>
    <v-col cols="12" lg="4" md="6"><VentasSegmento /></v-col>
    <v-col cols="12" lg="4" md="6"><VentasSucursal /></v-col>
    <v-col cols="12" lg="4"><TopProductos /></v-col>
  </v-row>
</template>
