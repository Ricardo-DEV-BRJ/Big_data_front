/**
 * Módulos del panel. Cada módulo vive en su propia carpeta (src/modulos/<módulo>/)
 * con su pantalla y sus componentes; esta lista alimenta el menú lateral y las rutas.
 */
import type { Component } from 'vue'
import type { Rol } from '@/services/auth'

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
    ruta: 'resumen',
    titulo: 'Resumen',
    descripcion: 'Indicadores clave del negocio en el período',
    icono: 'mdi-view-dashboard-outline',
    componente: () => import('./resumen/ResumenModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'ventas',
    titulo: 'Ventas',
    descripcion: 'Evolución, estacionalidad, horas pico, descuentos e impuestos',
    icono: 'mdi-chart-areaspline',
    componente: () => import('./ventas/VentasModulo.vue'),
    roles: ['vendedor', 'gerente', 'administrador'],
  },
  {
    ruta: 'productos',
    titulo: 'Productos',
    descripcion: 'Ranking, Pareto ABC, categorías, marcas, precios y devoluciones',
    icono: 'mdi-package-variant-closed',
    componente: () => import('./productos/ProductosModulo.vue'),
    roles: ['vendedor', 'gerente', 'administrador'],
  },
  {
    ruta: 'clientes',
    titulo: 'Clientes',
    descripcion: 'Segmentos, RFM, retención, concentración y valor de vida',
    icono: 'mdi-account-group-outline',
    componente: () => import('./clientes/ClientesModulo.vue'),
    roles: ['vendedor', 'gerente', 'administrador'],
  },
  {
    ruta: 'cobranza',
    titulo: 'Cobranza',
    descripcion: 'Cuentas por cobrar, antigüedad, días de cobro y flujo esperado',
    icono: 'mdi-cash-clock',
    componente: () => import('./cobranza/CobranzaModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'comercial',
    titulo: 'Equipo comercial',
    descripcion: 'Vendedores, sucursales y cumplimiento de metas',
    icono: 'mdi-account-tie-outline',
    componente: () => import('./comercial/ComercialModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'pagos',
    titulo: 'Pagos y monedas',
    descripcion: 'Métodos de pago, comisiones bancarias, dólares, bolívares y tasa',
    icono: 'mdi-credit-card-outline',
    componente: () => import('./pagos/PagosModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'inventario',
    titulo: 'Inventario',
    descripcion: 'Valor, rotación, cobertura, quiebres de stock y venta perdida',
    icono: 'mdi-warehouse',
    componente: () => import('./inventario/InventarioModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'proveedores',
    titulo: 'Proveedores',
    descripcion: 'Compras, tiempos de entrega, cumplimiento y margen por proveedor',
    icono: 'mdi-truck-delivery-outline',
    componente: () => import('./proveedores/ProveedoresModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'calidad',
    titulo: 'Calidad de datos',
    descripcion: 'Problemas detectados en los reportes y estado de los recálculos',
    icono: 'mdi-shield-check-outline',
    componente: () => import('./calidad/CalidadModulo.vue'),
    roles: ['gerente', 'administrador'],
  },
  {
    ruta: 'usuarios',
    titulo: 'Usuarios',
    descripcion: 'Creación y gestión de cuentas del sistema',
    icono: 'mdi-account-cog-outline',
    componente: () => import('./usuarios/UsuariosModulo.vue'),
    roles: ['administrador'],
  },
]
