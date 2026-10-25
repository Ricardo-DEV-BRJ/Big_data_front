<script setup lang="ts">
  // Indicadores de ventas: de la venta bruta a la neta, impuestos y precio.
  import type { Resumen } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const { datos, cargando } = useConsulta(() => obtener<Resumen>('/resumen', filtros.value))

  const kpis = computed(() => {
    const r = datos.value
    return [
      { titulo: 'Venta bruta', valor: fmtMonedaCorta(r?.venta_bruta), detalle: 'A precio de lista, sin IVA', icono: 'mdi-tag-outline' },
      { titulo: 'Descuentos', valor: fmtMonedaCorta(r?.descuento), detalle: `${fmtPct(r?.descuento_pct)} de la venta bruta`, icono: 'mdi-sale-outline' },
      { titulo: 'IVA facturado', valor: fmtMonedaCorta(r?.iva), detalle: `Total con IVA ${fmtMonedaCorta(r?.total)}`, icono: 'mdi-bank-outline' },
      { titulo: 'Venta neta por día', valor: fmtMoneda(r?.venta_neta_diaria), detalle: `${fmtEntero(r?.dias)} días con ventas`, icono: 'mdi-calendar-today-outline' },
      { titulo: 'Transacciones', valor: fmtEntero(r?.transacciones), detalle: `${fmtEntero(r?.ventas_credito)} a crédito`, icono: 'mdi-receipt-text-outline' },
      { titulo: 'Unidades por venta', valor: fmtDecimal(r?.unidades_por_venta), detalle: `${fmtEntero(r?.unidades)} unidades`, icono: 'mdi-package-variant' },
      { titulo: 'Precio promedio', valor: fmtMoneda(r?.precio_promedio_ponderado, true), detalle: 'Venta neta ÷ unidades', icono: 'mdi-scale-balance' },
      { titulo: 'Anulaciones', valor: fmtEntero(r?.anuladas), detalle: `${fmtMonedaCorta(r?.monto_anulado)} anulados`, icono: 'mdi-cancel' },
    ]
  })
</script>

<template>
  <v-row>
    <v-col v-for="k in kpis" :key="k.titulo" cols="6" lg="3">
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
