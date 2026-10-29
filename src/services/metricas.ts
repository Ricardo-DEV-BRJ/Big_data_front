/**
 * Acceso a la API de métricas (GET /api/metricas/...). Cada función devuelve
 * los datos ya tipados; los filtros vacíos no se envían.
 * Documentación de cada ruta: README de Big_data_TEG, sección "API de métricas".
 */
import type { TasaVigente } from '@/utils/formato'
import { apiCall } from '@/config/api'

export interface Filtros {
  desde?: string | null
  hasta?: string | null
  mes?: string | null
  sucursal?: string | null
  tipo?: string | null
  categoria?: string | null
  marca?: string | null
  proveedor?: string | null
  segmento?: string | null
  buscar?: string | null
  sku?: string | null
  clase?: string | null
  estado?: string | null
  orden?: string | null
  limite?: number | null
}

function consulta (filtros: Filtros = {}): string {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params.set(clave, String(valor))
    }
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

export async function obtener<T> (ruta: string, filtros: Filtros = {}): Promise<T> {
  const res = await apiCall(`metricas${ruta}${consulta(filtros)}`, {}) as { data: T }
  return res.data
}

export async function recalcular (): Promise<{ fecha_corte: string, filas_ventas: number, segundos: number }> {
  const res = await apiCall('metricas/recalcular', {}, 'POST') as { data: { fecha_corte: string, filas_ventas: number, segundos: number } }
  return res.data
}

// Mensaje de error legible a partir de un error de axios.
export function mensajeDeError (err: unknown): string {
  const e = err as { response?: { data?: { error?: string } }, message?: string }
  return e.response?.data?.error || e.message || 'No se pudo cargar la información'
}

// --- Tipos de respuesta -----------------------------------------------------

export interface KpiVentas {
  transacciones: number
  unidades: number
  venta_bruta: number
  descuento: number
  venta_neta: number
  iva: number
  total: number
  costo: number
  margen: number
  margen_pct: number | null
  ticket_promedio: number | null
  unidades_por_venta: number | null
  precio_promedio_ponderado: number | null
  descuento_pct: number | null
}

export interface Resumen extends KpiVentas {
  desde: string | null
  hasta: string | null
  dias: number
  cobrado: number
  por_cobrar: number
  tasa_cobro_pct: number | null
  ventas_credito: number
  anuladas: number
  monto_anulado: number
  devoluciones: number
  monto_devuelto: number
  tasa_devolucion_pct: number | null
  comision_bancaria: number
  total_usd: number
  total_ves: number
  pct_usd: number | null
  venta_neta_diaria: number | null
  clientes_unicos: number
  fecha_corte?: string
  calculado_en?: string
}

export interface PuntoDiario extends KpiVentas {
  fecha: string
  dia_semana: number
  cobrado: number
  pendiente: number
  acumulado_mes: number
  crecimiento_pct: number | null
}

export interface PuntoSemanal extends KpiVentas {
  semana: string
  dias: number
  crecimiento_pct: number | null
}

export interface PuntoMensual extends KpiVentas {
  mes: string
  dias: number
  cobrado: number
  pendiente: number
  devoluciones: number
  anuladas: number
  crecimiento_pct: number | null
}

export interface DiaSemana {
  dia_semana: number
  dias: number
  venta_neta: number
  venta_neta_promedio_dia: number
  transacciones_promedio_dia: number
  ticket_promedio: number
}

export interface GrupoQuincena {
  grupo?: string
  quincena?: string
  dias: number
  venta_neta: number
  venta_neta_promedio_dia: number
  transacciones_promedio_dia: number
}

export interface Quincenas {
  dias_de_cobro: GrupoQuincena[]
  quincenas: GrupoQuincena[]
}

export interface CeldaHora {
  dia_semana: number
  hora: number
  transacciones: number
  venta_neta: number
}

export interface Proyeccion {
  mes: string
  hasta: string | null
  dias_mes: number
  dias_transcurridos: number | null
  venta_neta_acumulada: number | null
  venta_neta_promedio_dia: number | null
  venta_neta_proyectada: number | null
  meta: number | null
  cumplimiento_actual_pct: number | null
  cumplimiento_proyectado_pct: number | null
  venta_neta_mes_anterior: number | null
  crecimiento_proyectado_pct: number | null
}

