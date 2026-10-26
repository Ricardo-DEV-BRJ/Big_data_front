<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cerrarSesion, iniciarSesion, inicioPorRol } from '@/services/auth'
import { mensajeDeError } from '@/services/metricas'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

async function ingresar() {
  error.value = ''
  cargando.value = true
  cerrarSesion()
  try {
    const usuario = await iniciarSesion(email.value, password.value)
    const destino = usuario.must_change_password
      ? '/cambiar-password'
      : typeof route.query.redirect === 'string' ? route.query.redirect : inicioPorRol(usuario.rol)
    await router.replace(destino)
  } catch (err) {
    error.value = mensajeDeError(err)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="440" width="100%">
      <v-card-title class="text-h5">Iniciar sesión</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-5">Accede al panel de Big AgroJM con tu cuenta.</p>
        <v-alert v-if="error" class="mb-4" :text="error" type="error" variant="tonal" />
        <v-form @submit.prevent="ingresar">
          <v-text-field v-model.trim="email" autocomplete="username" label="Correo electrónico"
            required type="email" />
          <v-text-field v-model="password" autocomplete="current-password" label="Contraseña"
            required type="password" />
          <v-btn block color="primary" :loading="cargando" type="submit">Ingresar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
