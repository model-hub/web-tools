<script>
// 导入 Element Plus 的消息组件
import { ElMessage } from 'element-plus'
// 导入 xlsx 库用于 Excel 导出
import * as XLSX from 'xlsx'

// 常量定义
const DEBOUNCE_DELAY = 500 // 防抖延迟时间（毫秒）
const MIN_COLUMN_WIDTH = 220 // 列最小宽度
const DEFAULT_TABLE_NAME = '查询结果' // 默认表格名称

// 组件定义
export default {
  name: 'LogParserView',
  // 数据定义
  data() {
    return {
      inputJson: '', // 输入的 JSON 字符串
      tableData: [], // 解析后的数据
      columns:[], // 列定义
      tableName: '', // 表格名称
      hasValidData: false, // 是否有有效数据
      parseTimer: null, // 解析定时器
      selectedColumn: null, // 当前选中的列 (为 'ALL' 时表示全选)
      selectedRows: [], // 选中的行
      isResizing: false, // 是否正在调整列宽
      resizeColumnIndex: -1, // 正在调整的列索引
      startX: 0, // 调整开始时的鼠标X坐标
      startWidth: 0 // 调整开始时的列宽度
    }
  },
  // 监听器
  watch: {
    inputJson: {
      handler: 'autoParse', // 输入变化时自动解析
      immediate: true // 初始时立即执行
    }
  },
  // 生命周期钩子 - 组件挂载后
  mounted() {
    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown)
    // 监听文档点击事件
    document.addEventListener('click', this.handleDocumentClick)
    // 监听鼠标移动和释放事件，用于列宽调整
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  // 生命周期钩子 - 组件卸载前
  beforeUnmount() {
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('click', this.handleDocumentClick)
    // 移除鼠标事件监听器
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  },
  // 方法定义
  methods: {
    // 处理键盘事件
    handleKeyDown(e) {
      // 当按下 Ctrl+C 且有选中项时，复制数据
      if (e.ctrlKey && e.key === 'c' && this.selectedColumn) {
        this.copyColumnData()
      }
    },

    // 处理文档点击事件
    handleDocumentClick(e) {
      // 检查点击的元素是否在表头内
      const tableHeader = e.target.closest('.table-header')
      // 如果不在表头内，取消选中列
      if (!tableHeader) {
        this.selectedColumn = null
      }
    },

    // 自动解析（带防抖）
    autoParse() {
      // 清除之前的定时器
      if (this.parseTimer) {
        clearTimeout(this.parseTimer)
      }
      
      // 设置新的定时器
      this.parseTimer = setTimeout(() => {
        // 如果输入不为空，解析 JSON
        if (this.inputJson.trim()) {
          this.parseJson(false)
        } else {
          // 否则清空表格
          this.clearTable()
        }
      }, DEBOUNCE_DELAY)
    },

    // 解析 JSON
    parseJson(showMessage = true) {
      // 检查输入是否为空
      if (!this.inputJson.trim()) {
        showMessage && ElMessage.warning('请输入 JSON 内容')
        return
      }

      try {
        // 解析 JSON
        const parsed = JSON.parse(this.inputJson)
        // 验证并获取响应数据
        const response = this.validateAndGetResponse(parsed)
        
        // 如果响应数据无效，返回
        if (!response) return

        // 提取列信息
        this.columns = this.extractColumns(response.columnInfos)
        // 提取表格数据
        this.tableData = this.extractTableData(response.resultData)
        // 设置表格名称
        this.tableName = response.statementObject || DEFAULT_TABLE_NAME
        // 设置有有效数据标志
        this.hasValidData = true

        // 显示成功消息
        showMessage && ElMessage.success(`解析成功，共 ${this.tableData.length} 条数据`)
      } catch (e) {
        // 解析失败
        console.error('解析失败:', e)
        if (showMessage) {
          ElMessage.error('JSON 解析失败：' + e.message)
        }
        // 清空表格
        this.clearTable()
      }
    },

    // 验证并获取响应数据
    validateAndGetResponse(parsed) {
      // 检查是否包含必要的数据结构
      if (!parsed.data?.messageData?.executionInfos) {
        ElMessage.error('JSON 格式不正确，缺少必要的数据结构')
        this.clearTable()
        return null
      }

      // 获取执行信息
      const executionInfos = parsed.data.messageData.executionInfos
      
      // 检查是否包含响应数据
      if (!executionInfos[0]?.response) {
        ElMessage.error('未找到响应数据')
        this.clearTable()
        return null
      }

      // 获取响应数据
      const response = executionInfos[0].response
      
      // 检查是否包含列定义
      if (!response.columnInfos || !Array.isArray(response.columnInfos)) {
        ElMessage.error('未找到列定义信息')
        this.clearTable()
        return null
      }

      // 检查是否包含数据信息
      if (!response.resultData || !Array.isArray(response.resultData)) {
        ElMessage.error('未找到数据信息')
        this.clearTable()
        return null
      }

      // 返回响应数据
      return response
    },

    // 提取列信息
    extractColumns(columnInfos) {
      // 映射列信息为表格列定义
      return columnInfos.map(col => ({
        prop: col.columnName, // 列属性名
        label: col.columnName, // 列显示名称
        minWidth: MIN_COLUMN_WIDTH // 列最小宽度
      }))
    },

    // 提取表格数据
    extractTableData(resultData) {
      // 映射结果数据为表格行数据
      return resultData.map(row => {
        const rowData = {}
        // 遍历列定义，提取对应的数据
        this.columns.forEach(col => {
          const cellData = row[col.prop]
          if (cellData) {
            // 如果有数据，使用值；否则使用空字符串
            rowData[col.prop] = cellData.value !== null && cellData.value !== undefined ? cellData.value : ''
          } else {
            // 如果没有数据，使用空字符串
            rowData[col.prop] = ''
          }
        })
        return rowData
      })
    },

    // 清空所有内容
    clearAll() {
      // 清空输入
      this.inputJson = ''
      // 清空表格
      this.clearTable()
      // 清除定时器
      if (this.parseTimer) {
        clearTimeout(this.parseTimer)
      }
    },

    // 清空表格
    clearTable() {
      // 清空数据
      this.tableData = []
      this.columns =[]
      this.tableName = ''
      this.hasValidData = false
      this.selectedColumn = null
    },

    // 处理全选点击
    handleSelectAll() {
      this.selectedColumn = this.selectedColumn === 'ALL' ? null : 'ALL'
    },

    // 处理表头点击
    handleHeaderClick(column) {
      // 切换列的选中状态
      this.selectedColumn = this.selectedColumn === column.prop ? null : column.prop
    },

    // 复制数据到剪贴板
    copyColumnData() {
      // 如果没有选中列，返回
      if (!this.selectedColumn) return
      
      let copyText = ''

      if (this.selectedColumn === 'ALL') {
        // 全选：复制整个表格的数据（带表头）
        const headers = this.columns.map(col => col.label).join('\t')
        const rows = this.tableData.map(row => {
          const rowData = []
          this.columns.forEach(col => {
            const value = row[col.prop]
            rowData.push(value !== null && value !== undefined ? String(value) : '')
          })
          return rowData.join('\t')
        })
        copyText = [headers, ...rows].join('\n')
      } else {
        // 单列：提取选中列的数据
        copyText = this.tableData.map(row => {
          const value = row[this.selectedColumn]
          // 确保值是字符串类型
          const stringValue = value !== null && value !== undefined ? String(value) : ''
          // 直接返回字符串值，不做额外处理
          return stringValue
        }).join('\n')
      }
      
      // 复制到剪贴板
      navigator.clipboard.writeText(copyText).then(() => {
        const msg = this.selectedColumn === 'ALL' 
          ? `已复制全部 ${this.tableData.length} 条数据到剪贴板`
          : `已复制单列 ${this.tableData.length} 条数据到剪贴板`
        ElMessage.success(msg)
      }).catch(err => {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制')
      })
    },
    
    // 处理单个单元格的复制
    handleCellCopy(event) {
      // 当用户在单元格内按 Ctrl+C 时，直接复制单元格内容
      if (event.ctrlKey && event.key === 'c') {
        const textarea = event.target
        textarea.select()
        // 浏览器会自动处理复制，保留换行符
      }
    },
    
    // 开始调整列宽
    startResize(event, columnIndex) {
      event.preventDefault()
      this.isResizing = true
      this.resizeColumnIndex = columnIndex
      this.startX = event.clientX
      
      // 获取当前列的宽度
      const th = event.target.closest('th')
      if (th) {
        this.startWidth = th.offsetWidth
      }
      
      // 更改鼠标样式
      document.body.style.cursor = 'col-resize'
    },
    
    // 处理鼠标移动
    handleMouseMove(event) {
      if (!this.isResizing) return
      
      const deltaX = event.clientX - this.startX
      const newWidth = Math.max(MIN_COLUMN_WIDTH, this.startWidth + deltaX)
      
      // 更新列宽度
      if (this.resizeColumnIndex >= 0 && this.resizeColumnIndex < this.columns.length) {
        this.columns[this.resizeColumnIndex].minWidth = newWidth
      }
    },
    
    // 处理鼠标释放
    handleMouseUp(event) {
      if (this.isResizing) {
        this.isResizing = false
        this.resizeColumnIndex = -1
        // 恢复鼠标样式
        document.body.style.cursor = ''
      }
    },
    
    // 处理鼠标悬停在列边界
    handleMouseOver(event) {
      const th = event.target.closest('th')
      if (!th) return
      
      // 检查鼠标是否在列边界
      const rect = th.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      
      // 如果鼠标在列边界附近，更改鼠标样式
      if (mouseX > rect.width - 5 && mouseX < rect.width) {
        th.style.cursor = 'col-resize'
      } else {
        th.style.cursor = ''
      }
    },
    
    // 处理单行选择
    handleRowSelect(row, event) {
      const checked = event.target.checked
      if (checked) {
        if (!this.selectedRows.includes(row)) {
          this.selectedRows.push(row)
        }
      } else {
        const index = this.selectedRows.indexOf(row)
        if (index > -1) {
          this.selectedRows.splice(index, 1)
        }
      }
    },
    
    // 处理全选
    handleSelectAllRows(event) {
      const checked = event.target.checked
      if (checked) {
        this.selectedRows = [...this.tableData]
      } else {
        this.selectedRows = []
      }
    },
    
    // 复制为 INSERT 语句
    copyAsInsertStatement() {
      if (this.selectedRows.length === 0) return
      
      const tableName = this.tableName || DEFAULT_TABLE_NAME
      const columns = this.columns.map(col => col.prop).join(', ')
      
      const insertStatements = this.selectedRows.map(row => {
        const values = this.columns.map(col => {
          const value = row[col.prop]
          if (value === null || value === undefined || value === '') {
            return 'NULL'
          } else if (typeof value === 'string') {
            // 转义单引号
            const escapedValue = value.replace(/'/g, "''")
            return `'${escapedValue}'`
          } else {
            return value
          }
        }).join(', ')
        
        return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
      })
      
      const copyText = insertStatements.join('\n')
      
      // 复制到剪贴板
      navigator.clipboard.writeText(copyText).then(() => {
        ElMessage.success(`已复制 ${this.selectedRows.length} 条数据的 INSERT 语句到剪贴板`)
      }).catch(err => {
        console.error('复制失败:', err)
        ElMessage.error('复制失败，请手动复制')
      })
    },
    
    // 导出为 Excel
    exportToExcel() {
      if (this.selectedRows.length === 0) return
      
      // 准备导出数据
      const exportData = this.selectedRows.map(row => {
        const rowData = {}
        this.columns.forEach(col => {
          rowData[col.label] = row[col.prop]
        })
        return rowData
      })
      
      // 创建工作簿
      const wb = XLSX.utils.book_new()
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(exportData)
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '数据')
      
      // 生成文件名
      const fileName = `${this.tableName || '数据'}_${new Date().getTime()}.xlsx`
      // 导出文件
      XLSX.writeFile(wb, fileName)
      
      // 显示成功消息
      ElMessage.success(`已导出 ${this.selectedRows.length} 条数据到 Excel 文件`)
    }
  }
}
</script>

