<script>
import { RouterView } from 'vue-router'
import MenuBar from '@/components/MenuBar.vue'
import '@/assets/styles/global.css'

export default {
  name: 'App',
  components: {
    RouterView,
    MenuBar
  }
}
</script>

<template>
  <div class="app-container">
    <MenuBar />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
