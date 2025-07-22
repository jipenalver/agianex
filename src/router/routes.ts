import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForbiddenView from '@/views/errors/ForbiddenView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'
import DashboardView from '@/views/system/dashboard/DashboardView.vue'
import SettingsView from '@/views/system/settings/SettingsView.vue'
import UserRolesView from '@/views/system/admin/manage-users/UserRolesView.vue'
import UsersView from '@/views/system/admin/manage-users/UsersView.vue'
import ReportView from '@/views/user/ReportView.vue'

export const routes = [
  // Auth
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false },
  },

  // System
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, isDefault: true },
  },
  {
    path: '/settings/:tab?',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true, isDefault: true },
  },

  // Admin
  {
    path: '/admin/users/roles',
    name: 'admin-users-roles',
    component: UserRolesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users/list',
    name: 'admin-users-list',
    component: UsersView,
    meta: { requiresAuth: true },
  },

  // Users
  {
    path: '/user/report',
    name: 'user-report',
    component: ReportView,
    meta: { requiresAuth: true },
  },

  // Errors Pages
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { isDefault: true },
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: NotFoundView,
    meta: { isDefault: true },
  },
]
