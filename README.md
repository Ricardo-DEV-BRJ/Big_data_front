# AgroData JM — Front

Panel web del Modelo AgroData JM (Agro Comercializadora JM). Muestra las métricas, modelos analíticos y
alertas que calcula la API
(**Big_data_TEG**). La documentación completa del proyecto (arquitectura, ingesta de CSV, data lake,
cálculo de métricas y todos los endpoints) está en el README de **Big_data_TEG**.

```
Reporte CSV ──► API Big_data_TEG (:3000) ──► MinIO (Parquet) ──► DuckDB ──► MariaDB (métricas)
                                                                               │
                                     Este front (:8080) ◄── GET /api/metricas/... ┘
```

## Stack

Vue 3 + Vite, Vuetify 4, ApexCharts (`vue3-apexcharts`), axios, TypeScript, npm.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL = http://localhost:3000/api/
npm run dev               # http://localhost:8080
```

La API debe estar corriendo y su variable `CORS_PORT` debe ser el origen de este front
(`http://localhost:8080`). Para tener datos, sigue la sección *Primer uso con datos de prueba* del
README de Big_data_TEG.

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 8080 |
| `npm run build` | Verifica tipos y genera `dist/` |
| `npm run preview` | Sirve la versión de `dist/` |
| `npm run type-check` | Verificación de tipos con vue-tsc |
| `npm run lint` / `npm run lint:fix` | ESLint |

## El panel

Requiere iniciar sesión (`/login`). Cada rol de la Tabla 18 entra a su pantalla y solo ve los módulos de
su área: Gerencia y Soporte TI → Tablero ejecutivo; Administración → Pagos y monedas; Ventas → Ventas;
Almacén → Inventario. Tiene un menú lateral, una barra superior (fecha de corte de los datos,
**Actualizar**, **Recalcular métricas** para Soporte TI y tema claro/oscuro) y una barra de **filtros
globales** que aplica a todos los módulos: período (último mes, 3, 6, 12 meses, todo o personalizado),
sucursal y **moneda** (USD, Bs, USDT o EUR: los montos llegan en USD y se convierten con la tasa
vigente). Algunas tarjetas tienen además sus propios controles (orden, categoría, clase, estado…).

| Módulo | Qué muestra |
|---|---|
| **Tablero ejecutivo** | Figura 18: ventas del día, margen bruto, productos bajo stock mínimo, duplicados detectados, ventas vs previsión (promedio móvil y suavizamiento con MAPE), matriz de rotación A/M/B, frecuencia de compra por segmento y alertas activas (stock, vencimiento, duplicados, tasa vencida, margen negativo). Alertas ambientales y papel evitado figuran como fase futura |
| **Resumen** | KPI con tendencia mensual, evolución de venta y margen, meta del mes (medidor), ventas por segmento y sucursal, productos líderes |
| **Ventas** | Bruta → neta, IVA, tendencia por día/semana/mes, efecto quincena, avance del mes contra la meta, crecimiento mensual, día de la semana, horas pico (mapa de calor), descuentos e IVA por mes |
| **Productos** | Ranking por venta, unidades o margen, categorías (treemap), Pareto y ABC por ingreso, rangos de precio, marcas, devoluciones y productos sin ventas |
| **Clientes** | Activos y nuevos, concentración, tipos de cliente (Productor / Comercio), segmentos RFM con acción sugerida, retención por cohorte y ficha buscable de clientes |
| **Cobranza** | Cartera y vencido, antigüedad por tramo y tipo de cliente, flujo de cobro esperado, días de cobro, cartera por sucursal y deudores |
| **Equipo comercial** | Cumplimiento de metas, venta contra meta por vendedor, medidores por sucursal, desempeño de vendedores, sucursales y metas del mes |
| **Pagos y monedas** | Tasas BCV, USDT y EUR con fecha, hora y fuente, alerta de tasa vencida (>24 h), registro de la tasa del día (Administración; se autorrellena con DolarApi y se puede editar), alertas de margen negativo, peso del dólar, comisiones, pérdida cambiaria y métodos de pago |
| **Inventario** | Rotación A/M/B (fórmula 3), stock de seguridad y punto de reorden (fórmulas 1 y 2) con estado de cada producto, valor, quiebres de stock y venta perdida |
| **Proveedores** | Compras, órdenes en tránsito, puntualidad, compras frente a ventas y margen |
| **Calidad de datos** | Reglas de calidad por dataset, ventas duplicadas (exactas excluidas y posibles) e historial de recálculos |
| **Bitácora** | Registro de auditoría con usuario, acción, IP y valores anterior y nuevo (Gerencia y Soporte TI) |
| **Usuarios** | Alta y baja de cuentas con su rol (Soporte TI) |

Estilo inspirado en las plantillas de dashboard de ApexCharts: tarjetas KPI con mini gráfico, áreas
con degradado, donas, medidores radiales, mapas de calor y treemaps. Los colores de las series siguen
una paleta categórica validada para daltonismo en claro y oscuro; los colores de estado (bien, atención,
crítico) siempre van con ícono y texto.

