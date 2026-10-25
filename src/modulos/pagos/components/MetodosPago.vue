<script setup lang="ts">
  // Mezcla de métodos de pago (dona) con su detalle de comisiones.
  import type { MetodoPago } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros, opciones: opcionesFiltro } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<MetodoPago[]>('/pagos', filtros.value))
  const { opciones, series } = useGrafico()

  const filas = computed(() => datos.value ?? [])
  const total = computed(() => filas.value.reduce((s, f) => s + f.total, 0))
  // Cada método conserva su color (posición en la lista fija de métodos).
  function color (metodo: string): string {
    const lista = opcionesFiltro.value?.metodos_pago ?? []
    return series.value[Math.max(0, lista.indexOf(metodo)) % series.value.length]!
  }

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'donut' },
    labels: filas.value.map(f => f.metodo_pago),
    colors: filas.value.map(f => color(f.metodo_pago)),
    stroke: { width: 2, colors: ['rgb(var(--v-theme-surface))'] },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            value: { formatter: (v: string) => fmtMonedaCorta(Number(v)) },
            total: { show: true, label: 'Facturado', formatter: () => fmtMonedaCorta(total.value) },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v: number) => `${fmtMoneda(v)} · ${fmtPct(total.value ? (100 * v) / total.value : null)}` } },
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-credit-card-outline"
    subtitulo="Total facturado por método de pago"
    titulo="Métodos de pago"
    :vacio="filas.length === 0"
    @reintentar="recargar"
  >
    <v-row align="center" class="ma-0">
      <v-col class="pa-0" cols="12" md="5">
        <Grafico
          :alto="260"
          descripcion="Dona del total facturado por método de pago"
          :opciones="opcionesGrafico"
          :series="filas.map(f => f.total)"
          tipo="donut"
        />
      </v-col>

      <v-col class="pa-0" cols="12" md="7">
        <v-list class="bg-transparent py-0" density="compact">
          <v-list-item v-for="f in filas" :key="f.metodo_pago" class="px-2">
            <template #prepend>
              <span class="punto me-3" :style="{ background: color(f.metodo_pago) }" />
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ f.metodo_pago }} <v-chip class="ms-1" rounded="lg" size="x-small" variant="tonal">{{ f.moneda }}</v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="subtitulo">
              {{ fmtEntero(f.transacciones) }} ventas · ticket {{ fmtMoneda(f.ticket_promedio) }} · comisión {{ fmtPct(f.comision_pct, 2) }}
            </v-list-item-subtitle>

            <template #append>
              <div class="text-end">
                <div class="font-weight-bold">{{ fmtPct(f.participacion_pct) }}</div>
                <div class="text-body-small text-medium-emphasis">{{ fmtMonedaCorta(f.total) }}</div>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </TarjetaPanel>
</template>

<style scoped>
.subtitulo {
  white-space: normal;
  -webkit-line-clamp: unset;
}

.punto {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
