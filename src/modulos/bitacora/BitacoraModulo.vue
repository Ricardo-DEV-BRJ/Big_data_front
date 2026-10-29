<script setup lang="ts">
  import type { Rol } from '@/services/auth'
  // Módulo Bitácora: registro de auditoría (Tabla 18) con usuario, acción, fecha, IP y
  // los valores anterior y nuevo de cada cambio.
  import { computed, ref, watch } from 'vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useFiltros } from '@/composables/useFiltros'
  import { ETIQUETAS_ROL } from '@/services/auth'
  import { mensajeDeError, obtenerApi } from '@/services/metricas'

  interface Registro {
    id: number
    fecha: string
    usuario_id: number | null
    email: string | null
    rol: Rol | null
    accion: string
    entidad: string | null
    entidad_id: string | null
    valor_anterior: string | null
    valor_nuevo: string | null
    ip: string | null
    resultado: string
  }

  interface Respuesta {
    filas: Registro[]
    total: number
    acciones: string[]
  }

  const ACCIONES: Record<string, string> = {
    login: 'Inicio de sesión',
    login_fallido: 'Inicio de sesión fallido',
    password_cambiada: 'Cambio de contraseña',
    usuario_creado: 'Usuario creado',
    usuario_desactivado: 'Usuario desactivado',
    ingesta: 'Carga de datos',
    recalculo: 'Recálculo de métricas',
    tasa_registrada: 'Tasa registrada',
  }

  const { version } = useFiltros()
  const accion = ref<string | null>(null)
  const email = ref('')
  const desde = ref('')
  const hasta = ref('')
  const pagina = ref(1)
  const porPagina = ref(25)
  const datos = ref<Respuesta | null>(null)
  const cargando = ref(false)
  const error = ref('')

  async function cargar () {
    cargando.value = true
    error.value = ''
    try {
      const q = new URLSearchParams({ page: String(pagina.value), itemsPerPage: String(porPagina.value) })
      if (accion.value) q.set('accion', accion.value)
      if (email.value.trim()) q.set('email', email.value.trim())
      if (desde.value) q.set('desde', desde.value)
      if (hasta.value) q.set('hasta', hasta.value)
      datos.value = await obtenerApi<Respuesta>(`auditoria?${q}`)
    } catch (error_) {
      error.value = mensajeDeError(error_)
    } finally {
      cargando.value = false
    }
  }

  watch([accion, email, desde, hasta], () => {
    pagina.value = 1
  })
  watch([accion, email, desde, hasta, pagina, porPagina, version], cargar, { immediate: true })

  const opcionesAccion = computed(() => (datos.value?.acciones ?? []).map(a => ({ title: ACCIONES[a] ?? a, value: a })))

  function json (texto: string | null): string {
    if (!texto) return ''
    try {
      return JSON.stringify(JSON.parse(texto), null, 2)
    } catch {
      return texto
    }
  }

  const encabezados = [
    { title: 'Fecha', key: 'fecha' },
    { title: 'Usuario', key: 'email' },
    { title: 'Acción', key: 'accion' },
    { title: 'Entidad', key: 'entidad' },
    { title: 'IP', key: 'ip' },
    { title: 'Resultado', key: 'resultado' },
    { title: '', key: 'data-table-expand' },
  ]
</script>

<template>
  <TarjetaPanel
    :cargando="cargando"
    :error="error"
    icono="mdi-clipboard-text-clock-outline"
    :subtitulo="`${datos?.total ?? 0} registros · los cambios guardan valor anterior y nuevo`"
    titulo="Bitácora de auditoría"
    @reintentar="cargar"
  >
    <template #acciones>
      <v-select
        v-model="accion"
        class="filtro"
        clearable
        density="compact"
        hide-details
        :items="opcionesAccion"
        label="Acción"
        variant="outlined"
      />

      <v-text-field
        v-model="email"
        class="filtro"
        clearable
        density="compact"
        hide-details
        label="Usuario"
        variant="outlined"
      />

      <v-text-field
        v-model="desde"
        class="filtro-fecha"
        density="compact"
        hide-details
        label="Desde"
        type="date"
        variant="outlined"
      />

      <v-text-field
        v-model="hasta"
        class="filtro-fecha"
        density="compact"
        hide-details
        label="Hasta"
        type="date"
        variant="outlined"
      />
    </template>

    <v-data-table-server
      v-model:items-per-page="porPagina"
      v-model:page="pagina"
      class="bg-transparent"
      density="compact"
      :headers="encabezados"
      item-value="id"
      :items="datos?.filas ?? []"
      :items-length="datos?.total ?? 0"
      :loading="cargando"
      no-data-text="Sin registros"
      show-expand
    >
      <template #[`item.fecha`]="{ value }">{{ String(value).replace('T', ' ').slice(0, 19) }} UTC</template>

      <template #[`item.email`]="{ item }">
        <div>{{ item.email ?? '—' }}</div>
        <div v-if="item.rol" class="text-body-small text-medium-emphasis">{{ ETIQUETAS_ROL[item.rol] ?? item.rol }}</div>
      </template>

      <template #[`item.accion`]="{ value }">{{ ACCIONES[value] ?? value }}</template>
      <template #[`item.entidad`]="{ item }">{{ [item.entidad, item.entidad_id].filter(Boolean).join(' #') || '—' }}</template>

      <template #[`item.resultado`]="{ value }">
        <v-chip :color="value === 'ok' ? 'success' : 'error'" size="small" variant="tonal">{{ value }}</v-chip>
      </template>

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-row class="py-2" dense>
              <v-col cols="12" md="6">
                <div class="text-body-small text-medium-emphasis">Valor anterior</div>
                <pre class="json">{{ json(item.valor_anterior) || '—' }}</pre>
              </v-col>

              <v-col cols="12" md="6">
                <div class="text-body-small text-medium-emphasis">Valor nuevo</div>
                <pre class="json">{{ json(item.valor_nuevo) || '—' }}</pre>
              </v-col>
            </v-row>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </TarjetaPanel>
</template>

<style scoped>
.filtro {
  width: 200px;
}

.filtro-fecha {
  width: 160px;
}

.json {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow: auto;
}
</style>
