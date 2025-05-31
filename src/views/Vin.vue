<template>
  <div style="display: flex; justify-content: center; margin-top: 10rem">
    <h3>{{ vin }}</h3>
  </div>
</template>

<script>
import getRandomVin from '@/assets/js/vin'
export default {
  name: 'VinView',
  data() {
    return {
      vin: ''
    }
  },
  created() {
    document.title='VIN'
    this.vin = getRandomVin()
  }
}
</script>

<style scoped>
.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

:deep(.el-button) {
  min-width: 80px;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
}
</style>