export interface MesFiscal {
  mes: string
  base_imponible: number
  iva: number
  total: number
  iva_pct: number
  facturas: number
}

export interface Descuento {
  descuento_pct: number
  transacciones: number
  unidades: number
  venta_bruta: number
  descuento: number
  venta_neta: number
  margen: number
  margen_pct: number | null
  unidades_por_venta: number | null
  venta_neta_por_transaccion: number | null
  pct_transacciones: number | null
}

export interface Producto {
  sku: string
  producto: string
  categoria: string | null
  marca: string | null
  proveedor: string | null
  transacciones: number
  unidades: number
  venta_neta: number
  margen: number
  margen_pct: number | null
  participacion_pct: number | null
  pendiente: number
  devoluciones: number
  tasa_devolucion_pct: number | null
}

export interface ProductoAbc {
  sku: string
  producto: string
  categoria: string | null
  venta_neta: number
  participacion_pct: number
  acumulado_pct: number
  clase_abc: string
  ranking_ingreso: number
}

export interface ResumenAbc {
  clase_abc: string
  productos: number
  venta_neta: number
  participacion_pct: number
  pct_productos: number
}

export interface Abc {
  resumen: ResumenAbc[]
  productos: ProductoAbc[]
}

export interface ProductoCatalogo {
  sku: string
  producto: string
  categoria: string | null
  costo_unitario: number | null
}

export interface RangoPrecio {
  rango_precio: string
  productos: number
  precio_minimo: number
  precio_maximo: number
  unidades: number
  venta_neta: number
  margen_pct: number | null
  participacion_pct: number | null
}

export interface Agrupado {
  categoria?: string
  marca?: string
  productos: number
  transacciones: number
  unidades: number
  venta_neta: number
  margen: number
  margen_pct: number | null
  participacion_pct: number | null
  devoluciones: number
  tasa_devolucion_pct: number | null
}

export interface Devoluciones {
  resumen: {
    devoluciones: number
    monto_devuelto: number
    anuladas: number
    monto_anulado: number
    tasa_devolucion_pct: number | null
    tasa_anulacion_pct: number | null
  }
  categorias: { categoria: string, devoluciones: number, monto_devuelto: number, tasa_devolucion_pct: number | null }[]
  productos: { sku: string, producto: string, categoria: string, devoluciones: number, monto_devuelto: number, tasa_devolucion_pct: number | null }[]
}

export interface Cliente {
  identificacion: string
  cliente: string
  tipo_cliente: string
  sucursal_habitual: string | null
  ultima_compra: string | null
  recencia_dias: number | null
  transacciones: number
  total: number
  venta_neta: number
  margen: number
  ticket_promedio: number | null
  pendiente: number
  monto_vencido: number
  pct_pendiente: number | null
  segmento_rfm: string | null
  clv_estimado: number | null
  ranking: number
}

export interface Concentracion {
  clientes: number
  venta_neta: number
  top10_pct: number
  top20_pct: number
  top50_pct: number
  top100_pct: number
  clientes_80_pct: number
  pct_clientes_80: number | null
}

export interface SegmentoRfm {
  segmento_rfm: string
  clientes: number
  venta_neta: number
  participacion_pct: number | null
  recencia_promedio: number | null
  frecuencia_promedio: number | null
  clv_promedio: number | null
}

export interface NuevosRecurrentes {
  mes: string
  activos: number
  nuevos: number
  recurrentes: number
  venta_neta_nuevos: number
  venta_neta_recurrentes: number
}

export interface Cohorte {
  cohorte: string
  mes: string
  meses_desde_alta: number
  activos: number
  clientes_cohorte: number
  retencion_pct: number
}

export interface Segmento {
  tipo_cliente: string
  clientes: number
  transacciones: number
  venta_neta: number
  margen_pct: number | null
  ticket_promedio: number | null
  participacion_pct: number | null
  pendiente: number
  morosidad_pct: number | null
  pct_ventas_credito: number | null
  dias_cobro_promedio: number | null
  pct_pagadas_con_atraso: number | null
}

