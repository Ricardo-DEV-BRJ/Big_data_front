<script setup lang="ts">
  // Módulo Clientes: actividad, segmentos, RFM, retención, concentración y ficha de clientes.
  // Los morosos están en el módulo Cobranza.
  import Cohortes from './components/Cohortes.vue'
  import Concentracion from './components/Concentracion.vue'
  import KpisClientes from './components/KpisClientes.vue'
  import NuevosRecurrentes from './components/NuevosRecurrentes.vue'
  import SegmentosRfm from './components/SegmentosRfm.vue'
  import TablaClientes from './components/TablaClientes.vue'
  import TiposCliente from './components/TiposCliente.vue'
</script>

<template>
  <KpisClientes />

  <v-row class="mt-1">
    <v-col cols="12" lg="8"><NuevosRecurrentes /></v-col>
    <v-col cols="12" lg="4"><Concentracion /></v-col>
    <v-col cols="12"><TiposCliente /></v-col>
    <v-col cols="12" lg="5"><SegmentosRfm /></v-col>
    <v-col cols="12" lg="7"><Cohortes /></v-col>
    <v-col cols="12"><TablaClientes /></v-col>
  </v-row>
</template>
