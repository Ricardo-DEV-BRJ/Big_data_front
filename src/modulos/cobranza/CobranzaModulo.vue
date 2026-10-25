<script setup lang="ts">
  // Módulo Cobranza: cartera, antigüedad, días de cobro, flujo esperado y deudores.
  import Antiguedad from './components/Antiguedad.vue'
  import AntiguedadTipo from './components/AntiguedadTipo.vue'
  import CarteraSucursal from './components/CarteraSucursal.vue'
  import Deudores from './components/Deudores.vue'
  import DiasCobro from './components/DiasCobro.vue'
  import FlujoProyectado from './components/FlujoProyectado.vue'
  import KpisCobranza from './components/KpisCobranza.vue'
</script>

<template>
  <KpisCobranza />

  <v-row class="mt-1">
    <v-col cols="12" lg="6"><Antiguedad /></v-col>
    <v-col cols="12" lg="6"><AntiguedadTipo /></v-col>
    <v-col cols="12" lg="6"><FlujoProyectado /></v-col>
    <v-col cols="12" lg="6"><DiasCobro /></v-col>
    <v-col cols="12" lg="4"><CarteraSucursal /></v-col>
    <v-col cols="12" lg="8"><Deudores /></v-col>
  </v-row>
</template>