<template>
  <!-- 页面容器 -->
  <div class="page-container">
    <!-- 卡片容器 -->
    <div class="card">
      <!-- 按钮组 -->
      <div class="button-group">
        <el-button type="primary" @click="parseJson(true)">立即解析</el-button>
        <el-button type="primary" @click="clearAll">清空</el-button>
      </div>
      
      <!-- JSON 输入区域 -->
      <div class="input-section">
        <h3>JSON 输入</h3>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="3"
          placeholder="请输入日志返回的 JSON 数据...（输入后自动解析）"
        />
      </div>
      
      <!-- 表格区域 -->
      <div class="table-section">
        <!-- 表格标题 -->
        <h3 v-if="tableName">{{ tableName }}</h3>
        <h3 v-else>解析结果</h3>
        
        <!-- 操作按钮 -->
        <div v-if="hasValidData" class="table-actions">
          <el-button 
            type="primary" 
            @click="copyAsInsertStatement"
            :disabled="selectedRows.length === 0"
          >
            复制为 INSERT 语句
          </el-button>
          <el-button 
            type="success" 
            @click="exportToExcel"
            :disabled="selectedRows.length === 0"
          >
            导出为 Excel
          </el-button>
        </div>
        
        <!-- 空状态提示 -->
        <div v-if="!hasValidData" class="empty-tip">
          <div class="empty-content">请输入 JSON 数据</div>
        </div>
        
        <!-- 表格容器 -->
        <div v-else class="table-container">
          <table class="custom-table">
            <!-- 表头 -->
            <thead class="table-header">
              <tr>
                <!-- 左上角全选单元格 -->
                <th 
                  class="select-all-header"
                  :class="{ 'selected-header': selectedColumn === 'ALL' }"
                  @click="handleSelectAll"
                  title="点击全选表格"
                >
                  <input 
                    type="checkbox" 
                    :checked="selectedRows.length === tableData.length && tableData.length > 0"
                    @change="handleSelectAllRows"
                    @click.stop
                  />
                </th>
                <!-- 数据列的表头 -->
                <th 
                  v-for="(col, index) in columns" 
                  :key="col.prop"
                  :style="{ minWidth: col.minWidth + 'px' }"
                  :class="{ 'selected-header': selectedColumn === col.prop || selectedColumn === 'ALL' }"
                  @click="handleHeaderClick(col)"
                  @mousedown="startResize($event, index)"
                  @mousemove="handleMouseOver"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <!-- 表格内容 -->
            <tbody>
              <tr v-for="(row, rowIndex) in tableData" :key="rowIndex" :class="{ 'selected-row': selectedRows.includes(row) }">
                <!-- 选择列 -->
                <td 
                  class="row-index-cell"
                  :class="{ 'selected-column': selectedColumn === 'ALL' }"
                >
                  <input 
                    type="checkbox" 
                    :checked="selectedRows.includes(row)"
                    @change="handleRowSelect(row, $event)"
                  />
                </td>
                <!-- 数据列 -->
                <td 
                  v-for="col in columns" 
                  :key="col.prop"
                  :class="{ 'selected-column': selectedColumn === col.prop || selectedColumn === 'ALL' }"
                >
                  <textarea 
                    :value="row[col.prop]"
                    readonly
                    class="cell-input"
                    @keydown="handleCellCopy"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 数据信息 -->
        <div v-if="hasValidData && tableData.length > 0" class="data-info">
          共 {{ tableData.length }} 条数据
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器样式 */
.page-container {
  padding: 16px;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

/* 卡片容器样式 */
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

/* 按钮组样式 */
.button-group {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  height: 32px;
}

/* 输入区域样式 */
.input-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

/* 表格区域样式 */
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

/* 标题样式 */
.input-section h3,
.table-section h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 16px;
}

