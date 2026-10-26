<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiCall } from '@/config/api'
import { mensajeDeError } from '@/services/metricas'
import type { Rol } from '@/services/auth'

interface UsuarioListado {
  id: number
  email: string
  rol: Rol
  must_change_password: boolean
  created_at: string
}

interface RespuestaListado {
  filas: UsuarioListado[]
  total: number
}

const roles: Rol[] = ['vendedor', 'gerente', 'administrador']
const usuarios = ref<UsuarioListado[]>([])
const email = ref('')
const password = ref('')
const rol = ref<Rol>('vendedor')
const buscando = ref('')
const error = ref('')
const aviso = ref('')
const cargando = ref(false)

async function cargarUsuarios() {
  cargando.value = true
  error.value = ''
  try {
    const consulta = new URLSearchParams({ search: buscando.value, page: '1', itemsPerPage: '100' })
    const respuesta = await apiCall(`auth/usuarios?${consulta}`) as { data: RespuestaListado }
    usuarios.value = respuesta.data.filas
  } catch (err) {
    error.value = mensajeDeError(err)
  } finally {
    cargando.value = false
  }
}

async function crearUsuario() {
  error.value = ''
  aviso.value = ''
  try {
    await apiCall('auth/usuarios', { email: email.value, password: password.value, rol: rol.value }, 'POST')
    aviso.value = 'La cuenta fue creada. El usuario deberá cambiar la contraseña temporal al ingresar.'
    email.value = ''
    password.value = ''
    rol.value = 'vendedor'
    await cargarUsuarios()
  } catch (err) {
    error.value = mensajeDeError(err)
  }
}

async function desactivarUsuario(usuario: UsuarioListado) {
  if (!window.confirm(`¿Desactivar la cuenta de ${usuario.email}?`)) return
  error.value = ''
  aviso.value = ''
  try {
    await apiCall(`auth/usuarios/${usuario.id}`, {}, 'DELETE')
    aviso.value = 'La cuenta fue desactivada.'
    await cargarUsuarios()
  } catch (err) {
    error.value = mensajeDeError(err)
  }
}

onMounted(cargarUsuarios)
</script>

<template>
  <div class="d-flex flex-column ga-6">
    <v-card>
      <v-card-title>Crear cuenta</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          La contraseña temporal debe tener al menos 8 caracteres; se solicitará una nueva en el primer ingreso.
        </p>
        <v-alert v-if="error" class="mb-4" :text="error" type="error" variant="tonal" />
        <v-alert v-if="aviso" class="mb-4" :text="aviso" type="success" variant="tonal" />
        <v-form class="d-flex flex-wrap align-start ga-3" @submit.prevent="crearUsuario">
          <v-text-field v-model.trim="email" autocomplete="off" class="flex-grow-1" label="Correo electrónico"
            required type="email" />
          <v-text-field v-model="password" autocomplete="new-password" label="Contraseña temporal"
            minlength="8" required type="password" />
          <v-select v-model="rol" :items="roles" label="Rol" />
          <v-btn class="mt-2" color="primary" type="submit">Crear usuario</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <span>Usuarios</span>
        <v-spacer />
        <v-text-field v-model="buscando" clearable density="compact" hide-details label="Buscar por email o rol"
          prepend-inner-icon="mdi-magnify" style="max-width: 320px" @keyup.enter="cargarUsuarios"
          @click:clear="cargarUsuarios" />
        <v-btn :loading="cargando" variant="tonal" @click="cargarUsuarios">Buscar</v-btn>
      </v-card-title>
      <v-data-table :headers="[
        { title: 'Correo', key: 'email' },
        { title: 'Rol', key: 'rol' },
        { title: 'Cambio de contraseña', key: 'must_change_password' },
        { title: 'Creado', key: 'created_at' },
        { title: 'Acciones', key: 'acciones', sortable: false },
      ]" :items="usuarios" :loading="cargando" no-data-text="No hay usuarios para mostrar">
        <template #item.must_change_password="{ item }">
          {{ item.must_change_password ? 'Pendiente' : 'Completado' }}
        </template>
        <template #item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>
        <template #item.acciones="{ item }">
          <v-btn aria-label="Desactivar usuario" color="error" icon="mdi-account-off-outline" size="small"
            variant="text" @click="desactivarUsuario(item)" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
