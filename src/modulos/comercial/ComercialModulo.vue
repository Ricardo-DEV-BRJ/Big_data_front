<script setup lang="ts">
  // Módulo Equipo comercial: vendedores, sucursales y cumplimiento de metas.
  import CumplimientoSucursal from './components/CumplimientoSucursal.vue'
  import KpisComercial from './components/KpisComercial.vue'
  import MetasMes from './components/MetasMes.vue'
  import TablaSucursales from './components/TablaSucursales.vue'
  import TablaVendedores from './components/TablaVendedores.vue'
  import VentaVsMeta from './components/VentaVsMeta.vue'
</script>

<template>
  <KpisComercial />

  <v-row class="mt-1">
    <v-col cols="12" lg="7"><VentaVsMeta /></v-col>
    <v-col cols="12" lg="5"><CumplimientoSucursal /></v-col>
    <v-col cols="12"><TablaVendedores /></v-col>
    <v-col cols="12" lg="5"><TablaSucursales /></v-col>
    <v-col cols="12" lg="7"><MetasMes /></v-col>
  </v-row>
</template>
