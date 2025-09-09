import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
// 1导入新创建的发布帖子组件
import CreatePostView from '../views/CreatePostView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // 默认重定向到登录页
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/student',
      name: 'student-dashboard',
      component: StudentDashboard
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboard
    },
    // 为发布帖子页面添加一个新的路由规则
    {
      path: '/student/create-post',
      name: 'student-create-post',
      component: CreatePostView
    }
  ]
})

export default router