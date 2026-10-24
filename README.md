# Big Data — Front

Dashboard web del prototipo Big Data. Muestra las métricas de ventas que calcula la API
(**Big_data_TEG**). La documentación completa del proyecto (arquitectura, ingesta de CSV, data lake,
cálculo de métricas y todos los endpoints) está en el README de **Big_data_TEG**.

```
Reporte CSV ──► API Big_data_TEG (:3000) ──► MinIO (Parquet) ──► DuckDB ──► MariaDB (métricas)
                                                                               │
                                     Este front (:8080) ◄── GET /api/metricas/... ┘
```

## Stack

Vue 3 + Vite, Vuetify 4, Chart.js (`vue-chartjs`), axios, TypeScript, npm.

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

## Estructura

| Archivo | Qué hace |
|---|---|
| `src/main.ts` | Arranque: registra los plugins y monta `App.vue` |
| `src/plugins/` | Vuetify (temas, íconos) y router |
| `src/router/index.ts` | Rutas: `/` (inicio) y `/Dashboard` |
| `src/pages/Dashboard.vue` | Dashboard de ventas: KPI, gráfico de barras y ranking del top de productos |
| `src/components/BotonTema.vue` | Botón para cambiar entre tema claro y oscuro |
| `src/theme/temaJM.ts` | Temas `light_JM` y `dark_JM` |
| `src/config/api.ts` | `apiCall()`: cliente axios hacia la API |

## Llamar a la API

```ts
import { apiCall } from '@/config/api'

apiCall('metricas')                                   // top de productos (lo usa el Dashboard)
apiCall('metricas/resumen?mes=2026-09')               // KPI del mes
apiCall('metricas/ventas/mensuales?sucursal=Maracaibo')
apiCall('metricas/opciones')                          // valores para los filtros
apiCall('metricas/recalcular', {}, 'POST')            // recalcula las métricas
```

`apiCall(endpoint, data, method)` concatena `endpoint` a `VITE_API_URL`, envía cookies
(`withCredentials`) y, si existe la cookie `token`, el encabezado `Authorization: Bearer <token>`.
Devuelve la respuesta de axios: los datos vienen en `result.data`; si hay error, el mensaje viene en
`error.response.data.error`.

Todas las rutas de métricas y sus filtros (`desde`, `hasta`, `mes`, `sucursal`, `tipo`, `categoria`,
`limite`, `orden`…) están en la sección *API de métricas* del README de Big_data_TEG.

## Pendiente

El Dashboard solo muestra el top de productos. El resto de métricas (resumen, series, clientes,
cobranza, inventario, vendedores…) ya está disponible en la API y falta construir sus pantallas.
