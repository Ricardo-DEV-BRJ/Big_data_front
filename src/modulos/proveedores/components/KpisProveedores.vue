<script setup lang="ts">
  // Indicadores de compras: monto comprado, órdenes en tránsito, puntualidad y tiempo de entrega.
  import type { Proveedor } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { datos, cargando } = useConsulta(() => obtener<Proveedor[]>('/proveedores'))

  const kpis = computed(() => {
    const p = datos.value ?? []
    const recibidas = p.reduce((s, x) => s + x.ordenes_recibidas, 0)
    const tarde = p.reduce((s, x) => s + x.entregas_tarde, 0)
    const dias = recibidas ? p.reduce((s, x) => s + (x.dias_entrega_promedio ?? 0) * x.ordenes_recibidas, 0) / recibidas : null
    const peor = [...p].toSorted((a, b) => (b.pct_entregas_tarde ?? 0) - (a.pct_entregas_tarde ?? 0))[0]
    return [
      {
        titulo: 'Compras',
        valor: fmtMonedaCorta(p.reduce((s, x) => s + x.monto_comprado, 0)),
        detalle: `${fmtEntero(p.reduce((s, x) => s + x.ordenes, 0))} órdenes a ${fmtEntero(p.length)} proveedores`,
        icono: 'mdi-cart-arrow-down',
      },
      {
        titulo: 'En tránsito',
        valor: fmtEntero(p.reduce((s, x) => s + x.ordenes_en_transito, 0)),
        detalle: 'Órdenes aún no recibidas',
        icono: 'mdi-truck-fast-outline',
      },
      {
        titulo: 'Entregas tardías',
        valor: fmtPct(recibidas ? (100 * tarde) / recibidas : null),
        detalle: peor ? `Peor: ${peor.proveedor} (${fmtPct(peor.pct_entregas_tarde)})` : '',
        icono: 'mdi-clock-alert-outline',
      },
      {
        titulo: 'Tiempo de entrega',
        valor: dias === null ? '—' : `${fmtDecimal(Math.round(dias * 10) / 10)} días`,
        detalle: 'Promedio entre la orden y la recepción',
        icono: 'mdi-timer-outline',
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
      lg="3"
      sm="6"
    >
      <TarjetaKpi
        :cargando="cargando"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
