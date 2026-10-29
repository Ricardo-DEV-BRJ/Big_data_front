<script setup lang="ts">
  // Los seis indicadores de la Figura 18: ventas del día, margen bruto, productos bajo
  // stock mínimo, duplicados detectados y los dos de ecoeficiencia (fase futura).
  import type { Ejecutivo } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDia, fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando } = useConsulta(() => obtener<Ejecutivo>('/ejecutivo', filtros.value))

  const kpis = computed(() => {
    const d = datos.value
    const hoy = d?.ventas_dia
    const ayer = d?.ventas_dia_anterior
    const variacion = hoy && ayer?.venta_neta ? Math.round(10_000 * (hoy.venta_neta / ayer.venta_neta - 1)) / 100 : null
    return [
      {
        titulo: 'Ventas del día',
        valor: fmtMonedaCorta(hoy?.venta_neta ?? null),
        detalle: hoy ? `${fmtDia(hoy.fecha)} · ${fmtEntero(hoy.transacciones)} ventas` : 'Sin ventas registradas',
        icono: 'mdi-cash-register',
        variacion,
      },
      {
        titulo: 'Margen bruto',
        valor: fmtPct(d?.margen.margen_pct ?? null),
        detalle: `${fmtMonedaCorta(d?.margen.margen ?? null)} en el período`,
        icono: 'mdi-percent-outline',
      },
      {
        titulo: 'Bajo stock mínimo',
        valor: fmtEntero(d?.stock.bajo_minimo ?? null),
        detalle: `${fmtEntero(d?.stock.agotados ?? null)} agotados · ${fmtEntero(d?.stock.por_reordenar ?? null)} por reordenar`,
        icono: 'mdi-package-variant-remove',
      },
      {
        titulo: 'Duplicados detectados',
        valor: fmtEntero(d?.duplicados.posibles ?? null),
        detalle: `Posibles · ${fmtEntero(d?.duplicados.exactos ?? null)} exactos excluidos de las métricas`,
        icono: 'mdi-content-duplicate',
      },
      {
        titulo: 'Alertas ambientales',
        valor: '—',
        detalle: 'Fase futura: sensores de temperatura y humedad (ESP32/MQTT)',
        icono: 'mdi-thermometer-alert',
      },
      {
        titulo: 'Papel evitado',
        valor: '—',
        detalle: 'Fase futura: indicador de ecoeficiencia (Tabla 25)',
        icono: 'mdi-leaf',
      },
    ]
  })
</script>

<template>
  <v-row>
    <v-col
      v-for="k in kpis"
      :key="k.titulo"
      cols="12"
      lg="2"
      md="4"
      sm="6"
    >
      <TarjetaKpi
        :cargando="cargando"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
        :variacion="k.variacion ?? null"
      />
    </v-col>
  </v-row>
</template>
