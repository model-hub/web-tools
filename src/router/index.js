import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Compare from '../views/Compare.vue'
import Vin from '../views/Vin.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/compare',
      name: 'compare',
      component: Compare
    },
    {
      path: '/vin',
      name: 'vin',
      component: Vin
    }
  ]
})

export default router
