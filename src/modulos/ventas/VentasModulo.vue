<script setup lang="ts">
  // Módulo Ventas: evolución, estacionalidad, horas pico, avance del mes, descuentos e IVA.
  import { GRUPOS, usuarioActual } from '@/services/auth'
  import AvanceMes from './components/AvanceMes.vue'
  import CrecimientoMensual from './components/CrecimientoMensual.vue'
  import Descuentos from './components/Descuentos.vue'
  import DiaSemana from './components/DiaSemana.vue'
  import Fiscal from './components/Fiscal.vue'
  import KpisVentas from './components/KpisVentas.vue'
  import MapaHoras from './components/MapaHoras.vue'
  import Quincenas from './components/Quincenas.vue'
  import SerieVentas from './components/SerieVentas.vue'

  // Descuentos usa /metricas/descuentos, que es del área de finanzas.
  const usuario = usuarioActual()
  const verDescuentos = !!usuario && GRUPOS.finanzas.includes(usuario.rol)
</script>

<template>
  <KpisVentas />

  <v-row class="mt-1">
    <v-col cols="12" lg="8"><SerieVentas /></v-col>
    <v-col cols="12" lg="4"><Quincenas /></v-col>
    <v-col cols="12" lg="6"><AvanceMes /></v-col>
    <v-col cols="12" lg="6"><CrecimientoMensual /></v-col>
    <v-col cols="12" lg="4"><DiaSemana /></v-col>
    <v-col cols="12" lg="8"><MapaHoras /></v-col>
    <v-col v-if="verDescuentos" cols="12" lg="6"><Descuentos /></v-col>
    <v-col cols="12" lg="6"><Fiscal /></v-col>
  </v-row>
</template>
