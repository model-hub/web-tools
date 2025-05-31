import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Compare from '@/views/Compare.vue'
import Vin from '@/views/Vin.vue'
import JsonFormatter from '@/views/JsonFormatter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/compare',
    name: 'Compare',
    component: Compare,
    meta: {
      title: '文本对比工具'
    }
  },
  {
    path: '/vin',
    name: 'Vin',
    component: Vin,
    meta: {
      title: '车架号生成工具'
    }
  },
  {
    path: '/json',
    name: 'Json',
    component: JsonFormatter,
    meta: {
      title: 'JSON格式化工具'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫，用于设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Web Tools` : 'Web Tools'
  next()
})

export default router
