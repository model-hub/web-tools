import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Compare from '../views/Compare.vue'
import Vin from '../views/Vin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