/* 输入区域标题样式 */
.input-section h3 {
  margin-bottom: 8px;
}

/* 文本域样式 */
:deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  white-space: pre;
}

/* 空状态提示样式 */
.empty-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 200px;
}

/* 空状态内容样式 */
.empty-content {
  font-size: 14px;
  color: #909399;
}

/* 数据信息样式 */
.data-info {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f9eb;
  border-radius: 4px;
  text-align: right;
  color: #67c23a;
  font-size: 13px;
}

/* 按钮样式 */
:deep(.el-button) {
  min-width: 80px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
}

/* 按钮图标样式 */
:deep(.el-button .el-icon) {
  margin-right: 4px;
  font-size: 14px;
}

/* 表格操作按钮样式 */
.table-actions {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  height: 32px;
}

/* 选中行样式 */
.custom-table tbody tr.selected-row {
  background-color: #e6f7ff;
}

/* 复选框样式 */
.select-all-header input[type="checkbox"],
.row-index-cell input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 表格容器样式 */
.table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 自定义表格样式 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  table-layout: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 表头样式 */
.table-header {
  background-color: #f5f7fa;
  border-bottom: 2px solid #1890ff;
}

/* 表头单元格样式 */
.table-header th {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 2px solid #1890ff;
  border-top: 1px solid #e0e0e0;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 120px;
}

