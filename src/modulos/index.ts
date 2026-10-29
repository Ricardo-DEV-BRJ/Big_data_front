import type { Rol } from '@/services/auth'
/**
 * Módulos del panel. Cada módulo vive en su propia carpeta (src/modulos/<módulo>/)
 * con su pantalla y sus componentes; esta lista alimenta el menú lateral y las rutas.
 */
import type { Component } from 'vue'
import { GRUPOS } from '@/services/auth'

export interface Modulo {
  ruta: string
  titulo: string
  descripcion: string
  icono: string
  componente: () => Promise<Component>
  roles: Rol[]
}

export const MODULOS: Modulo[] = [
  {
    ruta: 'ejecutivo',
    titulo: 'Tablero ejecutivo',
    descripcion: 'Ventas del día, margen, stock mínimo, duplicados, previsión y alertas',
    icono: 'mdi-monitor-dashboard',
    componente: () => import('./ejecutivo/EjecutivoModulo.vue'),
    roles: GRUPOS.direccion,
  },
  {
    ruta: 'resumen',
    titulo: 'Resumen',
    descripcion: 'Indicadores clave del negocio en el período',
    icono: 'mdi-view-dashboard-outline',
    componente: () => import('./resumen/ResumenModulo.vue'),
    roles: GRUPOS.direccion,
  },
  {
    ruta: 'ventas',
    titulo: 'Ventas',
    descripcion: 'Evolución, estacionalidad, horas pico, descuentos e impuestos',
    icono: 'mdi-chart-areaspline',
    componente: () => import('./ventas/VentasModulo.vue'),
    roles: GRUPOS.comercial,
  },
  {
    ruta: 'productos',
    titulo: 'Productos',
    descripcion: 'Ranking, Pareto ABC, categorías, marcas, precios y devoluciones',
    icono: 'mdi-package-variant-closed',
    componente: () => import('./productos/ProductosModulo.vue'),
    roles: GRUPOS.comercial,
  },
  {
    ruta: 'clientes',
    titulo: 'Clientes',
    descripcion: 'Segmentos, RFM, retención, concentración y valor de vida',
    icono: 'mdi-account-group-outline',
    componente: () => import('./clientes/ClientesModulo.vue'),
    roles: GRUPOS.comercial,
  },
  {
    ruta: 'cobranza',
    titulo: 'Cobranza',
    descripcion: 'Cuentas por cobrar, antigüedad, días de cobro y flujo esperado',
    icono: 'mdi-cash-clock',
    componente: () => import('./cobranza/CobranzaModulo.vue'),
    roles: GRUPOS.finanzas,
  },
  {
    ruta: 'comercial',
    titulo: 'Equipo comercial',
    descripcion: 'Vendedores, sucursales y cumplimiento de metas',
    icono: 'mdi-account-tie-outline',
    componente: () => import('./comercial/ComercialModulo.vue'),
    roles: GRUPOS.finanzas,
  },
  {
    ruta: 'pagos',
    titulo: 'Pagos y monedas',
    descripcion: 'Tasas BCV/USDT/EUR, alertas de tasa y margen, métodos de pago y monedas',
    icono: 'mdi-credit-card-outline',
    componente: () => import('./pagos/PagosModulo.vue'),
    roles: GRUPOS.finanzas,
  },
  {
    ruta: 'inventario',
    titulo: 'Inventario',
    descripcion: 'Rotación A/M/B, stock de seguridad, punto de reorden, quiebres y venta perdida',
    icono: 'mdi-warehouse',
    componente: () => import('./inventario/InventarioModulo.vue'),
    roles: GRUPOS.operaciones,
  },
  {
    ruta: 'proveedores',
    titulo: 'Proveedores',
    descripcion: 'Compras, tiempos de entrega, cumplimiento y margen por proveedor',
    icono: 'mdi-truck-delivery-outline',
    componente: () => import('./proveedores/ProveedoresModulo.vue'),
    roles: GRUPOS.operaciones,
  },
  {
    ruta: 'calidad',
    titulo: 'Calidad de datos',
    descripcion: 'Problemas detectados en los reportes y estado de los recálculos',
    icono: 'mdi-shield-check-outline',
    componente: () => import('./calidad/CalidadModulo.vue'),
    roles: GRUPOS.finanzas,
  },
  {
    ruta: 'bitacora',
    titulo: 'Bitácora',
    descripcion: 'Registro de auditoría: quién hizo qué, cuándo y con qué valores',
    icono: 'mdi-clipboard-text-clock-outline',
    componente: () => import('./bitacora/BitacoraModulo.vue'),
    roles: GRUPOS.direccion,
  },
  {
    ruta: 'usuarios',
    titulo: 'Usuarios',
    descripcion: 'Creación y gestión de cuentas del sistema',
    icono: 'mdi-account-cog-outline',
    componente: () => import('./usuarios/UsuariosModulo.vue'),
    roles: GRUPOS.sistema,
  },
]
