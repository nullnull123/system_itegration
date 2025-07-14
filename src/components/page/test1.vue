<script setup>
import { ref, onMounted, watchEffect } from 'vue'

// 初始化时从 localStorage 读取存储值
const count = ref(parseInt(localStorage.getItem('savedCount')) || 0)

// 监听 count 变化并自动保存
watchEffect(() => {
  localStorage.setItem('savedCount', count.value)
})
</script>

<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>