/* 左上角全选表头样式 */
.table-header th.select-all-header {
  min-width: 60px !important;
  width: 60px;
  user-select: none;
  background-color: #ebeef5;
}

.table-header th.select-all-header:hover {
  background-color: #dcdfe6;
}

/* 第一个表头单元格样式 */
.table-header th:first-child {
  border-left: none;
}

/* 最后一个表头单元格样式 */
.table-header th:last-child {
  border-right: none;
}

/* 表头悬停样式 */
.table-header th:hover {
  background-color: #f0f0f0;
}

/* 表头选中样式 */
.table-header th.selected-header {
  background-color: #1890ff;
  color: white;
  border-right: 1px solid #1890ff;
  border-left: 1px solid #1890ff;
}

/* 第一个选中的表头单元格样式 */
.table-header th.selected-header:first-child {
  border-left: none;
}

/* 最后一个选中的表头单元格样式 */
.table-header th.selected-header:last-child {
  border-right: none;
}

/* 表格行样式 */
.custom-table tbody tr {
  transition: background-color 0.2s ease;
}

/* 表格偶数行样式 */
.custom-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

/* 表格行悬停样式 */
.custom-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* 表格单元格基础样式 */
.row-index-cell {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: bold;
  text-align: center;
  user-select: none;
  width: 60px;
}

