<script setup lang="ts">
  // Matriz de rotación: productos de cada categoría en las clases A (alta), M (media) y
  // B (baja) según IR = unidades vendidas ÷ inventario promedio, por terciles (fórmula 3).
  import type { ClaseRotacion, Reposicion } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero } from '@/utils/formato'

  const CLASES: { clase: ClaseRotacion, titulo: string, color: string }[] = [
    { clase: 'A', titulo: 'A · Alta', color: 'success' },
    { clase: 'M', titulo: 'M · Media', color: 'warning' },
    { clase: 'B', titulo: 'B · Baja', color: 'error' },
  ]

  const { estado } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtener<Reposicion>('/inventario/reposicion', { sucursal: estado.sucursal, limite: 1 }),
  )

  const categorias = computed(() => {
    const filas = new Map<string, Record<ClaseRotacion, number>>()
    for (const m of datos.value?.matriz ?? []) {
      const fila = filas.get(m.categoria) ?? { A: 0, M: 0, B: 0 }
      fila[m.clase_rotacion] = m.productos
      filas.set(m.categoria, fila)
    }
    return [...filas.entries()].map(([categoria, c]) => ({ categoria, ...c }))
  })
  const resumen = computed(() => Object.fromEntries((datos.value?.clases ?? []).map(c => [c.clase_rotacion, c])))
  const maximo = computed(() => Math.max(1, ...categorias.value.flatMap(c => [c.A, c.M, c.B])))
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-grid"
    subtitulo="Productos por categoría y clase de rotación (terciles) · todo el período"
    titulo="Matriz de rotación"
    :vacio="categorias.length === 0"
    @reintentar="recargar"
  >
    <v-table class="bg-transparent" density="compact">
      <thead>
        <tr>
          <th>Categoría</th>
          <th v-for="c in CLASES" :key="c.clase" class="text-center">{{ c.titulo }}</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="fila in categorias" :key="fila.categoria">
          <td>{{ fila.categoria }}</td>

          <td v-for="c in CLASES" :key="c.clase" class="text-center">
            <v-chip
              v-if="fila[c.clase] > 0"
              :color="c.color"
              size="small"
              :style="{ opacity: 0.45 + 0.55 * fila[c.clase] / maximo }"
              variant="flat"
            >
              {{ fila[c.clase] }}
            </v-chip>

            <span v-else class="text-medium-emphasis">·</span>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <td class="text-body-small text-medium-emphasis">IR promedio</td>

          <td v-for="c in CLASES" :key="c.clase" class="text-center text-body-small text-medium-emphasis">
            {{ resumen[c.clase] ? `${fmtDecimal(resumen[c.clase]!.indice_promedio)}× · ${fmtEntero(resumen[c.clase]!.productos)} prod.` : '—' }}
          </td>
        </tr>
      </tfoot>
    </v-table>
  </TarjetaPanel>
</template>
