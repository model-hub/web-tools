<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'LogParserView',
  data() {
    return {
      inputJson: '',
      tableData: [],
      columns: [],
      tableName: '',
      hasValidData: false,
      parseTimer: null
    }
  },
  watch: {
    inputJson: {
      handler: 'autoParse',
      immediate: true
    }
  },
  methods: {
    autoParse() {
      // 防抖处理，避免频繁解析
      if (this.parseTimer) {
        clearTimeout(this.parseTimer)
      }
      
      this.parseTimer = setTimeout(() => {
        if (this.inputJson.trim()) {
          this.parseJson(false) // 静默解析，不显示提示
        } else {
          this.clearTable()
        }
      }, 500) // 500ms 延迟
    },

    parseJson(showMessage = true) {
      if (!this.inputJson.trim()) {
        ElMessage.warning('请输入 JSON 内容')
        return
      }

      try {
        const parsed = JSON.parse(this.inputJson)
        
        // 检查数据结构
        if (!parsed.data || !parsed.data.messageData || !parsed.data.messageData.executionInfos) {
          ElMessage.error('JSON 格式不正确，缺少必要的数据结构')
          this.clearTable()
          return
        }

        const executionInfos = parsed.data.messageData.executionInfos
        
        // 获取第一个执行信息的 response
        if (!executionInfos[0] || !executionInfos[0].response) {
          ElMessage.error('未找到响应数据')
          this.clearTable()
          return
        }

        const response = executionInfos[0].response
        
        // 获取表头信息
        if (!response.columnInfos || !Array.isArray(response.columnInfos)) {
          ElMessage.error('未找到列定义信息')
          this.clearTable()
          return
        }

        // 设置列信息 - 使用 minWidth 保证足够宽度
        this.columns = response.columnInfos.map(col => ({
          prop: col.columnName,
          label: col.columnName,
          minWidth: 150 // 最小宽度保证表头完整显示
        }))

        // 获取数据信息
        if (!response.resultData || !Array.isArray(response.resultData)) {
          ElMessage.error('未找到数据信息')
          this.clearTable()
          return
        }

        // 转换数据格式
        this.tableData = response.resultData.map(row => {
          const rowData = {}
          this.columns.forEach(col => {
            const cellData = row[col.prop]
            // 更宽松的取值逻辑：只要有这个字段就取出来，null 也保留
            if (cellData) {
              rowData[col.prop] = cellData.value !== null && cellData.value !== undefined ? cellData.value : ''
            } else {
              // 如果单元格数据完全不存在，也创建一个空值
              rowData[col.prop] = ''
            }
          })
          return rowData
        })

        // 设置表名
        this.tableName = response.statementObject || '查询结果'
        this.hasValidData = true

        // 调试信息：输出列和数据详情
        console.log('解析到的列:', this.columns.map(c => c.prop))
        console.log('解析的数据条数:', this.tableData.length)
        if (this.tableData.length > 0) {
          console.log('第一条数据:', this.tableData[0])
        }

        ElMessage.success(`解析成功，共 ${this.tableData.length} 条数据`)
      } catch (e) {
        console.error('解析失败:', e)
        if (showMessage) {
          ElMessage.error('JSON 解析失败：' + e.message)
        }
        this.clearTable()
      }
    },

    clearAll() {
      this.inputJson = ''
      this.clearTable()
      if (this.parseTimer) {
        clearTimeout(this.parseTimer)
      }
    },

    clearTable() {
      this.tableData = []
      this.columns = []
      this.tableName = ''
      this.hasValidData = false
    },

    async copyTableData() {
      if (!this.hasValidData || this.tableData.length === 0) {
        ElMessage.warning('当前没有可复制的数据')
        return
      }

      try {
        // 转换为 CSV 格式
        const headers = this.columns.map(col => col.label).join('\t')
        const rows = this.tableData.map(row => 
          this.columns.map(col => row[col.prop] || '').join('\t')
        ).join('\n')
        const csvContent = headers + '\n' + rows

        await copyText(csvContent)
        ElMessage.success('表格数据已复制到剪贴板（CSV 格式）')
      } catch (err) {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制')
      }
    },

    handleCellClick(row, column, cell, event) {
      // 单击单元格时复制内容
      const cellValue = row[column.property]
      if (cellValue) {
        copyText(cellValue).then(() => {
          ElMessage.success('单元格内容已复制')
        }).catch(() => {
          ElMessage.error('复制失败')
        })
      }
    },


  }
}
</script>

