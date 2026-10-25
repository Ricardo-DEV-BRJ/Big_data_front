<script setup lang="ts">
  // Indicadores de la base de clientes: actividad, captación, concentración y valor.
  import type { Concentracion, NuevosRecurrentes, Resumen, SegmentoRfm } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMes, fmtMoneda, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const resumen = useConsulta(() => obtener<Resumen>('/resumen', filtros.value))
  const nuevos = useConsulta(() => obtener<NuevosRecurrentes[]>('/clientes/nuevos-recurrentes', filtros.value))
  const concentracion = useConsulta(() => obtener<Concentracion>('/clientes/concentracion'))
  const rfm = useConsulta(() => obtener<SegmentoRfm[]>('/clientes/rfm'))

  const kpis = computed(() => {
    const r = resumen.datos.value
    const meses = nuevos.datos.value ?? []
    const ultimo = meses.at(-1)
    const totalNuevos = meses.reduce((s, m) => s + m.nuevos, 0)
    const c = concentracion.datos.value
    const segmentos = rfm.datos.value ?? []
    const clientes = segmentos.reduce((s, x) => s + x.clientes, 0)
    const clv = clientes ? segmentos.reduce((s, x) => s + (x.clv_promedio ?? 0) * x.clientes, 0) / clientes : null
    return [
      {
        titulo: 'Clientes activos',
        valor: fmtEntero(r?.clientes_unicos),
        detalle: `Venta neta por cliente ${fmtMonedaCorta(r && r.clientes_unicos ? r.venta_neta / r.clientes_unicos : null)}`,
        icono: 'mdi-account-multiple-outline',
        serie: meses.map(m => m.activos),
        etiquetas: meses.map(m => fmtMes(m.mes)),
      },
      {
        titulo: 'Clientes nuevos',
        valor: fmtEntero(totalNuevos),
        detalle: ultimo ? `${fmtEntero(ultimo.nuevos)} en ${fmtMes(ultimo.mes)}` : 'Altas en el período',
        icono: 'mdi-account-plus-outline',
        serie: meses.map(m => m.nuevos),
        etiquetas: meses.map(m => fmtMes(m.mes)),
        tipo: 'bar' as const,
      },
      {
        titulo: 'Concentración top 10',
        valor: fmtPct(c?.top10_pct),
        detalle: `${fmtEntero(c?.clientes_80_pct)} clientes (${fmtPct(c?.pct_clientes_80)}) hacen el 80 % de la venta`,
        icono: 'mdi-chart-pie',
      },
      {
        titulo: 'Valor de vida promedio',
        valor: fmtMoneda(clv),
        detalle: 'Margen futuro estimado por cliente (CLV)',
        icono: 'mdi-diamond-stone',
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
        :cargando="resumen.cargando.value"
        :detalle="k.detalle"
        :etiquetas="k.etiquetas"
        :formato-serie="fmtEntero"
        :icono="k.icono"
        :serie="k.serie"
        :tipo-serie="k.tipo ?? 'area'"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
