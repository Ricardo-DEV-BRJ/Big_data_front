/**
 * Formato de números, montos, porcentajes y fechas para todo el panel.
 * Los montos de la API vienen en USD; fmtMoneda y fmtMonedaCorta los muestran en la
 * moneda elegida en la barra de filtros, convertidos con la tasa vigente.
 */
import { reactive } from 'vue'

const LOCALE = 'es-VE'

export type CodigoMoneda = 'USD' | 'VES' | 'USDT' | 'EUR'

export interface TasaVigente {
  fecha: string
  hora: string
  tasa_bcv: number
  tasa_usdt: number | null
  tasa_eur: number | null
  fuente: string
}

const SIMBOLOS: Record<CodigoMoneda, string> = { USD: '$', VES: 'Bs', USDT: 'USDT', EUR: '€' }

export const monedaVista = reactive({ codigo: 'USD' as CodigoMoneda, simbolo: '$', factor: 1 })

// Factor USD -> moneda: a Bs con la BCV; a USDT y EUR pasando por Bs con su tasa.
export function factorMoneda (codigo: CodigoMoneda, tasa: TasaVigente | null | undefined): number | null {
  if (codigo === 'USD') {
    return 1
  }
  if (!tasa?.tasa_bcv) {
    return null
  }
  if (codigo === 'VES') {
    return tasa.tasa_bcv
  }
  const destino = codigo === 'USDT' ? tasa.tasa_usdt : tasa.tasa_eur
  return destino ? tasa.tasa_bcv / destino : null
}

export function usarMoneda (codigo: CodigoMoneda, tasa: TasaVigente | null | undefined): boolean {
  const factor = factorMoneda(codigo, tasa)
  if (factor === null) {
    return false
  }
  monedaVista.codigo = codigo
  monedaVista.simbolo = SIMBOLOS[codigo]
  monedaVista.factor = factor
  return true
}

const entero = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 })
const decimalCentavos = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compacto = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })

type Valor = number | string | null | undefined

function numero (v: Valor): number | null {
  if (v == null || v === '') {
    return null
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function fmtEntero (v: Valor): string {
  const n = numero(v)
  return n === null ? '—' : entero.format(n)
}

export function fmtDecimal (v: Valor): string {
  const n = numero(v)
  return n === null ? '—' : decimal.format(n)
}

export function fmtMoneda (v: Valor, centavos = false): string {
  const n = numero(v)
  if (n === null) {
    return '—'
  }
  return `${monedaVista.simbolo} ${(centavos ? decimalCentavos : entero).format(n * monedaVista.factor)}`
}

// $ 1,2 M · para tarjetas y ejes donde no cabe el monto completo.
export function fmtMonedaCorta (v: Valor): string {
  const n = numero(v)
  return n === null ? '—' : `${monedaVista.simbolo} ${compacto.format(n * monedaVista.factor)}`
}

export function fmtCompacto (v: Valor): string {
  const n = numero(v)
  return n === null ? '—' : compacto.format(n)
}

export function fmtPct (v: Valor, decimales = 1): string {
  const n = numero(v)
  return n === null ? '—' : `${n.toFixed(decimales).replace('.', ',')} %`
}

// Variación con signo: +4,2 % / −3,1 %
export function fmtVariacion (v: Valor): string {
  const n = numero(v)
  if (n === null) {
    return '—'
  }
  return `${n > 0 ? '+' : (n < 0 ? '−' : '')}${Math.abs(n).toFixed(1).replace('.', ',')} %`
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// 'AAAA-MM-DD' -> 'sep 2026'
export function fmtMes (fecha: string | null | undefined): string {
  if (!fecha) {
    return '—'
  }
  const [a, m] = fecha.split('-')
  return `${MESES[Number(m) - 1]} ${a}`
}

// 'AAAA-MM-DD' -> '14 sep 2026'
export function fmtFecha (fecha: string | null | undefined): string {
  if (!fecha) {
    return '—'
  }
  const [a, m, d] = fecha.slice(0, 10).split('-')
  return `${Number(d)} ${MESES[Number(m) - 1]} ${a}`
}

// 'AAAA-MM-DD' -> '14 sep'
export function fmtDia (fecha: string | null | undefined): string {
  if (!fecha) {
    return '—'
  }
  const [, m, d] = fecha.slice(0, 10).split('-')
  return `${Number(d)} ${MESES[Number(m) - 1]}`
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
