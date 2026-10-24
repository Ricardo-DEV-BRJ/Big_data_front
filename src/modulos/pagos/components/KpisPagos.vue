<script setup lang="ts">
  // Indicadores de pagos: peso del dólar, comisiones bancarias, pérdida cambiaria y devaluación.
  import type { MetodoPago, Monedas, Resumen } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtMes, fmtMonedaCorta, fmtPct, fmtVariacion } from '@/utils/formato'

  const { filtros } = useFiltros()
  const resumen = useConsulta(() => obtener<Resumen>('/resumen', filtros.value))
  const pagos = useConsulta(() => obtener<MetodoPago[]>('/pagos', filtros.value))
  const monedas = useConsulta(() => obtener<Monedas>('/monedas', filtros.value))

  const kpis = computed(() => {
    const r = resumen.datos.value
    const metodos = pagos.datos.value ?? []
    const total = metodos.reduce((s, m) => s + m.total, 0)
    const comision = metodos.reduce((s, m) => s + m.comision_bancaria, 0)
    const perdida = metodos.reduce((s, m) => s + m.perdida_cambiaria, 0)
    const tasa = monedas.datos.value?.tasa ?? []
    const inicio = tasa[0]?.tasa_inicio
    const cierre = tasa.at(-1)?.tasa_cierre
    return [
      {
        titulo: 'Ventas en dólares',
        valor: fmtPct(r?.pct_usd),
        detalle: `${fmtMonedaCorta(r?.total_usd)} en USD · ${fmtMonedaCorta(r?.total_ves)} en Bs`,
        icono: 'mdi-currency-usd',
      },
      {
        titulo: 'Comisiones bancarias',
        valor: fmtMonedaCorta(comision),
        detalle: `${fmtPct(total ? (100 * comision) / total : null, 2)} de lo facturado`,
        icono: 'mdi-bank-transfer-out',
      },
      {
        titulo: 'Pérdida cambiaria',
        valor: fmtMonedaCorta(perdida),
        detalle: 'Ventas en Bs cobradas después, con la tasa más alta',
        icono: 'mdi-trending-down',
      },
      {
        titulo: 'Devaluación del período',
        valor: fmtVariacion(inicio && cierre ? 100 * (cierre / inicio - 1) : null),
        detalle: `De ${fmtDecimal(inicio)} a ${fmtDecimal(cierre)} Bs por USD`,
        icono: 'mdi-swap-horizontal',
        serie: tasa.map(t => t.tasa_promedio),
        etiquetas: tasa.map(t => fmtMes(t.mes)),
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
        :cargando="pagos.cargando.value"
        :detalle="k.detalle"
        :etiquetas="k.etiquetas"
        :formato-serie="(v: number) => `${fmtDecimal(v)} Bs`"
        :icono="k.icono"
        :serie="k.serie"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
