<script setup lang="ts">
  // Módulo Pagos y monedas: métodos de pago, comisiones, dólares vs bolívares y tasa de cambio.
  import CostosCobro from './components/CostosCobro.vue'
  import KpisPagos from './components/KpisPagos.vue'
  import MetodosPago from './components/MetodosPago.vue'
  import MonedaMensual from './components/MonedaMensual.vue'
  import TasaCambio from './components/TasaCambio.vue'
</script>

<template>
  <KpisPagos />

  <v-row class="mt-1">
    <v-col cols="12" lg="7"><MetodosPago /></v-col>
    <v-col cols="12" lg="5"><CostosCobro /></v-col>
    <v-col cols="12" lg="6"><MonedaMensual /></v-col>
    <v-col cols="12" lg="6"><TasaCambio /></v-col>
  </v-row>
</template>
