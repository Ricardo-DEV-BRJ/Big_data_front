/**
 * Ejecuta una consulta a la API y la repite cada vez que cambian los filtros
 * globales o las dependencias propias de la tarjeta (p. ej. su selector de orden).
 * Si llegan respuestas fuera de orden, solo se conserva la última.
 *
 *   const { datos, cargando, error } = useConsulta(
 *     () => obtener<Producto[]>('/productos', { ...filtros.value, orden: orden.value }),
 *     () => orden.value,
 *   )
 */
import type { Ref } from 'vue'
import { ref, shallowRef, watch } from 'vue'
import { mensajeDeError } from '@/services/metricas'
import { useFiltros } from './useFiltros'

export function useConsulta<T> (consulta: () => Promise<T>, dependencias: () => unknown = () => null) {
  const { filtros, version } = useFiltros()
  const datos = shallowRef<T | null>(null) as Ref<T | null>
  const cargando = ref(false)
  const error = ref('')
  let turno = 0

  function recargar () {
    const actual = ++turno
    cargando.value = true
    error.value = ''
    consulta()
      .then(resultado => {
        if (actual === turno) {
          datos.value = resultado
        }
      })
      .catch(error_ => {
        if (actual === turno) {
          error.value = mensajeDeError(error_)
        }
      })
      .finally(() => {
        if (actual === turno) {
          cargando.value = false
        }
      })
  }

  // Se compara el contenido (no la referencia): si los filtros se recalculan con los mismos
  // valores, no se repite la consulta.
  watch(
    [() => JSON.stringify(filtros.value), version, () => JSON.stringify(dependencias())],
    recargar,
    { immediate: true },
  )

  return { datos, cargando, error, recargar }
}
