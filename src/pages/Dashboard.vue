<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import BotonTema from '@/components/BotonTema.vue';
import { apiCall } from '@/config/api'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

interface Producto {
  nombre: string
  cantidad: number
}

const theme = useTheme()
const formato = new Intl.NumberFormat('es')

const productos = ref<Producto[]>([])
const cargando = ref(false)
const error = ref('')
const ultimaActualizacion = ref<Date | null>(null)

const obtenerMetricas = () => {
  cargando.value = true
  error.value = ''
  apiCall('metricas', {})
    .then((result: any) => {
      // Si la tabla tiene el mismo producto repetido, se queda con el último registro.
      const porNombre = new Map<string, number>()
      for (const fila of result.data.data) porNombre.set(fila.nombre, Number(fila.cantidad))
      productos.value = [...porNombre]
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
      ultimaActualizacion.value = new Date()
    }).catch((err: any) => {
      console.error(err)
      error.value = err.response?.data?.error || 'No se pudieron cargar las métricas'
    }).finally(() => {
      cargando.value = false
    });
}

const textoActualizacion = computed(() =>
  ultimaActualizacion.value
    ? `Actualizado a las ${ultimaActualizacion.value.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
    : 'Sin actualizar'
)

// Indicadores
const totalUnidades = computed(() => productos.value.reduce((suma, p) => suma + p.cantidad, 0))
const productoLider = computed(() => productos.value[0])
const porcentaje = (cantidad: number) => (totalUnidades.value ? (cantidad / totalUnidades.value) * 100 : 0)
const promedio = computed(() =>
  productos.value.length ? totalUnidades.value / productos.value.length : 0
)

const indicadores = computed(() => [
  {
    titulo: 'Unidades vendidas',
    valor: formato.format(totalUnidades.value),
    detalle: 'Total del top de productos',
    icono: 'mdi-cart-outline',
  },
  {
    titulo: 'Producto líder',
    valor: productoLider.value?.nombre ?? '—',
    detalle: productoLider.value
      ? `${formato.format(productoLider.value.cantidad)} u. · ${porcentaje(productoLider.value.cantidad).toFixed(1)} % del total`
      : 'Sin datos',
    icono: 'mdi-trophy-outline',
  },
  {
    titulo: 'Productos en el top',
    valor: formato.format(productos.value.length),
    detalle: 'Ordenados por unidades',
    icono: 'mdi-package-variant-closed',
  },
  {
    titulo: 'Promedio por producto',
    valor: formato.format(Math.round(promedio.value)),
    detalle: 'Unidades por producto',
    icono: 'mdi-chart-timeline-variant',
  },
])

// Gráfico: barras horizontales de un solo color (todas miden lo mismo: unidades).
const colores = computed(() => {
  const c = theme.current.value.colors
  const oscuro = theme.current.value.dark
  return {
    barra: String(c.primary),
    texto: oscuro ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.60)',
    rejilla: oscuro ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    superficie: String(c.surface),
  }
})

const datosGrafico = computed<ChartData<'bar'>>(() => ({
  labels: productos.value.map((p) => p.nombre),
  datasets: [{
    label: 'Unidades vendidas',
    data: productos.value.map((p) => p.cantidad),
    backgroundColor: colores.value.barra,
    hoverBackgroundColor: colores.value.barra,
    borderRadius: 8,
    borderSkipped: 'start',
    maxBarThickness: 20,
  }],
}))

const opcionesGrafico = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  layout: { padding: { right: 8 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: colores.value.superficie,
      titleColor: colores.value.texto,
      bodyColor: colores.value.texto,
      borderColor: colores.value.rejilla,
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (ctx) => {
          const unidades = ctx.parsed.x ?? 0
          return `${formato.format(unidades)} unidades (${porcentaje(unidades).toFixed(1)} %)`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: colores.value.rejilla },
      border: { display: false },
      ticks: { color: colores.value.texto, callback: (v) => formato.format(Number(v)) },
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: colores.value.texto, font: { weight: 500 } },
    },
  },
}))

// La altura crece con el número de productos para que las barras no se aplasten.
const altoGrafico = computed(() => `${Math.max(260, productos.value.length * 38 + 40)}px`)

// Tabla
const encabezados = [
  { title: 'Posición', key: 'posicion', sortable: false, width: 90 },
  { title: 'Producto', key: 'nombre' },
  { title: 'Unidades', key: 'cantidad', align: 'end' as const },
  { title: 'Participación', key: 'participacion', align: 'end' as const, width: 200 },
]

const filasTabla = computed(() => productos.value.map((p, i) => ({
  ...p,
  posicion: i + 1,
  participacion: porcentaje(p.cantidad),
})))

const cargaInicial = computed(() => cargando.value && !productos.value.length)

onMounted(() => {
  obtenerMetricas()
})
</script>

<template>
  <v-container class="py-8" fluid style="max-width: 1320px">
    <!-- Encabezado -->
    <v-sheet class="banner pa-6 pa-md-8 mb-8" rounded="xl">
      <div class="d-flex align-center flex-wrap ga-4">
        <v-avatar size="56" rounded="lg" class="banner-icono">
          <v-icon icon="mdi-chart-box-outline" size="30" />
        </v-avatar>
        <div>
          <div class="text-overline banner-suave">Panel comercial</div>
          <h1 class="text-h4 font-weight-bold">Dashboard de ventas</h1>
          <div class="text-body-1 banner-suave">Rendimiento de los productos más vendidos</div>
        </div>
        <v-spacer />
        <div class="d-flex align-center flex-wrap ga-3">
          <v-chip variant="flat" class="banner-chip" prepend-icon="mdi-clock-outline" rounded="lg">
            {{ textoActualizacion }}
          </v-chip>
          <v-btn
            color="surface"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-refresh"
            :loading="cargando"
            @click="obtenerMetricas"
          >
            Actualizar
          </v-btn>
          <BotonTema />
        </div>
      </div>
    </v-sheet>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      rounded="xl"
      class="mb-8"
      closable
      title="No se pudo cargar la información"
      :text="error"
      @click:close="error = ''"
    />

    <!-- Indicadores -->
    <v-row class="mb-2">
      <v-col v-for="kpi in indicadores" :key="kpi.titulo" cols="12" sm="6" lg="3">
        <v-skeleton-loader v-if="cargaInicial" type="article" class="rounded-xl" />
        <v-card v-else class="tarjeta kpi h-100" rounded="xl" elevation="0">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-body-2 font-weight-medium text-medium-emphasis">{{ kpi.titulo }}</span>
              <v-avatar color="primary" variant="tonal" rounded="lg" size="40">
                <v-icon :icon="kpi.icono" size="22" />
              </v-avatar>
            </div>
            <div class="text-h4 font-weight-bold text-truncate" :title="String(kpi.valor)">{{ kpi.valor }}</div>
            <div class="text-body-2 text-medium-emphasis mt-2">{{ kpi.detalle }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Gráfico -->
      <v-col cols="12" lg="7">
        <v-card class="tarjeta h-100" rounded="xl" elevation="0">
          <v-card-item class="pa-6 pb-2">
            <template #prepend>
              <v-avatar color="primary" variant="tonal" rounded="lg" size="40">
                <v-icon icon="mdi-podium" size="22" />
              </v-avatar>
            </template>
            <v-card-title class="font-weight-bold">Top de productos</v-card-title>
            <v-card-subtitle>Unidades vendidas por producto</v-card-subtitle>
            <template #append>
              <v-chip v-if="productos.length" size="small" variant="tonal" color="primary" rounded="lg">
                Top {{ productos.length }}
              </v-chip>
            </template>
          </v-card-item>
          <v-card-text class="pa-6 pt-2">
            <v-skeleton-loader v-if="cargaInicial" type="image" height="280" class="rounded-xl" />
            <div v-else-if="productos.length" :style="{ height: altoGrafico, position: 'relative' }">
              <Bar :data="datosGrafico" :options="opcionesGrafico" aria-label="Gráfico de barras de unidades vendidas por producto" />
            </div>
            <v-empty-state
              v-else
              icon="mdi-chart-bar"
              title="Aún no hay datos"
              text="Genera el top de productos y pulsa Actualizar."
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tabla -->
      <v-col cols="12" lg="5">
        <v-card class="tarjeta h-100" rounded="xl" elevation="0">
          <v-card-item class="pa-6 pb-2">
            <template #prepend>
              <v-avatar color="primary" variant="tonal" rounded="lg" size="40">
                <v-icon icon="mdi-format-list-numbered" size="22" />
              </v-avatar>
            </template>
            <v-card-title class="font-weight-bold">Ranking</v-card-title>
            <v-card-subtitle>Participación sobre el total del top</v-card-subtitle>
          </v-card-item>
          <v-data-table
            class="bg-transparent px-2 pb-2"
            :headers="encabezados"
            :items="filasTabla"
            :loading="cargando"
            density="comfortable"
            :items-per-page="10"
            hide-default-footer
            hover
            no-data-text="Sin datos"
            loading-text="Cargando..."
          >
            <template #[`item.posicion`]="{ item }">
              <v-avatar
                size="30"
                rounded="lg"
                :color="item.posicion <= 3 ? 'primary' : undefined"
                :variant="item.posicion <= 3 ? 'flat' : 'tonal'"
                class="text-body-2 font-weight-bold"
              >
                {{ item.posicion }}
              </v-avatar>
            </template>
            <template #[`item.nombre`]="{ item }">
              <span class="font-weight-medium">{{ item.nombre }}</span>
            </template>
            <template #[`item.cantidad`]="{ item }">
              {{ formato.format(item.cantidad) }}
            </template>
            <template #[`item.participacion`]="{ item }">
              <div class="d-flex align-center ga-3">
                <v-progress-linear
                  :model-value="item.participacion"
                  color="primary"
                  bg-color="primary"
                  bg-opacity="0.12"
                  height="8"
                  rounded
                  rounded-bar
                />
                <span class="text-body-2 font-weight-medium" style="min-width: 52px; text-align: right">
                  {{ item.participacion.toFixed(1) }} %
                </span>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.banner {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgba(var(--v-theme-primary), 0.78) 100%
  );
  color: rgb(var(--v-theme-on-primary));
}

.banner-suave {
  opacity: 0.85;
}

.banner-icono,
.banner-chip {
  background: rgba(255, 255, 255, 0.18) !important;
  color: inherit !important;
}

.tarjeta {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.04);
}

.kpi {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.kpi:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 4px rgba(16, 24, 40, 0.05), 0 12px 28px rgba(16, 24, 40, 0.08);
}
</style>
