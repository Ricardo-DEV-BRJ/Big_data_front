<script setup lang="ts">
  // Módulo Productos: ranking, Pareto ABC, categorías, marcas, precios y devoluciones.
  import Categorias from './components/Categorias.vue'
  import DevolucionesProductos from './components/DevolucionesProductos.vue'
  import KpisProductos from './components/KpisProductos.vue'
  import Marcas from './components/Marcas.vue'
  import ParetoAbc from './components/ParetoAbc.vue'
  import RangosPrecio from './components/RangosPrecio.vue'
  import RankingProductos from './components/RankingProductos.vue'
  import SinVentas from './components/SinVentas.vue'
</script>

<template>
  <KpisProductos />

  <v-row class="mt-1">
    <v-col cols="12" lg="7"><RankingProductos /></v-col>
    <v-col cols="12" lg="5"><Categorias /></v-col>
    <v-col cols="12" lg="7"><ParetoAbc /></v-col>
    <v-col cols="12" lg="5"><RangosPrecio /></v-col>
    <v-col cols="12" lg="7"><Marcas /></v-col>
    <v-col cols="12" lg="5"><DevolucionesProductos /></v-col>
    <v-col cols="12"><SinVentas /></v-col>
  </v-row>
</template>
