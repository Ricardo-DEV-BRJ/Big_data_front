<script setup lang="ts">
  import type { CodigoMoneda } from '@/utils/formato'
  /**
   * Estructura del panel: menú lateral con los módulos, barra superior con la
   * fecha de corte y acciones, y barra de filtros globales (período y sucursal)
   * que aplican a todos los módulos.
   */
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import logo from '@/assets/AgroJM_logo_1x1.png'
  import BotonTema from '@/components/BotonTema.vue'
  import { PERIODOS, useFiltros } from '@/composables/useFiltros'
  import { MODULOS } from '@/modulos'
  import { cerrarSesion, usuarioActual } from '@/services/auth'
  import { mensajeDeError, recalcular } from '@/services/metricas'
  import { factorMoneda, fmtDecimal, fmtEntero, fmtFecha, monedaVista, usarMoneda } from '@/utils/formato'

  const { estado, opciones, errorOpciones, cargarOpciones, refrescar } = useFiltros()
  const { mdAndUp } = useDisplay()
  const ruta = useRoute()
  const router = useRouter()
  const usuario = usuarioActual()

  const menu = ref(true)
  watch(mdAndUp, valor => {
    menu.value = valor
  }, { immediate: true })

  const moduloActual = computed(() => MODULOS.find(m => m.ruta === ruta.name))
  const modulosPermitidos = computed(() => MODULOS.filter(m => usuario && m.roles.includes(usuario.rol)))

  const sucursales = computed(() => (opciones.value?.sucursales ?? []).map(s => ({
    title: s.sucursal,
    value: s.sucursal,
    subtitle: [s.ciudad, s.estado_geo].filter(Boolean).join(', '),
  })))

  const corte = computed(() => opciones.value?.rango_fechas?.hasta ?? null)

  // Moneda de visualización: los montos llegan en USD y se convierten con la tasa vigente.
  const tasaVigente = computed(() => opciones.value?.tasa_vigente ?? null)
  const monedas = computed(() => ([
    { title: 'Dólares (USD)', value: 'USD' },
    { title: 'Bolívares (Bs, BCV)', value: 'VES' },
    { title: 'Tether (USDT)', value: 'USDT' },
    { title: 'Euros (EUR)', value: 'EUR' },
  ] as { title: string, value: CodigoMoneda }[]).map(m => ({
    ...m,
    props: { disabled: factorMoneda(m.value, tasaVigente.value) === null },
  })))
  const moneda = computed({
    get: () => monedaVista.codigo,
    set: (codigo: CodigoMoneda) => {
      if (usarMoneda(codigo, tasaVigente.value)) refrescar()
    },
  })
  // Si cambia la tasa vigente (p. ej. se registró una nueva), se recalcula el factor.
  watch(tasaVigente, tasa => {
    if (!usarMoneda(monedaVista.codigo, tasa)) usarMoneda('USD', tasa)
  })
  const detalleTasa = computed(() => {
    const t = tasaVigente.value
    if (!t || monedaVista.codigo === 'USD') return ''
    return `1 USD = ${fmtDecimal(monedaVista.factor)} ${monedaVista.simbolo} · tasa del ${fmtFecha(t.fecha)} ${t.hora}`
  })

  const recalculando = ref(false)
  const aviso = ref({ visible: false, texto: '', color: 'success' })

  function actualizar () {
    refrescar()
  }

  function salir () {
    cerrarSesion()
    void router.replace('/login')
  }

  function recalcularMetricas () {
    recalculando.value = true
    recalcular()
      .then(r => {
        aviso.value = {
          visible: true,
          color: 'success',
          texto: `Métricas recalculadas en ${r.segundos} s · ${fmtEntero(r.filas_ventas)} ventas · corte ${fmtFecha(r.fecha_corte)}`,
        }
        refrescar()
      })
      .catch(error => {
        aviso.value = { visible: true, color: 'error', texto: mensajeDeError(error) }
      })
      .finally(() => {
        recalculando.value = false
      })
  }

  onMounted(() => {
    cargarOpciones()
  })
</script>

