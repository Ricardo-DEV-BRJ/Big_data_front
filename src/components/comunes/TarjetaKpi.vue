<script setup lang="ts">
  /**
   * Indicador con valor grande, variación y, opcionalmente, una mini serie
   * (sparkline) al estilo de los dashboards de ApexCharts.
   */
  import type { ApexOptions } from 'apexcharts'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import { useGrafico } from '@/composables/useGrafico'
  import { fmtVariacion } from '@/utils/formato'

  const props = withDefaults(defineProps<{
    titulo: string
    valor: string
    detalle?: string
    icono?: string
    // Variación en %; positiva se pinta como buena salvo que "inverso" sea true (p. ej. morosidad).
    variacion?: number | null
    inverso?: boolean
    // Valores de la mini serie y sus etiquetas (meses, días).
    serie?: number[]
    etiquetas?: string[]
    formatoSerie?: (v: number) => string
    tipoSerie?: 'area' | 'bar'
    cargando?: boolean
  }>(), {
    detalle: undefined,
    icono: undefined,
    variacion: null,
    serie: undefined,
    etiquetas: undefined,
    formatoSerie: undefined,
    tipoSerie: 'area',
  })

  const { opciones, series } = useGrafico()

  const sentido = computed(() => {
    if (props.variacion == null || props.variacion === 0) {
      return 'neutro'
    }
    return (props.variacion > 0) === props.inverso ? 'malo' : 'bueno'
  })

  const opcionesSerie = computed<ApexOptions>(() => opciones({
    chart: { sparkline: { enabled: true }, animations: { enabled: false } },
    colors: [series.value[0]!],
    stroke: { width: 2, curve: 'smooth' },
    fill: props.tipoSerie === 'area'
      ? { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] } }
      : { opacity: 1 },
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 2 } },
    labels: props.etiquetas,
    xaxis: { labels: { show: false }, crosshairs: { width: 1 } },
    yaxis: { show: false },
    tooltip: {
      fixed: { enabled: false },
      marker: { show: false },
      x: { show: true },
      y: {
        title: { formatter: () => '' },
        formatter: (v: number) => (props.formatoSerie ? props.formatoSerie(v) : String(v)),
      },
    },
  }))
</script>

<template>
  <v-card class="tarjeta-kpi h-100" elevation="0" rounded="lg">
    <v-card-text class="pa-5 d-flex flex-column h-100">
      <div class="d-flex align-center justify-space-between ga-2">
        <span class="text-body-medium font-weight-medium text-medium-emphasis">{{ titulo }}</span>

        <v-avatar
          v-if="icono"
          color="primary"
          rounded="lg"
          size="34"
          variant="tonal"
        >
          <v-icon :icon="icono" size="18" />
        </v-avatar>
      </div>

      <v-skeleton-loader v-if="cargando && !valor" class="bg-transparent mt-2" type="heading" />

      <div v-else class="d-flex align-end flex-wrap ga-2 mt-2">
        <span class="valor text-headline-small font-weight-bold" :title="valor">{{ valor }}</span>

        <span
          v-if="variacion !== null && variacion !== undefined"
          class="variacion text-label-large font-weight-bold mb-1"
          :class="`variacion--${sentido}`"
        >
          <v-icon
            :icon="variacion > 0 ? 'mdi-arrow-up' : variacion < 0 ? 'mdi-arrow-down' : 'mdi-minus'"
            size="14"
          />
          {{ fmtVariacion(variacion) }}
        </span>
      </div>

      <div v-if="detalle" class="text-body-small text-medium-emphasis mt-1">{{ detalle }}</div>

      <div v-if="serie && serie.length > 1" class="mt-auto pt-3">
        <Grafico
          :alto="48"
          :descripcion="`Tendencia de ${titulo}`"
          :opciones="opcionesSerie"
          :series="[{ name: titulo, data: serie }]"
          :tipo="tipoSerie"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.tarjeta-kpi {
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.valor {
  line-height: 1.15;
  word-break: break-word;
}

.variacion {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.variacion--bueno {
  color: #006300;
}

.variacion--malo {
  color: #d03b3b;
}

.variacion--neutro {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.v-theme--dark_JM .variacion--bueno {
  color: #0ca30c;
}

.v-theme--dark_JM .variacion--malo {
  color: #e66767;
}
</style>
