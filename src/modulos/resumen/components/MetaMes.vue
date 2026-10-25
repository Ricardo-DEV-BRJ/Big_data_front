<script setup lang="ts">
  // Avance del mes contra la meta: medidor radial con el cumplimiento proyectado.
  import type { Proyeccion } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { ESTADO, useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'
  import { fmtMes, fmtMoneda, fmtMonedaCorta, fmtPct, fmtVariacion } from '@/utils/formato'

  const { estado, mesActual } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Proyeccion | null>('/ventas/proyeccion', { mes: mesActual.value, sucursal: estado.sucursal }),
    () => mesActual.value,
  )
  const { opciones, tinta } = useGrafico()

  const p = computed(() => datos.value)
  const cumplimiento = computed(() => p.value?.cumplimiento_proyectado_pct ?? null)
  // El color comunica el estado (con su etiqueta al lado, nunca solo).
  const nivel = computed(() => {
    const c = cumplimiento.value
    if (c === null) {
      return { color: tinta.value.suave, texto: 'Sin meta cargada', icono: 'mdi-help-circle-outline' }
    }
    if (c >= 100) {
      return { color: ESTADO.bien, texto: 'En camino de cumplir', icono: 'mdi-check-circle' }
    }
    if (c >= 90) {
      return { color: ESTADO.atencion, texto: 'Cerca de la meta', icono: 'mdi-alert' }
    }
    return { color: ESTADO.critico, texto: 'Por debajo de la meta', icono: 'mdi-alert-octagon' }
  })

  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    colors: [nivel.value.color],
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: '62%' },
        track: { background: tinta.value.rejilla, strokeWidth: '100%' },
        dataLabels: {
          name: { offsetY: 22, fontSize: '13px', color: tinta.value.suave },
          value: { offsetY: -14, fontSize: '28px', fontWeight: 700, color: undefined, formatter: () => fmtPct(cumplimiento.value) },
        },
      },
    },
    stroke: { lineCap: 'round' },
    labels: ['Proyectado'],
  }))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-bullseye-arrow"
    :subtitulo="p ? `Cierre proyectado de ${fmtMes(p.mes)}` : 'Cierre proyectado del mes'"
    titulo="Meta del mes"
    :vacio="!p"
    @reintentar="recargar"
  >
    <template v-if="p">
      <Grafico :alto="210" :opciones="opcionesGrafico" :series="[Math.min(cumplimiento ?? 0, 100)]" tipo="radialBar" />

      <div class="d-flex align-center justify-center ga-1 text-label-large font-weight-bold mb-3" :style="{ color: nivel.color }">
        <v-icon :icon="nivel.icono" size="18" /> {{ nivel.texto }}
      </div>

      <v-list class="bg-transparent py-0" density="compact">
        <v-list-item title="Acumulado">
          <template #append><span class="font-weight-bold">{{ fmtMoneda(p.venta_neta_acumulada) }}</span></template>
        </v-list-item>

        <v-list-item title="Proyección de cierre">
          <template #append><span class="font-weight-bold">{{ fmtMoneda(p.venta_neta_proyectada) }}</span></template>
        </v-list-item>

        <v-list-item title="Meta">
          <template #append><span class="font-weight-bold">{{ fmtMoneda(p.meta) }}</span></template>
        </v-list-item>

        <v-list-item title="Contra el mes anterior">
          <template #append>
            <span class="font-weight-bold">{{ fmtVariacion(p.crecimiento_proyectado_pct) }} · {{ fmtMonedaCorta(p.venta_neta_mes_anterior) }}</span>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </TarjetaPanel>
</template>
