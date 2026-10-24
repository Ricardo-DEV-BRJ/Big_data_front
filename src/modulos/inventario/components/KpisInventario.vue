<script setup lang="ts">
  // Indicadores de inventario: capital inmovilizado, rotación, quiebres y venta perdida.
  import type { InventarioMes, InventarioSucursal } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtDecimal, fmtEntero, fmtMes, fmtMonedaCorta } from '@/utils/formato'

  const { estado, filtros } = useFiltros()
  const resumen = useConsulta(() => obtener<InventarioSucursal[]>('/inventario/resumen', { sucursal: estado.sucursal }))
  const mensual = useConsulta(() => obtener<InventarioMes[]>('/inventario/mensual', filtros.value))

  const kpis = computed(() => {
    const s = resumen.datos.value ?? []
    const valor = s.reduce((t, x) => t + x.valor_inventario_actual, 0)
    const promedio = s.reduce((t, x) => t + x.valor_inventario_promedio, 0)
    const vendido = s.reduce((t, x) => t + x.costo_vendido, 0)
    const rotacion = promedio ? vendido / promedio : null
    const conQuiebre = s.reduce((t, x) => t + x.productos_con_quiebre, 0)
    const productos = s.reduce((t, x) => t + x.productos, 0)
    const perdida = s.reduce((t, x) => t + x.venta_perdida_usd, 0)
    const meses = mensual.datos.value ?? []
    const etiquetas = meses.map(m => fmtMes(m.mes))
    return [
      {
        titulo: 'Valor del inventario',
        valor: fmtMonedaCorta(valor),
        detalle: `${fmtEntero(s.reduce((t, x) => t + x.unidades_en_stock, 0))} unidades a costo`,
        icono: 'mdi-warehouse',
        serie: meses.map(m => m.valor_inventario_promedio),
        etiquetas,
        formato: fmtMonedaCorta,
      },
      {
        titulo: 'Rotación',
        valor: rotacion === null ? '—' : `${fmtDecimal(Math.round(rotacion * 10) / 10)} veces`,
        detalle: rotacion ? `El inventario dura unos ${fmtEntero(365 / rotacion)} días` : 'Costo vendido ÷ inventario promedio',
        icono: 'mdi-sync',
      },
      {
        titulo: 'Quiebres de stock',
        valor: fmtEntero(conQuiebre),
        detalle: `de ${fmtEntero(productos)} producto-sucursal se quedaron sin existencia`,
        icono: 'mdi-package-variant-remove',
        serie: meses.map(m => m.dias_quiebre),
        etiquetas,
        formato: (v: number) => `${fmtEntero(v)} días sin stock`,
        tipo: 'bar' as const,
      },
      {
        titulo: 'Venta perdida estimada',
        valor: fmtMonedaCorta(perdida),
        detalle: 'Por días sin existencia, al precio promedio',
        icono: 'mdi-cash-remove',
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
