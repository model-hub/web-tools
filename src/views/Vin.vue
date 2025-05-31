<template>
  <div class="page-container">
    <div class="card">
      <div class="vin-display">
        <h3>{{ vin }}</h3>
        <div class="button-group">
          <el-button type="primary" @click="generateNewVin">生成新的车架号</el-button>
          <el-button type="primary" @click="copyVin">复制车架号</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getRandomVin from '@/assets/js/vin'
import { ElMessage } from 'element-plus'
import { copyText } from '@/assets/js/utils'

export default {
  name: 'VinView',
  data() {
    return {
      vin: ''
    }
  },
  created() {
    document.title = 'VIN'
    this.vin = getRandomVin()
  },
  methods: {
    generateNewVin() {
      this.vin = getRandomVin()
    },
    async copyVin() {
      if (!this.vin) {
        ElMessage.warning('当前没有可复制的车架号')
        return
      }

      try {
        await copyText(this.vin)
        ElMessage.success('复制成功！')
      } catch (err) {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制。')
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-white);
  border-radius: 8px;
  box-shadow: var(--box-shadow-light);
  padding: 16px;
  overflow: hidden;
}

.vin-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.vin-display h3 {
  font-size: 24px;
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
}

.button-group {
  display: flex;
  gap: 8px;
}

:deep(.el-button) {
  min-width: 80px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
}
</style>
