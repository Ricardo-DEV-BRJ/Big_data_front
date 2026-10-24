<script setup lang="ts">
  // Indicadores del portafolio: concentración (Pareto), productos sin venta y devoluciones.
  import type { Abc, Devoluciones, ProductoCatalogo } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros } = useFiltros()
  const abc = useConsulta(() => obtener<Abc>('/productos/abc'))
  const sinVentas = useConsulta(() => obtener<ProductoCatalogo[]>('/productos/sin-ventas', filtros.value))
  const devoluciones = useConsulta(() => obtener<Devoluciones>('/devoluciones', filtros.value))

  const kpis = computed(() => {
    const resumen = abc.datos.value?.resumen ?? []
    const a = resumen.find(r => r.clase_abc === 'A')
    const total = resumen.reduce((s, r) => s + r.productos, 0)
    const d = devoluciones.datos.value?.resumen
    return [
      { titulo: 'Productos con ventas', valor: fmtEntero(total), detalle: 'En todo el período', icono: 'mdi-package-variant-closed' },
      {
        titulo: 'Clase A',
        valor: fmtEntero(a?.productos),
        detalle: `${fmtPct(a?.pct_productos, 0)} de los productos hacen el ${fmtPct(a?.participacion_pct, 0)} de la venta`,
        icono: 'mdi-star-outline',
      },
      {
        titulo: 'Sin ventas',
        valor: fmtEntero(sinVentas.datos.value?.length),
        detalle: 'Productos del inventario que no se vendieron',
        icono: 'mdi-package-variant-remove',
      },
      {
        titulo: 'Tasa de devolución',
        valor: fmtPct(d?.tasa_devolucion_pct),
        detalle: `${fmtEntero(d?.devoluciones)} devoluciones · ${fmtMonedaCorta(d?.monto_devuelto)}`,
        icono: 'mdi-keyboard-return',
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
        :cargando="abc.cargando.value"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
