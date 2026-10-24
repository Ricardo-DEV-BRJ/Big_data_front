<script setup lang="ts">
  // Efecto de los días de cobro: promedio diario en días de quincena frente al resto.
  import type { GrupoQuincena, Quincenas } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMoneda, fmtVariacion } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<Quincenas>('/ventas/quincenas', filtros.value))

  function comparar (grupos: GrupoQuincena[], principal: string, otro: string) {
    const a = grupos.find(g => (g.grupo ?? g.quincena) === principal)
    const b = grupos.find(g => (g.grupo ?? g.quincena) === otro)
    if (!a || !b) {
      return null
    }
    return {
      a, b,
      diferencia: b.venta_neta_promedio_dia ? 100 * (a.venta_neta_promedio_dia / b.venta_neta_promedio_dia - 1) : null,
      maximo: Math.max(a.venta_neta_promedio_dia, b.venta_neta_promedio_dia),
    }
  }

  const bloques = computed(() => {
    const d = datos.value
    if (!d) {
      return []
    }
    return [
      { titulo: 'Días de cobro (1, 15, 16, 30 y fin de mes) frente al resto', datos: comparar(d.dias_de_cobro, 'Día de cobro', 'Resto del mes') },
      { titulo: 'Primera frente a segunda quincena', datos: comparar(d.quincenas, 'Primera quincena', 'Segunda quincena') },
    ].filter(b => b.datos)
  })
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-calendar-star"
    subtitulo="Venta neta promedio por día"
    titulo="Efecto quincena"
    :vacio="bloques.length === 0"
    @reintentar="recargar"
  >
    <div class="px-2">
      <div v-for="b in bloques" :key="b.titulo" class="mb-5">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-body-small text-medium-emphasis">{{ b.titulo }}</span>
          <v-chip color="primary" rounded="lg" size="small" variant="tonal">{{ fmtVariacion(b.datos!.diferencia) }}</v-chip>
        </div>

        <div v-for="g in [b.datos!.a, b.datos!.b]" :key="g.grupo ?? g.quincena" class="mb-2">
          <div class="d-flex justify-space-between text-body-medium">
            <span>{{ g.grupo ?? g.quincena }} <span class="text-medium-emphasis">· {{ fmtEntero(g.dias) }} días</span></span>
            <span class="font-weight-bold">{{ fmtMoneda(g.venta_neta_promedio_dia) }}</span>
          </div>

          <v-progress-linear
            class="mt-1"
            color="primary"
            height="8"
            :model-value="(100 * g.venta_neta_promedio_dia) / b.datos!.maximo"
            rounded
          />
        </div>
      </div>
    </div>
  </TarjetaPanel>
</template>
