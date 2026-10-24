/**
 * Filtros globales del panel (período y sucursal), compartidos por todos los
 * módulos. Viven en un estado único: cambiar el período en la barra superior
 * actualiza la pantalla que se esté viendo.
 */
import type { Filtros, Opciones } from '@/services/metricas'
import { computed, reactive, ref } from 'vue'
import { mensajeDeError, obtener } from '@/services/metricas'

export type Periodo = 'todo' | 'mes' | '3m' | '6m' | '12m' | 'personalizado'

export const PERIODOS: { valor: Periodo, titulo: string }[] = [
  { valor: 'mes', titulo: 'Último mes' },
  { valor: '3m', titulo: 'Últimos 3 meses' },
  { valor: '6m', titulo: 'Últimos 6 meses' },
  { valor: '12m', titulo: 'Últimos 12 meses' },
  { valor: 'todo', titulo: 'Todo el período' },
  { valor: 'personalizado', titulo: 'Personalizado' },
]

const estado = reactive({
  periodo: 'todo' as Periodo,
  desdePersonalizado: '' as string,
  hastaPersonalizado: '' as string,
  sucursal: null as string | null,
})

// Sube en cada "Actualizar" o recálculo: todas las consultas abiertas se repiten.
const version = ref(0)

const opciones = ref<Opciones | null>(null)
const errorOpciones = ref('')
let cargaOpciones: Promise<void> | null = null

function iso (fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

// Primer día del mes que está n meses antes del mes de la fecha de corte.
function inicioDeMes (corte: string, mesesAtras: number): string {
  const [a, m] = corte.split('-').map(Number)
  return iso(new Date(Date.UTC(a!, m! - 1 - mesesAtras, 1)))
}

const rango = computed<{ desde: string | null, hasta: string | null }>(() => {
  const corte = opciones.value?.rango_fechas.hasta
  if (estado.periodo === 'personalizado') {
    return { desde: estado.desdePersonalizado || null, hasta: estado.hastaPersonalizado || null }
  }
  if (!corte || estado.periodo === 'todo') {
    return { desde: null, hasta: null }
  }
  const meses = { 'mes': 0, '3m': 2, '6m': 5, '12m': 11 }[estado.periodo]
  return { desde: inicioDeMes(corte, meses), hasta: corte }
})

// Filtros que se envían a la API en cada consulta.
const filtros = computed<Filtros>(() => ({
  desde: rango.value.desde,
  hasta: rango.value.hasta,
  sucursal: estado.sucursal,
}))

// Mes (AAAA-MM) del final del período: lo usan la proyección y las metas.
const mesActual = computed<string | null>(() => {
  const fin = rango.value.hasta || opciones.value?.rango_fechas.hasta
  return fin ? fin.slice(0, 7) : null
})

function cargarOpciones (forzar = false): Promise<void> {
  if (!cargaOpciones || forzar) {
    cargaOpciones = obtener<Opciones>('/opciones')
      .then(datos => {
        opciones.value = datos
        errorOpciones.value = ''
      })
      .catch(error => {
        errorOpciones.value = mensajeDeError(error)
        cargaOpciones = null
      })
  }
  return cargaOpciones
}

function refrescar () {
  version.value++
  return cargarOpciones(true)
}

export function useFiltros () {
  return { estado, opciones, errorOpciones, rango, filtros, mesActual, version, cargarOpciones, refrescar }
}
