<template>
  <div class="menu-bar">
    <div class="menu-container">
      <div class="logo" @click="navigateTo('/')">
        <span>Web Tools</span>
      </div>
      <el-menu
        mode="horizontal"
        :router="true"
        :default-active="activeIndex"
        class="menu"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path" 
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Connection, List } from '@element-plus/icons-vue'

export default {
  name: 'MenuBar',
  components: {
    Document,
    Connection,
    List
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const menuItems = [
      {
        title: '文本对比',
        path: '/compare',
        icon: 'Document'
      },
      {
        title: '车架号',
        path: '/vin',
        icon: 'Connection'
      },
      {
        title: 'JSON格式化',
        path: '/json',
        icon: 'List'
      }
    ]

    const activeIndex = computed(() => route.path)

    const navigateTo = (path) => {
      router.push(path)
    }

    return {
      menuItems,
      activeIndex,
      navigateTo
    }
  }
}
</script>

<style scoped>
.menu-bar {
  width: 100%;
  background-color: var(--bg-white);
  box-shadow: var(--box-shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.menu-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
}

.logo {
  margin-right: 32px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.menu {
  flex: 1;
  border-bottom: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  height: 48px;
  padding: 0 16px;
}

:deep(.el-menu-item.is-active) {
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

:deep(.el-menu-item:hover) {
  background-color: var(--bg-color);
}

:deep(.el-icon) {
  font-size: 16px;
}
</style> 