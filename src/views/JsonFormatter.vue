<script>
import { ElMessage } from 'element-plus'
import { copyText } from '@/assets/js/utils'

export default {
  name: 'JsonFormatterView',
  data() {
    return {
      inputJson: '',
      formattedJson: '',
      lastFormattedJson: '',
      sortState: 0,
      compressState: 0,
      isValidJson: false
    }
  },
  computed: {
    sortButtonText() {
      const texts = ['排序格式化', '取消排序', '排序格式化']
      return texts[this.sortState]
    },
    compressButtonText() {
      const texts = ['压缩', '取消压缩', '压缩']
      return texts[this.compressState]
    }
  },
  watch: {
    inputJson: {
      handler: 'handleInputChange',
      immediate: true
    }
  },
  methods: {
    resetStates() {
      // 重置所有状态
      this.sortState = 0
      this.compressState = 0
      this.lastFormattedJson = ''
      this.isValidJson = false
    },

    handleInputChange() {
      // 重置所有状态
      this.resetStates()
      
      // 验证 JSON 格式并格式化
      try {
        if (this.inputJson.trim()) {
          const parsed = JSON.parse(this.inputJson)
          this.isValidJson = true
          // 使用标准格式化
          this.formattedJson = JSON.stringify(parsed, null, 2)
        } else {
          this.formattedJson = ''
        }
      } catch (e) {
        this.formattedJson = '无效的 JSON 格式'
        ElMessage.error('无效的 JSON 格式')
      }
    },

    formatJson() {
      if (!this.inputJson.trim()) {
        this.formattedJson = ''
        return
      }
      try {
        const parsed = JSON.parse(this.inputJson)
        this.formattedJson = JSON.stringify(parsed, null, 2)
        this.lastFormattedJson = this.formattedJson
      } catch (e) {
        this.formattedJson = '无效的 JSON 格式'
        ElMessage.error('无效的 JSON 格式')
      }
    },

    sortObjectByKey(obj) {
      if (typeof obj !== 'object' || obj === null) return obj

      if (Array.isArray(obj)) {
        return obj.map(this.sortObjectByKey)
      }

      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.sortObjectByKey(obj[key])
          return acc
        }, {})
    },

    sortAndFormatJson() {
      if (!this.inputJson.trim() || !this.isValidJson) {
        return
      }
      try {
        if (this.sortState === 0) {
          const parsed = JSON.parse(this.inputJson)
          const sorted = this.sortObjectByKey(parsed)
          this.lastFormattedJson = this.formattedJson
          this.formattedJson = JSON.stringify(sorted, null, 2)
          this.sortState = 1
        } else if (this.sortState === 1) {
          this.formattedJson = this.lastFormattedJson
          this.sortState = 2
        } else {
          const parsed = JSON.parse(this.inputJson)
          const sorted = this.sortObjectByKey(parsed)
          this.lastFormattedJson = this.formattedJson
          this.formattedJson = JSON.stringify(sorted, null, 2)
          this.sortState = 1
        }
      } catch (e) {
        ElMessage.error('无效的 JSON 格式')
      }
    },

    compressJson() {
      if (!this.inputJson.trim() || !this.isValidJson) {
        return
      }
      try {
        if (this.compressState === 0) {
          const parsed = JSON.parse(this.inputJson)
          this.lastFormattedJson = this.formattedJson
          this.formattedJson = JSON.stringify(parsed).replace(/\s+/g, '')
          this.compressState = 1
        } else if (this.compressState === 1) {
          this.formattedJson = this.lastFormattedJson
          this.compressState = 2
        } else {
          const parsed = JSON.parse(this.inputJson)
          this.lastFormattedJson = this.formattedJson
          this.formattedJson = JSON.stringify(parsed).replace(/\s+/g, '')
          this.compressState = 1
        }
      } catch (e) {
        ElMessage.error('无效的 JSON 格式')
      }
    },

    clearAll() {
      this.inputJson = ''
      this.formattedJson = ''
      this.resetStates()
    },

    async copyFormattedJson() {
      const textToCopy = this.formattedJson
      if (!textToCopy || textToCopy === '无效的 JSON 格式') {
        ElMessage.warning('当前没有可复制的内容')
        return
      }

      try {
        await copyText(textToCopy)
        ElMessage.success('复制成功！')
      } catch (err) {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制。')
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <div class="card">
      <div class="button-group">
        <el-button 
          type="primary" 
          @click="sortAndFormatJson" 
          :disabled="!isValidJson"
        >
          {{ sortButtonText }}
        </el-button>
        <el-button 
          type="primary" 
          @click="compressJson" 
          :disabled="!isValidJson"
        >
          {{ compressButtonText }}
        </el-button>
        <el-button type="primary" @click="clearAll">清空</el-button>
        <el-button 
          type="primary" 
          @click="copyFormattedJson"
          :disabled="!formattedJson || formattedJson === '无效的 JSON 格式'"
        >
          复制
        </el-button>
      </div>
      <div class="editor-container">
        <div class="editor-section">
          <el-input
            v-model="inputJson"
            type="textarea"
            :rows="30"
            placeholder="请输入 JSON 内容..."
          />
        </div>
        <div class="editor-section">
          <el-input
            v-model="formattedJson"
            type="textarea"
            :rows="30"
            readonly
          />
        </div>
      </div>
    </div>
  </div>
</template>

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

.button-group {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  height: 32px;
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-section h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 16px;
}

:deep(.el-textarea__inner) {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  height: 100% !important;
  white-space: pre;
}

:deep(.el-textarea__inner[readonly]) {
  white-space: pre;
  overflow-x: auto;
  overflow-y: auto;
}

:deep(.el-textarea) {
  height: 100%;
}

:deep(.el-button) {
  min-width: 80px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
  font-size: 14px;
}
</style>
