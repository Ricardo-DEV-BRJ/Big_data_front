<script setup lang="ts">
  // Tabla de tasas (6.4.4.4): tasa vigente BCV, USDT y EUR con fecha, hora y fuente, alerta
  // cuando lleva más de 24 h sin actualizarse, registro manual (Administración) e historial.
  // Al abrir el registro se sugieren las tasas de DolarApi; el usuario puede editarlas antes de guardar.
  import type { ResumenTasas } from '@/services/metricas'
  import { computed, ref, watch } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { apiCall } from '@/config/api'
  import { usuarioActual } from '@/services/auth'
  import { mensajeDeError, obtenerApi } from '@/services/metricas'
  import { fmtDecimal, fmtFecha, fmtMes, fmtPct } from '@/utils/formato'

  const { filtros, refrescar } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(
    () => obtenerApi<ResumenTasas>('tasas', { desde: filtros.value.desde, hasta: filtros.value.hasta }),
  )
  const { opciones } = useGrafico()

  const usuario = usuarioActual()
  const puedeRegistrar = !!usuario && ['administracion', 'administrador'].includes(usuario.rol)

  const vigente = computed(() => datos.value?.tasa ?? null)
  const historial = computed(() => datos.value?.historial ?? [])

  const series = computed(() => [
    { name: 'BCV', data: historial.value.map(t => t.tasa_bcv) },
    { name: 'USDT', data: historial.value.map(t => t.tasa_usdt) },
    { name: 'EUR', data: historial.value.map(t => t.tasa_eur) },
  ])
  const opcionesGrafico = computed(() => opciones({
    chart: { type: 'line' },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      type: 'category',
      categories: historial.value.map(t => t.fecha),
      tickAmount: 8,
      labels: { formatter: (v: string) => (v ? fmtMes(v) : '') },
    },
    yaxis: { labels: { formatter: (v: number) => `${fmtDecimal(v)} Bs` } },
    tooltip: { shared: true, intersect: false, y: { formatter: (v: number | null) => (v == null ? '—' : `${fmtDecimal(v)} Bs`) } },
  }))

  const ahora = new Date(Date.now() - 4 * 3_600_000).toISOString()
  const formulario = ref({ fecha: ahora.slice(0, 10), hora: ahora.slice(11, 16), tasa_bcv: '', tasa_usdt: '', tasa_eur: '', fuente: 'BCV oficial' })
  const guardando = ref(false)
  const mensaje = ref({ texto: '', tipo: 'success' as 'success' | 'error' })

  interface Sugerida {
    fecha: string
    hora: string
    tasa_bcv: number
    tasa_usdt: number | null
    tasa_eur: number | null
    fuente: string
    actualizado: { bcv: string | null, usdt: string | null, eur: string | null }
  }

  const panelAbierto = ref<number | null>(null)
  const consultando = ref(false)
  const sugerencia = ref<{ texto: string, tipo: 'info' | 'warning' } | null>(null)
  const texto = (v: number | null) => (v === null ? '' : String(v))

  // Autorrelleno con DolarApi (vía la API): no guarda nada, solo completa el formulario.
  async function consultarDolarApi () {
    consultando.value = true
    sugerencia.value = null
    try {
      const t = await obtenerApi<Sugerida>('tasas/sugerida')
      formulario.value = {
        fecha: t.fecha,
        hora: t.hora,
        tasa_bcv: texto(t.tasa_bcv),
        tasa_usdt: texto(t.tasa_usdt),
        tasa_eur: texto(t.tasa_eur),
        fuente: t.fuente,
      }
      const bcv = t.actualizado.bcv ? fmtFecha(t.actualizado.bcv.slice(0, 10)) : '—'
      sugerencia.value = { texto: `Valores sugeridos por DolarApi (BCV del ${bcv}; USDT = dólar paralelo). Revíselos y edítelos si hace falta antes de registrar.`, tipo: 'info' }
    } catch (error_) {
      sugerencia.value = { texto: `No se pudo consultar DolarApi (${mensajeDeError(error_)}). Ingrese las tasas manualmente.`, tipo: 'warning' }
    } finally {
      consultando.value = false
    }
  }

  watch(panelAbierto, abierto => {
    if (abierto !== null && abierto !== undefined && !consultando.value) {
      void consultarDolarApi()
    }
  })

  async function registrar () {
    guardando.value = true
    mensaje.value.texto = ''
    try {
      const f = formulario.value
      await apiCall('tasas', {
        fecha: f.fecha,
        hora: f.hora,
        fuente: f.fuente,
        tasa_bcv: Number(f.tasa_bcv),
        tasa_usdt: f.tasa_usdt === '' ? null : Number(f.tasa_usdt),
        tasa_eur: f.tasa_eur === '' ? null : Number(f.tasa_eur),
      }, 'POST')
      mensaje.value = { texto: 'Tasa registrada', tipo: 'success' }
      sugerencia.value = null
      formulario.value = { ...f, tasa_bcv: '', tasa_usdt: '', tasa_eur: '' }
      await refrescar()
    } catch (error_) {
      mensaje.value = { texto: mensajeDeError(error_), tipo: 'error' }
    } finally {
      guardando.value = false
    }
  }
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-swap-horizontal-circle-outline"
    subtitulo="Bs por unidad · BCV oficial, USDT (mercado P2P) y EUR, con fecha, hora y fuente"
    titulo="Tasas de cambio"
    @reintentar="recargar"
  >
    <v-alert
      v-if="datos?.vencida"
      class="mb-4"
      density="compact"
      icon="mdi-clock-alert-outline"
      type="warning"
      variant="tonal"
    >
      {{ vigente
        ? `La tasa lleva ${fmtDecimal(vigente.horas_sin_actualizar)} horas sin actualizarse (límite ${datos.horas_limite} h). Registre la tasa del día.`
        : 'No hay ninguna tasa registrada.' }}
    </v-alert>

    <v-row v-if="vigente" class="mb-2" dense>
      <v-col cols="12" sm="3">
        <div class="text-body-small text-medium-emphasis">BCV</div>
        <div class="text-h6 font-weight-bold">{{ fmtDecimal(vigente.tasa_bcv) }} Bs</div>
      </v-col>

      <v-col cols="12" sm="3">
        <div class="text-body-small text-medium-emphasis">USDT · brecha {{ fmtPct(datos?.brecha_usdt_pct) }}</div>
        <div class="text-h6 font-weight-bold">{{ fmtDecimal(vigente.tasa_usdt) }} Bs</div>
      </v-col>

      <v-col cols="12" sm="3">
        <div class="text-body-small text-medium-emphasis">EUR</div>
        <div class="text-h6 font-weight-bold">{{ fmtDecimal(vigente.tasa_eur) }} Bs</div>
      </v-col>

      <v-col cols="12" sm="3">
        <div class="text-body-small text-medium-emphasis">Vigente desde</div>
        <div class="text-body-medium">{{ fmtFecha(vigente.fecha) }} {{ vigente.hora }}</div>
        <div class="text-body-small text-medium-emphasis">{{ vigente.fuente }} · {{ vigente.origen }}</div>
      </v-col>
    </v-row>

    <Grafico :alto="260" :opciones="opcionesGrafico" :series="series" tipo="line" />

    <v-expansion-panels v-if="puedeRegistrar" v-model="panelAbierto" class="mt-3" variant="accordion">
      <v-expansion-panel title="Registrar tasa del día">
        <v-expansion-panel-text>
          <div class="d-flex flex-wrap align-center ga-2 mb-3">
            <v-btn
              :loading="consultando"
              prepend-icon="mdi-cloud-download-outline"
              size="small"
              variant="tonal"
              @click="consultarDolarApi"
            >
              Consultar DolarApi
            </v-btn>

            <span v-if="sugerencia" class="text-body-small" :class="sugerencia.tipo === 'warning' ? 'text-warning' : 'text-medium-emphasis'">
              {{ sugerencia.texto }}
            </span>
          </div>

          <v-form class="d-flex flex-wrap ga-3" @submit.prevent="registrar">
            <v-text-field
              v-model="formulario.fecha"
              class="campo"
              density="compact"
              hide-details
              label="Fecha"
              type="date"
              variant="outlined"
            />

            <v-text-field
              v-model="formulario.hora"
              class="campo"
              density="compact"
              hide-details
              label="Hora"
              type="time"
              variant="outlined"
            />

            <v-text-field
              v-model="formulario.tasa_bcv"
              class="campo"
              density="compact"
              hide-details
              label="BCV (Bs/USD)"
              min="0"
              step="0.0001"
              type="number"
              variant="outlined"
            />

            <v-text-field
              v-model="formulario.tasa_usdt"
              class="campo"
              density="compact"
              hide-details
              label="USDT (Bs)"
              min="0"
              step="0.0001"
              type="number"
              variant="outlined"
            />

            <v-text-field
              v-model="formulario.tasa_eur"
              class="campo"
              density="compact"
              hide-details
              label="EUR (Bs)"
              min="0"
              step="0.0001"
              type="number"
              variant="outlined"
            />

            <v-text-field
              v-model="formulario.fuente"
              class="campo"
              density="compact"
              hide-details
              label="Fuente"
              variant="outlined"
            />

            <v-btn color="primary" :disabled="!formulario.tasa_bcv" :loading="guardando" type="submit">Registrar</v-btn>
          </v-form>

          <v-alert
            v-if="mensaje.texto"
            class="mt-3"
            density="compact"
            :text="mensaje.texto"
            :type="mensaje.tipo"
            variant="tonal"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </TarjetaPanel>
</template>

<style scoped>
.campo {
  flex: 1 1 150px;
}
</style>
