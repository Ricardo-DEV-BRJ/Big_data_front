<script setup lang="ts">
  // Indicadores del equipo comercial: cumplimiento global, comisiones y líderes.
  import type { Sucursal, Vendedor } from '@/services/metricas'
  import { computed } from 'vue'
  import TarjetaKpi from '@/components/comunes/TarjetaKpi.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { obtener } from '@/services/metricas'
  import { fmtEntero, fmtMonedaCorta, fmtPct } from '@/utils/formato'

  const { filtros, rango } = useFiltros()
  const vendedores = useConsulta(() => obtener<Vendedor[]>('/vendedores', filtros.value))
  const sucursales = useConsulta(() => obtener<Sucursal[]>('/sucursales', rango.value))

  const kpis = computed(() => {
    const v = vendedores.datos.value ?? []
    const venta = v.reduce((s, x) => s + x.venta_neta, 0)
    const meta = v.reduce((s, x) => s + (x.meta ?? 0), 0)
    const comision = v.reduce((s, x) => s + x.comision, 0)
    const cumplen = v.filter(x => (x.cumplimiento_pct ?? 0) >= 100).length
    const lider = v[0]
    const sucursal = (sucursales.datos.value ?? [])[0]
    return [
      {
        titulo: 'Cumplimiento de metas',
        valor: fmtPct(meta ? (100 * venta) / meta : null),
        detalle: `${fmtEntero(cumplen)} de ${fmtEntero(v.length)} vendedores cumplieron`,
        icono: 'mdi-bullseye-arrow',
      },
      {
        titulo: 'Comisiones',
        valor: fmtMonedaCorta(comision),
        detalle: 'Sobre lo cobrado sin IVA',
        icono: 'mdi-hand-coin-outline',
      },
      {
        titulo: 'Mejor vendedor',
        valor: lider?.vendedor ?? '—',
        detalle: lider ? `${lider.sucursal} · ${fmtMonedaCorta(lider.venta_neta)} · ${fmtPct(lider.cumplimiento_pct)} de su meta` : '',
        icono: 'mdi-trophy-outline',
      },
      {
        titulo: 'Sucursal líder',
        valor: sucursal?.sucursal ?? '—',
        detalle: sucursal ? `${fmtPct(sucursal.participacion_pct)} de la venta · ${sucursal.estado_geo ?? ''}` : '',
        icono: 'mdi-store-outline',
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
        :cargando="vendedores.cargando.value"
        :detalle="k.detalle"
        :icono="k.icono"
        :titulo="k.titulo"
        :valor="k.valor"
      />
    </v-col>
  </v-row>
</template>
