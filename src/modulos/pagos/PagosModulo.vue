<script setup lang="ts">
  // Módulo Pagos y monedas: tasas BCV/USDT/EUR con sus alertas, margen negativo, métodos
  // de pago, comisiones y dólares vs bolívares.
  import CostosCobro from './components/CostosCobro.vue'
  import KpisPagos from './components/KpisPagos.vue'
  import MargenNegativo from './components/MargenNegativo.vue'
  import MetodosPago from './components/MetodosPago.vue'
  import MonedaMensual from './components/MonedaMensual.vue'
  import TasaCambio from './components/TasaCambio.vue'
  import TasasVigentes from './components/TasasVigentes.vue'
</script>

<template>
  <KpisPagos />

  <v-row class="mt-1">
    <v-col cols="12" lg="7"><TasasVigentes /></v-col>
    <v-col cols="12" lg="5"><MargenNegativo /></v-col>
    <v-col cols="12" lg="7"><MetodosPago /></v-col>
    <v-col cols="12" lg="5"><CostosCobro /></v-col>
    <v-col cols="12" lg="6"><MonedaMensual /></v-col>
    <v-col cols="12" lg="6"><TasaCambio /></v-col>
  </v-row>
</template>
