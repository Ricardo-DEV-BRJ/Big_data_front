<script setup lang="ts">
  /**
   * Envoltorio de <apexchart>. vue3-apexcharts clona las opciones con JSON al
   * actualizarlas y se pierden las funciones (formateadores de ejes y tooltips);
   * por eso, cuando cambian los datos o las opciones, el gráfico se vuelve a montar.
   */
  import type { ApexOptions } from 'apexcharts'
  import { onMounted, ref, watch } from 'vue'

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

  // Guarda para no renderizar ApexCharts antes de que el DOM esté disponible.
  // El error "Cannot read properties of null (reading 'hidden')" ocurre cuando
  // ApexCharts trata de medir elementos del DOM durante el primer flush reactivo
  // antes de que el componente esté montado en el árbol real.
  const montado = ref(false)
  onMounted(() => {
    montado.value = true
  })

  watch(() => [props.opciones, props.series, props.tipo], () => {
    clave.value++
  })
</script>

<template>
  <div :aria-label="descripcion" role="img">
    <apexchart
      v-if="montado"
      :key="clave"
      :height="alto"
      :options="opciones"
      :series="series"
      :type="tipo"
    />
  </div>
</template>