## Estructura

Cada módulo vive en su propia carpeta con su pantalla y sus componentes:

```
src/
├── modulos/
│   ├── index.ts                  Lista de módulos: alimenta el menú y las rutas
│   ├── resumen/
│   │   ├── ResumenModulo.vue     Pantalla del módulo (arma la cuadrícula)
│   │   └── components/           Una tarjeta por archivo (KpisResumen, EvolucionVentas, MetaMes…)
│   ├── ejecutivo/  ventas/  productos/  clientes/  cobranza/  comercial/
│   └── pagos/  inventario/  proveedores/  calidad/  bitacora/  usuarios/
├── layouts/PanelLayout.vue       Menú lateral, barra superior y filtros globales
├── components/
│   ├── comunes/                  TarjetaKpi, TarjetaPanel (carga / error / vacío), Grafico
│   └── BotonTema.vue             Tema claro / oscuro
├── composables/
│   ├── useFiltros.ts             Filtros globales (período, sucursal) y opciones de la API
│   ├── useConsulta.ts            Consulta reactiva: se repite al cambiar filtros
│   └── useGrafico.ts             Estilo base de ApexCharts y paletas según el tema
├── services/metricas.ts          Llamadas a /api/metricas, /api/tasas y tipos de respuesta
├── services/auth.ts              Sesión, roles (Tabla 18), grupos de permisos e inicio por rol
├── utils/formato.ts              Montos (en la moneda elegida), porcentajes, fechas (es-VE)
├── router/index.ts               /login, /panel/<módulo> y control de acceso por rol
├── theme/temaJM.ts               Temas light_JM y dark_JM
└── config/api.ts                 apiCall(): cliente axios hacia la API
```

### Agregar una tarjeta

```vue
<script setup lang="ts">
  import type { PuntoMensual } from '@/services/metricas'
  import { computed } from 'vue'
  import Grafico from '@/components/comunes/Grafico.vue'
  import TarjetaPanel from '@/components/comunes/TarjetaPanel.vue'
  import { useConsulta } from '@/composables/useConsulta'
  import { useFiltros } from '@/composables/useFiltros'
  import { useGrafico } from '@/composables/useGrafico'
  import { obtener } from '@/services/metricas'

  const { filtros } = useFiltros()
  const { datos, cargando, error, recargar } = useConsulta(() => obtener<PuntoMensual[]>('/ventas/mensuales', filtros.value))
  const { opciones } = useGrafico()
  const opcionesGrafico = computed(() => opciones({ xaxis: { categories: (datos.value ?? []).map(m => m.mes) } }))
</script>

<template>
  <TarjetaPanel :cargando="cargando" :error="error" titulo="Mi tarjeta" @reintentar="recargar">
    <Grafico :opciones="opcionesGrafico" :series="[{ name: 'Venta neta', data: (datos ?? []).map(m => m.venta_neta) }]" tipo="bar" />
  </TarjetaPanel>
</template>
```

- Usa `<Grafico>` y no `<apexchart>` directo: `vue3-apexcharts` pierde los formateadores (funciones)
  al actualizar las opciones; `Grafico` vuelve a montar el gráfico cuando cambian.
- `useConsulta(consulta, dependencias)` repite la consulta cuando cambian los filtros globales o lo que
  devuelva `dependencias` (p. ej. el selector de orden de la tarjeta).
- Para una pantalla nueva, crea `src/modulos/<módulo>/<Modulo>Modulo.vue` y agrégala a `src/modulos/index.ts`.

## Llamar a la API

```ts
import { apiCall } from '@/config/api'

apiCall('metricas')                                   // top de productos
apiCall('metricas/resumen?mes=2026-09')               // KPI del mes
apiCall('metricas/ventas/mensuales?sucursal=Maracaibo')
apiCall('metricas/opciones')                          // valores para los filtros
apiCall('metricas/recalcular', {}, 'POST')            // recalcula las métricas
```

`apiCall(endpoint, data, method)` concatena `endpoint` a `VITE_API_URL` y envía el encabezado
`Authorization: Bearer <token>` con el token guardado al iniciar sesión; un `401` cierra la sesión.
Devuelve la respuesta de axios: los datos vienen en `result.data`; si hay error, el mensaje viene en
`error.response.data.error`.

Todas las rutas de métricas y sus filtros (`desde`, `hasta`, `mes`, `sucursal`, `tipo`, `categoria`,
`limite`, `orden`…) están en la sección *API de métricas* del README de Big_data_TEG.

## Pendiente

- El paquete principal pesa ~1,4 MB (440 kB comprimido) por Vuetify y ApexCharts; los módulos ya se cargan por separado.
- La conversión de moneda usa la tasa vigente para todo el período (no la tasa de cada día).

## Entrega

No incluir `.env`, `node_modules/` ni `dist/` (están en `.gitignore`):
`git archive --format=zip -o ../AgroData_JM_front.zip HEAD`.
