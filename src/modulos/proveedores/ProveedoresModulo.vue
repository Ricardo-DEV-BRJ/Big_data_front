<script setup lang="ts">
  // Módulo Proveedores: compras, puntualidad y margen de los productos de cada proveedor.
  import CompraVsVenta from './components/CompraVsVenta.vue'
  import KpisProveedores from './components/KpisProveedores.vue'
  import Puntualidad from './components/Puntualidad.vue'
  import TablaProveedores from './components/TablaProveedores.vue'
</script>

<template>
  <KpisProveedores />

  <v-row class="mt-1">
    <v-col cols="12" lg="6"><Puntualidad /></v-col>
    <v-col cols="12" lg="6"><CompraVsVenta /></v-col>
    <v-col cols="12"><TablaProveedores /></v-col>
  </v-row>
</template>
