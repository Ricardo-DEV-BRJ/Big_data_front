<script setup lang="ts">
  // Cumplimiento de la meta por sucursal: medidores radiales como en los dashboards de ApexCharts.
  import type { Sucursal } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { ESTADO, useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { rango } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Sucursal[]>('/sucursales', rango.value))
  const { opciones, tinta } = useGrafico()

  const filas = computed(() => (datos.value ?? []).filter(s => s.cumplimiento_pct !== null))

  // Estado según cumplimiento: siempre acompañado de su texto.
  function nivel (c: number | null) {
    if (c === null) {
      return { color: tinta.value.suave, texto: 'Sin meta', icono: 'mdi-help-circle-outline' }
    }
    if (c >= 100) {
      return { color: ESTADO.bien, texto: 'Cumplida', icono: 'mdi-check-circle' }
    }
    if (c >= 90) {
      return { color: ESTADO.atencion, texto: 'Cerca', icono: 'mdi-alert' }
    }
    return { color: ESTADO.critico, texto: 'Por debajo', icono: 'mdi-alert-octagon' }
  }

  function opcionesMedidor (s: Sucursal) {
    return opciones({
      chart: { type: 'radialBar', sparkline: { enabled: true } },
      colors: [nivel(s.cumplimiento_pct).color],
      plotOptions: {
        radialBar: {
          hollow: { size: '58%' },
          track: { background: tinta.value.rejilla },
          dataLabels: {
            name: { show: false },
            value: { offsetY: 6, fontSize: '15px', fontWeight: 700, formatter: () => fmtPct(s.cumplimiento_pct) },
          },
        },
      },
      stroke: { lineCap: 'round' },
    })
  }
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-store-check-outline"
    subtitulo="Venta neta del período contra la suma de metas de sus vendedores"
    titulo="Cumplimiento por sucursal"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-row density="compact">
      <v-col v-for="s in filas" :key="s.sucursal" cols="6" sm="4">
        <div class="text-center">
          <Grafico
            :alto="120"
            :descripcion="`Cumplimiento de ${s.sucursal}`"
            :opciones="opcionesMedidor(s)"
            :series="[Math.min(s.cumplimiento_pct ?? 0, 100)]"
            tipo="radialBar"
          />

          <div class="text-body-medium font-weight-medium">{{ s.sucursal }}</div>
          <div class="text-body-small text-medium-emphasis">{{ fmtMonedaCorta(s.venta_neta) }} de {{ fmtMonedaCorta(s.meta) }}</div>

          <div class="d-inline-flex align-center ga-1 text-label-medium font-weight-bold" :style="{ color: nivel(s.cumplimiento_pct).color }">
            <v-icon :icon="nivel(s.cumplimiento_pct).icono" size="14" /> {{ nivel(s.cumplimiento_pct).texto }}
          </div>
        </div>
      </v-col>
    </v-row>
  </TarjetaPanel>
</template>