<template>
  <v-navigation-drawer v-model="menu" :permanent="mdAndUp" :temporary="!mdAndUp" width="256">
    <div class="d-flex align-center ga-3 px-5 py-5">
      <v-avatar :image="logo" rounded="lg" size="70" />

      <div>
        <div class="text-title-medium font-weight-bold">AgroData JM</div>
        <div class="text-body-small text-medium-emphasis">Agro Comercializadora JM</div>
      </div>
    </div>

    <v-divider />

    <v-list class="px-2" density="comfortable" nav>
      <v-list-item
        v-for="m in modulosPermitidos"
        :key="m.ruta"
        color="primary"
        :prepend-icon="m.icono"
        rounded="lg"
        :title="m.titulo"
        :to="`/panel/${m.ruta}`"
        @click="!mdAndUp && (menu = false)"
      />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar border="b" color="surface" elevation="0" height="64">
    <v-app-bar-nav-icon aria-label="Menú" @click="menu = !menu" />

    <v-app-bar-title class="text-title-large font-weight-bold">
      {{ moduloActual?.titulo ?? 'Panel' }}
    </v-app-bar-title>

    <template #append>
      <v-chip
        v-if="corte"
        class="me-2 d-none d-sm-flex"
        prepend-icon="mdi-calendar-check-outline"
        rounded="lg"
        size="small"
        variant="tonal"
      >
        Datos al {{ fmtFecha(corte) }}
      </v-chip>

      <v-btn aria-label="Actualizar" icon="mdi-refresh" variant="text" @click="actualizar" />

      <v-menu>
        <template #activator="{ props: activador }">
          <v-btn
            aria-label="Más acciones"
            icon="mdi-dots-vertical"
            v-bind="activador"
            :loading="recalculando"
            variant="text"
          />
        </template>

        <v-list density="compact">
          <v-list-item
            v-if="usuario?.rol === 'administrador'"
            prepend-icon="mdi-database-refresh-outline"
            subtitle="Vuelve a leer el data lake"
            title="Recalcular métricas"
            @click="recalcularMetricas"
          />

          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="salir" />
        </v-list>
      </v-menu>

      <BotonTema class="me-2" />
    </template>
  </v-app-bar>

  <v-main>
    <div class="barra-filtros px-4 px-md-6 py-3">
      <div class="d-flex flex-wrap align-center ga-3 contenido">
        <v-select
          v-if="moduloActual?.titulo !== 'Usuarios' "
          v-model="estado.periodo"
          class="filtro"
          density="compact"
          hide-details
          item-title="titulo"
          item-value="valor"
          :items="PERIODOS"
          label="Período"
          prepend-inner-icon="mdi-calendar-range"
          variant="outlined"
        />

        <template v-if="estado.periodo === 'personalizado'">
          <v-text-field
            v-model="estado.desdePersonalizado"
            class="filtro-fecha"
            density="compact"
            hide-details
            label="Desde"
            :max="estado.hastaPersonalizado || corte || undefined"
            :min="opciones?.rango_fechas.desde || undefined"
            type="date"
            variant="outlined"
          />

          <v-text-field
            v-model="estado.hastaPersonalizado"
            class="filtro-fecha"
            density="compact"
            hide-details
            label="Hasta"
            :max="corte || undefined"
            :min="estado.desdePersonalizado || undefined"
            type="date"
            variant="outlined"
          />
        </template>

        <v-select
          v-if="moduloActual?.titulo !== 'Usuarios' "
          v-model="estado.sucursal"
          class="filtro"
          clearable
          density="compact"
          hide-details
          item-props
          :items="sucursales"
          label="Sucursal"
          persistent-placeholder
          placeholder="Todas"
          prepend-inner-icon="mdi-store-outline"
          variant="outlined"
        />

        <v-select
          v-if="moduloActual?.titulo !== 'Usuarios'"
          v-model="moneda"
          class="filtro-moneda"
          density="compact"
          hide-details
          item-props
          :items="monedas"
          label="Moneda"
          prepend-inner-icon="mdi-currency-usd"
          variant="outlined"
        />

        <span v-if="detalleTasa" class="text-body-small text-medium-emphasis">{{ detalleTasa }}</span>

        <span v-if="moduloActual?.titulo !== 'Usuarios' " class="text-body-small text-medium-emphasis">
          {{ moduloActual?.descripcion }}
        </span>
      </div>

      <v-alert
        v-if="errorOpciones"
        class="mt-3 contenido"
        density="compact"
        :text="`No se pudo conectar con la API: ${errorOpciones}`"
        type="error"
        variant="tonal"
      />
    </div>

    <div class="px-4 px-md-6 pb-8 contenido">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </v-main>

  <v-snackbar v-model="aviso.visible" :color="aviso.color" timeout="6000">
    {{ aviso.texto }}
  </v-snackbar>
</template>

<style scoped>
.contenido {
  max-width: 1440px;
  margin-inline: auto;
}

.barra-filtros {
  position: sticky;
  top: 64px;
  z-index: 2;
  background: rgb(var(--v-theme-background));
}

.filtro {
  flex: 0 1 230px;
  min-width: 180px;
}

.filtro-moneda {
  flex: 0 1 200px;
  min-width: 170px;
}

.filtro-fecha {
  flex: 0 1 170px;
  min-width: 150px;
}
</style>
