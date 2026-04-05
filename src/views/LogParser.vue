<script>
import { ElMessage } from 'element-plus'

const DEBOUNCE_DELAY = 500
const MIN_COLUMN_WIDTH = 150
const DEFAULT_TABLE_NAME = '查询结果'

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
      if (this.parseTimer) {
        clearTimeout(this.parseTimer)
      }
      
      this.parseTimer = setTimeout(() => {
        if (this.inputJson.trim()) {
          this.parseJson(false)
        } else {
          this.clearTable()
        }
      }, DEBOUNCE_DELAY)
    },

    parseJson(showMessage = true) {
      if (!this.inputJson.trim()) {
        ElMessage.warning('请输入 JSON 内容')
        return
      }

      try {
        const parsed = JSON.parse(this.inputJson)
        const response = this.validateAndGetResponse(parsed)
        
        if (!response) return

        this.columns = this.extractColumns(response.columnInfos)
        this.tableData = this.extractTableData(response.resultData)
        this.tableName = response.statementObject || DEFAULT_TABLE_NAME
        this.hasValidData = true

        this.logParseResult()
        ElMessage.success(`解析成功，共 ${this.tableData.length} 条数据`)
      } catch (e) {
        console.error('解析失败:', e)
        if (showMessage) {
          ElMessage.error('JSON 解析失败：' + e.message)
        }
        this.clearTable()
      }
    },

    validateAndGetResponse(parsed) {
      if (!parsed.data?.messageData?.executionInfos) {
        ElMessage.error('JSON 格式不正确，缺少必要的数据结构')
        this.clearTable()
        return null
      }

      const executionInfos = parsed.data.messageData.executionInfos
      
      if (!executionInfos[0]?.response) {
        ElMessage.error('未找到响应数据')
        this.clearTable()
        return null
      }

      const response = executionInfos[0].response
      
      if (!response.columnInfos || !Array.isArray(response.columnInfos)) {
        ElMessage.error('未找到列定义信息')
        this.clearTable()
        return null
      }

      if (!response.resultData || !Array.isArray(response.resultData)) {
        ElMessage.error('未找到数据信息')
        this.clearTable()
        return null
      }

      return response
    },

    extractColumns(columnInfos) {
      return columnInfos.map(col => ({
        prop: col.columnName,
        label: col.columnName,
        minWidth: MIN_COLUMN_WIDTH
      }))
    },

    extractTableData(resultData) {
      return resultData.map(row => {
        const rowData = {}
        this.columns.forEach(col => {
          const cellData = row[col.prop]
          if (cellData) {
            rowData[col.prop] = cellData.value !== null && cellData.value !== undefined ? cellData.value : ''
          } else {
            rowData[col.prop] = ''
          }
        })
        return rowData
      })
    },

    logParseResult() {
      console.log('解析到的列:', this.columns.map(c => c.prop))
      console.log('解析的数据条数:', this.tableData.length)
      if (this.tableData.length > 0) {
        console.log('第一条数据:', this.tableData[0])
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
    }
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
            align="center"
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
  padding: 4px 0;
}

:deep(.el-table__header .el-table__cell) {
  padding: 12px 8px !important;
  height: 48px !important;
  line-height: 1.2 !important;
}

.editable-table .cell-input {
  width: 100%;
}

:deep(.cell-input .el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 0 8px;
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
  align-items: center;
  justify-content: center;
  text-align: center;
}

:deep(.cell-input .el-textarea__inner:hover) {
  background-color: #f5f7fa;
}

:deep(.cell-input .el-textarea__inner:focus) {
  background-color: #fff;
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

.editable-table .el-table__row td {
  height: 32px !important;
  max-height: 32px !important;
  vertical-align: middle !important;
}

.editable-table .el-table__row .cell-input {
  height: 32px !important;
  display: flex;
  align-items: center;
}

.editable-table .el-table__row .cell-input .el-textarea {
  height: 32px !important;
  display: flex;
  align-items: center;
}

.editable-table .el-table__row .cell-input .el-textarea__inner {
  height: 32px !important;
  line-height: 1.5;
  display: flex;
  align-items: center;
}

.fit-content {
  table-layout: auto !important;
  width: 100%;
}

.editable-table.fit-content .el-table__header th.el-table__cell,
.editable-table.fit-content .el-table__header .el-table__cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  padding: 12px 8px !important;
  height: 48px !important;
  line-height: 1.2 !important;
}

.editable-table.fit-content .el-table__header .cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.2 !important;
}

.editable-table.fit-content .el-table__body .el-table__cell {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.editable-table.fit-content .cell-input .el-textarea__inner {
  word-break: keep-all !important;
  white-space: nowrap !important;
  overflow: hidden !important;
}
</style>