export interface Antiguedad {
  tramos: { tramo: string, orden_tramo: number, facturas: number, monto: number, pct: number }[]
  por_tipo: { tipo_cliente: string, tramo: string, orden_tramo: number, facturas: number, monto: number }[]
  por_sucursal: { sucursal: string, facturas: number, monto: number, monto_vencido: number }[]
}

export interface MesCobranza {
  mes: string
  ventas_credito: number
  monto_credito: number
  facturas_cobradas: number
  dias_cobro_promedio: number | null
  pct_pagadas_con_atraso: number | null
  pendiente: number
  monto_vencido: number
  morosidad_pct: number | null
}

export interface SemanaFlujo {
  semana: string
  facturas: number
  monto: number
  acumulado: number
}

export interface Vendedor {
  sucursal: string
  vendedor: string
  transacciones: number
  venta_neta: number
  margen_pct: number | null
  descuento_pct: number | null
  tasa_cobro_pct: number | null
  devoluciones: number
  comision: number
  meta: number | null
  cumplimiento_pct: number | null
  ranking: number
}

export interface Sucursal extends KpiVentas {
  sucursal: string
  ciudad: string | null
  estado_geo: string | null
  cobrado: number
  pendiente: number
  participacion_pct: number | null
  meta: number | null
  cumplimiento_pct: number | null
}

export interface MetaVendedor {
  mes: string
  sucursal: string
  vendedor: string
  meta: number
  venta_neta: number
  cumplimiento_pct: number | null
  diferencia: number
}

export interface MetodoPago {
  metodo_pago: string
  moneda: string
  transacciones: number
  total: number
  participacion_pct: number | null
  ticket_promedio: number | null
  comision_bancaria: number
  comision_pct: number | null
  perdida_cambiaria: number
}

export interface Monedas {
  por_mes: { mes: string, moneda: string, total: number, participacion_pct: number | null, perdida_cambiaria: number }[]
  tasa: { mes: string, tasa_inicio: number, tasa_cierre: number, tasa_promedio: number, devaluacion_pct: number | null }[]
}

export interface Tasa {
  fecha: string
  tasa: number
}

export interface InventarioItem {
  sucursal: string
  sku: string
  producto: string
  categoria: string | null
  stock_actual: number
  valor_inventario_actual: number
  rotacion: number | null
  dias_cobertura: number | null
  dias_quiebre: number
  venta_diaria_promedio: number | null
  venta_perdida_unidades: number | null
  venta_perdida_usd: number | null
}

export interface InventarioSucursal {
  sucursal: string
  productos: number
  unidades_en_stock: number
  valor_inventario_actual: number
  valor_inventario_promedio: number
  costo_vendido: number
  rotacion: number | null
  dias_inventario: number | null
  dias_quiebre: number
  productos_con_quiebre: number
  venta_perdida_usd: number
}

export interface InventarioMes {
  mes: string
  valor_inventario_promedio: number
  valor_inventario_cierre: number
  entradas: number
  salidas: number
  dias_quiebre: number
  productos_con_quiebre: number
}

export type ClaseRotacion = 'A' | 'M' | 'B'
export type EstadoStock = 'Agotado' | 'Bajo stock mínimo' | 'Reordenar' | 'Normal'

export interface ProductoReposicion {
  sucursal: string
  sku: string
  producto: string
  categoria: string | null
  zona_almacen: string | null
  perecedero: number | null
  vida_util_dias: number | null
  stock_actual: number
  stock_promedio: number
  unidades_vendidas: number
  indice_rotacion: number | null
  clase_rotacion: ClaseRotacion
  demanda_diaria: number | null
  desviacion_demanda: number | null
  lead_time_dias: number | null
  stock_seguridad: number | null
  punto_reorden: number | null
  estado_stock: EstadoStock
}

export interface Reposicion {
  clases: { clase_rotacion: ClaseRotacion, productos: number, unidades_vendidas: number, indice_promedio: number | null, indice_minimo: number | null, indice_maximo: number | null, con_alerta: number }[]
  matriz: { categoria: string, clase_rotacion: ClaseRotacion, productos: number }[]
  estados: { estado_stock: EstadoStock, productos: number }[]
  productos: ProductoReposicion[]
}

