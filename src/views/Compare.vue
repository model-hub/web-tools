<template>
  <div class="page-container">
    <div class="card">
      <div class="button-group">
        <el-button type="primary" @click="doCompare(1)">左对右去重</el-button>
        <el-button type="primary" @click="doCompare(2)">右对去左重</el-button>
        <el-button type="primary" @click="reset">重置</el-button>
        <el-button type="primary" @click="copy">复制结果</el-button>
      </div>
      <div class="editor-container">
        <div class="editor-section">
          <div class="editor-header">
            <el-upload
              ref="upload1"
              v-model:file-list="fileList1"
              :limit="1"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleChange1"
            >
              <el-button type="primary" plain>
                <el-icon><Document /></el-icon>
              </el-button>
            </el-upload>
          </div>
          <el-input
            v-model="left"
            type="textarea"
            :rows="30"
            resize="none"
            placeholder="请输入左侧文本..."
          />
        </div>
        <div class="editor-section">
          <div class="editor-header">
            <el-upload
              ref="upload2"
              v-model:file-list="fileList2"
              :limit="1"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleChange2"
            >
              <el-button type="primary" plain>
                <el-icon><Document /></el-icon>
              </el-button>
            </el-upload>
          </div>
          <el-input
            v-model="right"
            type="textarea"
            :rows="30"
            resize="none"
            placeholder="请输入右侧文本..."
          />
        </div>
        <div class="editor-section">
          <el-input
            ref="result"
            v-model="result"
            type="textarea"
            :rows="30"
            resize="none"
            readonly
            placeholder="对比结果将在这里显示..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { copyText } from '@/assets/js/utils'

export default {
  name: 'CompareView',
  components: {
    Document
  },
  data() {
    return {
      left: '',
      right: '',
      result: '',
      fileList1: [],
      fileList2: []
    }
  },
  methods: {
    doCompare(type) {
      let left = this.left
      let right = this.right
      let list = []
      if (type === 1) {
        list = this.compare(left.split('\n'), right.split('\n'))
      } else {
        list = this.compare(right.split('\n'), left.split('\n'))
      }
      let str = ''
      for (let i = 0; i < list.length; i++) {
        str += list[i] + '\n'
      }
      this.result = str
    },
    compare(arr1, arr2) {
      return this.findFirstDiff(this.removeEmpty(arr1), this.removeEmpty(arr2))
    },
    removeEmpty(list) {
      const newList = []
      for (let i = 0; i < list.length; i++) {
        let str = list[i].trim()
        if (str) {
          newList.push(str)
        }
      }
      return newList
    },
    findFirstDiff(first, second) {
      const newArr = []
      for (let i = 0; i < first.length; i++) {
        if (second.indexOf(first[i]) === -1) {
          newArr.push(first[i])
        }
      }
      return newArr
    },
    reset() {
      this.left = ''
      this.right = ''
      this.result = ''
    },
    async copy() {
      const textToCopy = this.result
      if (!textToCopy) {
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
    },
    handleChange1(file) {
      const that = this
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onload = function (event) {
        let text = event.target.result
        that.left = text
        that.$refs.upload1.clearFiles()
      }
    },
    handleChange2(file) {
      const that = this
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onload = function (event) {
        let text = event.target.result
        that.right = text
        that.$refs.upload2.clearFiles()
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
  position: relative;
}

.editor-header {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  padding: 4px;
}

:deep(.el-upload) {
  display: block;
}

:deep(.el-button--primary.is-plain) {
  --el-button-hover-bg-color: var(--el-color-primary-light-9);
  --el-button-hover-border-color: var(--el-color-primary-light-7);
  --el-button-hover-text-color: var(--el-color-primary);
  background-color: transparent;
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  padding: 4px;
  min-width: auto;
  border-radius: 4px;
}

:deep(.el-button--primary.is-plain:hover) {
  background-color: var(--el-button-hover-bg-color);
  border-color: var(--el-button-hover-border-color);
  color: var(--el-button-hover-text-color);
}

:deep(.el-icon) {
  font-size: 16px;
  vertical-align: middle;
}

:deep(.el-button .el-icon) {
  margin: 0;
}

:deep(.el-textarea__inner) {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  height: 100% !important;
  padding-top: 36px;
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
</style>
