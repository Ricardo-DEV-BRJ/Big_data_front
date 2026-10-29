<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { actualizarPassword, inicioPorRol, usuarioActual } from '@/services/auth'
  import { mensajeDeError } from '@/services/metricas'

  const router = useRouter()
  const usuario = usuarioActual()
  const passwordActual = ref('')
  const passwordNueva = ref('')
  const confirmacion = ref('')
  const error = ref('')
  const cargando = ref(false)

  async function cambiar () {
    error.value = ''
    if (passwordNueva.value.length < 8) {
      error.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
      return
    }
    if (passwordNueva.value !== confirmacion.value) {
      error.value = 'Las contraseñas nuevas no coinciden.'
      return
    }

    cargando.value = true
    try {
      const actualizada = await actualizarPassword(
        usuario?.must_change_password ? undefined : passwordActual.value,
        passwordNueva.value,
      )
      await router.replace(inicioPorRol(actualizada.rol))
    } catch (error_) {
      error.value = mensajeDeError(error_)
    } finally {
      cargando.value = false
    }
  }
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="480" width="100%">
      <v-card-title class="text-h5">Define tu nueva contraseña</v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-5">
          Debes actualizar la contraseña temporal antes de continuar al sistema.
        </p>

        <v-alert
          v-if="error"
          class="mb-4"
          :text="error"
          type="error"
          variant="tonal"
        />

        <v-form @submit.prevent="cambiar">
          <v-text-field
            v-if="!usuario?.must_change_password"
            v-model="passwordActual"
            autocomplete="current-password"
            label="Contraseña actual"
            required
            type="password"
          />

          <v-text-field
            v-model="passwordNueva"
            autocomplete="new-password"
            label="Nueva contraseña"
            minlength="8"
            required
            type="password"
          />

          <v-text-field
            v-model="confirmacion"
            autocomplete="new-password"
            label="Confirmar nueva contraseña"
            minlength="8"
            required
            type="password"
          />

          <v-btn block color="primary" :loading="cargando" type="submit">Guardar contraseña</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