/* 表格单元格样式 */
.custom-table tbody td {
  padding: 10px 6px;
  text-align: center;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  height: 40px;
  vertical-align: middle;
  transition: all 0.2s ease;
}

/* 第一个表格单元格样式 */
.custom-table tbody td:first-child {
  border-left: none;
}

/* 最后一个表格单元格样式 */
.custom-table tbody td:last-child {
  border-right: none;
}

/* 第一行表格单元格样式 */
.custom-table tbody tr:first-child td {
  border-top: none;
}

/* 最后一行表格单元格样式 */
.custom-table tbody tr:last-child td {
  border-bottom: none;
}

/* 选中列/选中行单元格样式 */
.custom-table tbody td.selected-column {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
  border-right: 1px solid #c0c0c0;
  border-top: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;
  color: #333;
}

/* 选中列悬停样式 */
.custom-table tbody tr:hover td.selected-column {
  background-color: #bae7ff;
  border-right: 1px solid #c0c0c0;
  border-top: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;
}

/* 单元格输入框样式 */
.cell-input {
  width: 100%;
  height: 40px;
  border: none;
  background-color: transparent;
  text-align: center;
  font-size: 14px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: none;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 40px;
}

/* 单元格输入框悬停样式 */
.cell-input:hover {
  background-color: #f5f5f5;
}

/* 单元格输入框聚焦样式 */
.cell-input:focus {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  outline: none;
}
</style>