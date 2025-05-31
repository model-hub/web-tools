<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>Tools</h1>
      <p class="subtitle">一个简单实用的在线工具集合</p>
    </div>
    
    <div class="tools-grid">
      <el-card 
        v-for="tool in tools" 
        :key="tool.path" 
        class="tool-card"
        @click="navigateTo(tool.path)"
      >
        <div class="tool-content">
          <el-icon class="tool-icon"><component :is="tool.icon" /></el-icon>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Document, Connection, List } from '@element-plus/icons-vue'

export default {
  name: 'HomeView',
  components: {
    Document,
    Connection,
    List
  },
  data() {
    return {
      tools: [
        {
          title: '文本对比工具',
          path: '/compare',
          icon: 'Document',
          description: '快速对比两段文本的差异，支持文件上传'
        },
        {
          title: '车架号生成工具',
          path: '/vin',
          icon: 'Connection',
          description: '生成符合标准的车架号（VIN码）'
        },
        {
          title: 'JSON格式化工具',
          path: '/json',
          icon: 'List',
          description: 'JSON数据的格式化、压缩和排序'
        }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-section h1 {
  font-size: 36px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-regular);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 20px 0;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow);
}

.tool-content {
  padding: 20px;
  text-align: center;
}

.tool-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.tool-content h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tool-content p {
  color: var(--text-regular);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-section h1 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
}
</style> 