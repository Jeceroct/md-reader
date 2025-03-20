import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

const pages = import.meta.glob('../views/**/page.ts', {
  eager: true,
  import: 'default'
})
const comps = import.meta.glob('../views/**/index.vue')

const routes: RouteRecordRaw[] = Object.entries(pages).map(([path, meta]) => {
  const compPath = path.replace('page.ts', 'index.vue')

  path = path.replace('../views', '').replace('/page.ts', '') || '/'
  const name = path.split('/').filter(Boolean).join('-') || 'index'

  return {
    path,
    name,
    component: comps[compPath],
    meta
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes: [
  //   {
  //     path: '/',
  //     name: 'home',
  //     component: HomeView
  //   },
  //   {
  //     path: '/about',
  //     name: 'about',
  // route level code-splitting
  // this generates a separate chunk (About.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  //     component: () => import('../views/AboutView.vue')
  //   }
  // ]
  routes
})

export default router