export interface Prevision {
  serie: { mes: string, unidades_reales: number | null, promedio_movil: number | null, suavizamiento: number | null, pronostico: number }[]
  mape_promedio_movil: number | null
  mape_suavizamiento: number | null
  productos: {
    sku: string
    producto: string
    categoria: string | null
    meses: number
    unidades_ultimo_mes: number
    mape_promedio_movil: number | null
    mape_suavizamiento: number | null
    modelo_recomendado: string | null
    mes_siguiente: string
    prevision_siguiente: number | null
  }[]
}

export interface VentaDuplicada {
  id: number
  fecha: string
  fecha_hora: string | null
  cliente: string | null
  identificacion: string | null
  sku: string
  producto: string | null
  cantidad: number
  total: number | null
  vendedor: string | null
}

export interface Duplicados {
  duplicados_exactos: number | null
  posibles_duplicados: number | null
  total_filas: number | null
  posibles_en_periodo: number
  monto_posibles: number
  ventas: VentaDuplicada[]
}

export interface Alerta {
  tipo: string
  nivel: 'alta' | 'media'
  titulo: string
  detalle: string
}

export interface Ejecutivo {
  fecha: string | null
  ventas_dia: { fecha: string, transacciones: number, venta_neta: number, margen: number } | null
  ventas_dia_anterior: { fecha: string, transacciones: number, venta_neta: number, margen: number } | null
  margen: { venta_neta: number | null, margen: number | null, margen_pct: number | null }
  stock: { productos: number, bajo_minimo: number | null, agotados: number | null, por_reordenar: number | null }
  duplicados: { exactos: number | null, posibles: number | null }
  alertas: Alerta[]
}

export interface Proveedor {
  proveedor: string
  productos: number
  ordenes: number
  ordenes_recibidas: number
  ordenes_en_transito: number
  unidades_compradas: number
  monto_comprado: number
  costo_promedio_unitario: number | null
  dias_entrega_promedio: number | null
  entregas_tarde: number
  pct_entregas_tarde: number | null
  dias_retraso_promedio: number | null
  venta_neta: number
  margen: number
  margen_pct: number | null
}

export interface ReglaCalidad {
  dataset: string
  regla: string
  descripcion: string
  filas_afectadas: number
  total_filas: number
  pct: number | null
}

export interface Ejecucion {
  id: number
  inicio: string
  fin: string | null
  segundos: number | null
  estado: string
  fecha_corte: string | null
  filas_ventas: number | null
  detalle: string | null
}

export interface Estado {
  ultima_exitosa: Ejecucion | null
  ejecuciones: Ejecucion[]
}

export interface Opciones {
  rango_fechas: { desde: string | null, hasta: string | null }
  sucursales: { sucursal: string, ciudad: string | null, estado_geo: string | null }[]
  categorias: string[]
  marcas: string[]
  proveedores: string[]
  vendedores: { sucursal: string, vendedor: string }[]
  tipos_cliente: string[]
  segmentos_rfm: string[]
  metodos_pago: string[]
  tasa_vigente: TasaVigente | null
}

// --- Tasas de cambio (GET /api/tasas) ------------------------------------------

export interface TasaRegistro {
  fecha: string
  hora: string
  tasa_bcv: number
  tasa_usdt: number | null
  tasa_eur: number | null
  fuente: string
  origen?: string
  horas_sin_actualizar?: number | null
}

export interface ResumenTasas {
  tasa: TasaRegistro | null
  vencida: boolean
  horas_limite: number
  brecha_usdt_pct?: number | null
  historial: TasaRegistro[]
  registradas: (TasaRegistro & { id: number, registrado_en: string })[]
}

export interface MargenNegativo {
  sku: string
  producto: string
  categoria: string | null
  ventas: number
  unidades: number
  venta_neta: number
  margen: number
  ultima_fecha: string | null
  precio_actual: number | null
  costo_actual: number | null
  descuento_maximo: number | null
}

export async function obtenerApi<T> (ruta: string, filtros: Filtros = {}): Promise<T> {
  const res = await apiCall(`${ruta}${consulta(filtros)}`, {}) as { data: T }
  return res.data
}
