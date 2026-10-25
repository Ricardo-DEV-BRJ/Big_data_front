<script setup lang="ts">
  // Indicadores de cobranza: lo que falta cobrar, lo vencido, cuánto se tarda en cobrar y la morosidad.
  import type { Antiguedad, MesCobranza, Resumen } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtMes, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros, estado } = useFiltros()
  const resumen = useConsulta(() => obtener<Resumen>('/resumen', filtros.value))
  const antiguedad = useConsulta(() => obtener<Antiguedad>('/cobranza/antiguedad', { sucursal: estado.sucursal }))
  const dso = useConsulta(() => obtener<MesCobranza[]>('/cobranza/dso', filtros.value))

  const kpis = computed(() => {
    const r = resumen.datos.value
    const tramos = antiguedad.datos.value?.tramos ?? []
    const cartera = tramos.reduce((s, t) => s + t.monto, 0)
    const vencido = tramos.filter(t => t.orden_tramo > 1).reduce((s, t) => s + t.monto, 0)
    const meses = dso.datos.value ?? []
    const cobradas = meses.reduce((s, m) => s + m.facturas_cobradas, 0)
    const dias = cobradas ? meses.reduce((s, m) => s + (m.dias_cobro_promedio ?? 0) * m.facturas_cobradas, 0) / cobradas : null
    const etiquetas = meses.map(m => fmtMes(m.mes))
    return [
      {
        titulo: 'Cartera por cobrar',
        valor: fmtMonedaCorta(cartera),
        detalle: 'Saldo pendiente a la fecha de corte',
        icono: 'mdi-cash-clock',
        serie: meses.map(m => m.pendiente),
        etiquetas,
        formato: fmtMonedaCorta,
      },
      {
        titulo: 'Vencido',
        valor: fmtMonedaCorta(vencido),
        detalle: `${fmtPct(cartera ? (100 * vencido) / cartera : null)} de la cartera`,
        icono: 'mdi-alert-circle-outline',
        serie: meses.map(m => m.monto_vencido),
        etiquetas,
        formato: fmtMonedaCorta,
        tipo: 'bar' as const,
      },
      {
        titulo: 'Días de cobro',
        valor: dias === null ? '—' : `${fmtDecimal(Math.round(dias * 10) / 10)} días`,
        detalle: 'Promedio entre venta y pago de las ventas a crédito',
        icono: 'mdi-timer-sand',
        serie: meses.map(m => m.dias_cobro_promedio ?? 0),
        etiquetas,
        formato: (v: number) => `${fmtDecimal(v)} días`,
      },
      {
        titulo: 'Tasa de cobro',
        valor: fmtPct(r?.tasa_cobro_pct),
        detalle: `Cobrado ${fmtMonedaCorta(r?.cobrado)} de lo facturado en el período`,
        icono: 'mdi-cash-check',
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
        :cargando="antiguedad.cargando.value"
        :detalle="k.detalle"
        :etiquetas="k.etiquetas"
        :formato-serie="k.formato"
        :icono="k.icono"
        :serie="k.serie"
        :tipo-serie="k.tipo ?? 'area'"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
