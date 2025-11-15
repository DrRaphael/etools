import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PcbCurrentCalculator from '../views/tools/pcb-current-calculator/PcbCurrentCalculator.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/tools/pcb-current-calculator',
    name: 'PcbCurrentCalculator',
    component: PcbCurrentCalculator,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
