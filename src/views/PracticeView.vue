<script setup>
import { useRouter } from 'vue-router'
import PracticePage from '../components/PracticePage.vue'

const router = useRouter()
</script>

<template>
  <PracticePage @go-home="router.push('/')" />
</template>
