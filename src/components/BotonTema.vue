<script setup>
  import { useTheme } from 'vuetify'

  const theme = useTheme()

  function toggleTheme () {
    const newTheme = theme.global.current.value.dark ? 'light_JM' : 'dark_JM'
    theme.change(newTheme)
  }
</script>

<template>
  <div>
    <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="small" @click="toggleTheme" />
  </div>
</template>
