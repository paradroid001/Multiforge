import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import ToolsView from '../views/ToolsView.vue';
import WorkflowView from '../views/WorkflowView.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/forges',
    name: 'Forges',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ForgeView.vue')
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsView
  },
  {
    path: '/workflows',
    name: 'Workflows',
    component: WorkflowView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