<template>
  <div class="page-container">
    <div class="card">
      <div class="button-group">
        <el-button type="primary" @click="parseJson(true)">立即解析</el-button>
        <el-button type="primary" @click="clearAll">清空</el-button>
      </div>
      
      <div class="input-section">
        <h3>JSON 输入</h3>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="3"
          placeholder="请输入日志返回的 JSON 数据...（输入后自动解析）"
        />
      </div>
      
      <div class="table-section">
        <h3 v-if="tableName">{{ tableName }}</h3>
        <h3 v-else>解析结果</h3>
        
        <div v-if="!hasValidData" class="empty-tip">
          <el-empty description="请输入 JSON 数据" />
        </div>
        
        <el-table
          v-else
          :data="tableData"
          style="width: 100%"
          border
          stripe
          height="100%"
          max-height="600"
          class="editable-table fit-content"
          :header-cell-style="{ padding: '8px 0', textAlign: 'center' }"
        >
          <el-table-column
            v-for="(col, index) in columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :min-width="col.minWidth"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-input
                v-model="row[col.prop]"
                type="textarea"
                :rows="1"
                autosize
                :readonly="true"
                class="cell-input"
              />
            </template>
            <template #header>
              <span>{{ col.label }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="hasValidData && tableData.length > 0" class="data-info">
          共 {{ tableData.length }} 条数据
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

.input-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.input-section h3 {
  margin-bottom: 6px;
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.input-section h3,
.table-section h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 16px;
}

.input-section h3 {
  margin-bottom: 8px;
}

:deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  white-space: pre;
}

.empty-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 200px;
}

.data-info {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f9eb;
  border-radius: 4px;
  text-align: right;
  color: #67c23a;
  font-size: 13px;
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

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-table__cell) {
  padding: 4px 0; /* 减小单元格内边距 */
}

/* 表头单元格增加内边距 */
:deep(.el-table__header .el-table__cell) {
  padding: 12px 8px !important;
  height: 48px !important;
  line-height: 1.2 !important;
}

/* 可编辑表格样式 */
.editable-table .cell-input {
  width: 100%;
}

:deep(.cell-input .el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 0 8px; /* 减小上下内边距 */
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  background-color: transparent;
  overflow: hidden;
  word-break: break-all;
  height: auto !important;
  min-height: auto !important;
  display: flex;
  align-items: center; /* 垂直居中 */
}

:deep(.cell-input .el-textarea__inner:hover) {
  background-color: #f5f7fa;
}

:deep(.cell-input .el-textarea__inner:focus) {
  background-color: #fff;
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

/* 固定表格行高 - 减小行高 */
.editable-table .el-table__row td {
  height: 32px !important;
  max-height: 32px !important;
  vertical-align: middle !important; /* 垂直居中 */
}

.editable-table .el-table__row .cell-input {
  height: 32px !important;
  display: flex;
  align-items: center; /* 垂直居中 */
}

.editable-table .el-table__row .cell-input .el-textarea {
  height: 32px !important;
  display: flex;
  align-items: center; /* 垂直居中 */
}

.editable-table .el-table__row .cell-input .el-textarea__inner {
  height: 32px !important;
  line-height: 1.5;
  display: flex;
  align-items: center; /* 垂直居中 */
}

/* 表头和内容自适应宽度 */
.fit-content {
  table-layout: auto !important;
}

/* 表头和单元格样式优化 */
.editable-table.fit-content .el-table__header th.el-table__cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  padding: 12px 8px !important;
  height: 48px !important; /* 固定表头高度 */
  line-height: 1.2 !important;
}

/* 确保表头内容完整显示 */
.editable-table.fit-content .el-table__header .cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.2 !important;
}

/* 针对 Element Plus 的 cell 类 - 表头和内容都隐藏溢出 */
.editable-table.fit-content .el-table__header .el-table__cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  height: 48px !important;
  line-height: 1.2 !important;
}

.editable-table.fit-content .el-table__body .el-table__cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 输入框内部也强制不换行 */
.editable-table.fit-content .cell-input .el-textarea__inner {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
}

/* 确保表格列宽自适应 */
.editable-table.fit-content {
  width: 100%;
}
</style>
