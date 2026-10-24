<script setup lang="ts">
  /**
   * Envoltorio de <apexchart>. vue3-apexcharts clona las opciones con JSON al
   * actualizarlas y se pierden las funciones (formateadores de ejes y tooltips);
   * por eso, cuando cambian los datos o las opciones, el gráfico se vuelve a montar.
   */
  import type { ApexOptions } from 'apexcharts'
  import { ref, watch } from 'vue'

  const props = withDefaults(defineProps<{
    tipo: string
    opciones: ApexOptions
    series: unknown[]
    alto?: number | string
    descripcion?: string
  }>(), {
    alto: 300,
    descripcion: undefined,
  })

  const clave = ref(0)
  watch(() => [props.opciones, props.series, props.tipo], () => {
    clave.value++
  })
</script>

<template>
  <div :aria-label="descripcion" role="img">
    <apexchart
      :key="clave"
      :height="alto"
      :options="opciones"
      :series="series"
      :type="tipo"
    />
  </div>
</template>
