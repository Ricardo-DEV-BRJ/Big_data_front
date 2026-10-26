<script setup lang="ts">
  // Indicadores principales del período con su tendencia mensual.
  import type { PuntoMensual, Resumen } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMes, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const resumen = useConsulta(() => obtener<Resumen>('/resumen', filtros.value))
  const mensual = useConsulta(() => obtener<PuntoMensual[]>('/ventas/mensuales', filtros.value))

  const meses = computed(() => Array.isArray(mensual.datos.value) ? mensual.datos.value : [])
  const etiquetas = computed(() => meses.value.map(m => fmtMes(m.mes)))
  const serie = (f: (m: PuntoMensual) => number | null) => meses.value.map(m => Number(f(m) ?? 0))
  const ultimo = computed(() => meses.value.at(-1))

  const kpis = computed(() => {
    const r = resumen.datos.value
    return [
      {
        titulo: 'Venta neta',
        valor: fmtMonedaCorta(r?.venta_neta),
        detalle: `Sin IVA · ${fmtMoneda(r?.venta_neta_diaria)} por día`,
        icono: 'mdi-cash-multiple',
        variacion: ultimo.value?.crecimiento_pct ?? null,
        serie: serie(m => m.venta_neta),
        formato: fmtMoneda,
      },
      {
        titulo: 'Margen bruto',
        valor: fmtMonedaCorta(r?.margen),
        detalle: `${fmtPct(r?.margen_pct)} de la venta neta`,
        icono: 'mdi-trending-up',
        serie: serie(m => m.margen),
        formato: fmtMoneda,
      },
      {
        titulo: 'Ticket promedio',
        valor: fmtMoneda(r?.ticket_promedio),
        detalle: `${fmtEntero(r?.transacciones)} ventas · ${fmtDecimal(r?.unidades_por_venta)} u. por venta`,
        icono: 'mdi-receipt-text-outline',
        serie: serie(m => m.ticket_promedio),
        formato: (v: number) => fmtMoneda(v),
      },
      {
        titulo: 'Por cobrar',
        valor: fmtMonedaCorta(r?.por_cobrar),
        detalle: `Tasa de cobro ${fmtPct(r?.tasa_cobro_pct)}`,
        icono: 'mdi-cash-clock',
        serie: serie(m => m.pendiente),
        formato: fmtMoneda,
        tipo: 'bar' as const,
      },
    ]
  })

  const secundarios = computed(() => {
    const r = resumen.datos.value
    return [
      { titulo: 'Clientes activos', valor: fmtEntero(r?.clientes_unicos), detalle: 'Compraron en el período', icono: 'mdi-account-multiple-outline' },
      { titulo: 'Unidades vendidas', valor: fmtEntero(r?.unidades), detalle: `Precio promedio ${fmtMoneda(r?.precio_promedio_ponderado)}`, icono: 'mdi-package-variant' },
      { titulo: 'Devoluciones', valor: fmtPct(r?.tasa_devolucion_pct), detalle: `${fmtEntero(r?.devoluciones)} ventas · ${fmtMonedaCorta(r?.monto_devuelto)}`, icono: 'mdi-keyboard-return' },
      { titulo: 'Ventas en dólares', valor: fmtPct(r?.pct_usd), detalle: `${fmtMonedaCorta(r?.total_usd)} en USD · ${fmtMonedaCorta(r?.total_ves)} en Bs`, icono: 'mdi-currency-usd' },
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
        :cargando="resumen.cargando.value"
        :detalle="k.detalle"
        :etiquetas="etiquetas"
        :formato-serie="k.formato"
        :icono="k.icono"
        :serie="k.serie"
        :tipo-serie="k.tipo ?? 'area'"
        :titulo="k.titulo"
        :valor="k.valor"
        :variacion="k.variacion ?? null"
      />
    </v-col>

    <v-col
      v-for="k in secundarios"
      :key="k.titulo"
      cols="12"
      lg="3"
      sm="6"
    >
      <TarjetaKpi
        :cargando="resumen.cargando.value"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>

  <v-alert
    v-if="resumen.error.value"
    class="mt-4"
    :text="resumen.error.value"
    type="error"
    variant="tonal"
  />
</template>
