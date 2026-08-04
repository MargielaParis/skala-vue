import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/PracticeView.vue'),
    },
    {
      path: '/assignment',
      alias: '/weather',
      name: 'weather-home',
      component: () => import('../views/AssignmentView.vue'),
    },
    {
      path: '/weather/about',
      name: 'weather-about',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'weather-detail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
