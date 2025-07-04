import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    component: Layout,
    redirect: "/dashboard/index",
    children: [
      {
        path: "index",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "chart", affix: true },
      },
    ],
  },
  {
    path: "/system",
    component: Layout,
    redirect: "/system/user",
    meta: { title: "系统管理", icon: "setting" },
    children: [
      {
        path: "user",
        name: "User",
        component: () => import("@/views/system/user/index.vue"),
        meta: { title: "用户管理", icon: "user", activeMenu: "/system" },
      },
      {
        path: "role",
        name: "Role",
        component: () => import("@/views/system/role/index.vue"),
        meta: { title: "角色管理", icon: "role", activeMenu: "/system" },
      },
      {
        path: "menu",
        name: "Menu",
        component: () => import("@/views/system/menu/index.vue"),
        meta: { title: "权限管理", icon: "menu", activeMenu: "/system" },
      },
    ],
  },
  {
    path: "/medical",
    component: Layout,
    redirect: "/medical/doctor",
    meta: { title: "医疗管理", icon: "first-aid-kit" },
    children: [
      {
        path: "doctor",
        name: "DoctorManagement",
        component: () => import("@/views/system/user/index.vue"), // 请替换为实际的医生管理页面
        meta: { title: "医生管理", icon: "user" },
      },
      {
        path: "department",
        name: "DepartmentManagement",
        component: () => import("@/views/system/dept/index.vue"), // 请替换为实际的科室管理页面
        meta: { title: "科室管理", icon: "office-building" },
      },
      {
        path: "online-appointment",
        name: "OnlineAppointment",
        component: () => import("@/views/medical/online-appointment/index.vue"), // 新增的线上预约页面
        meta: { title: "线上预约", icon: "calendar" }, // 假设使用calendar图标，你可以根据需要更改
      },
    ],
  },
  {
    path: "/pharmacy",
    component: Layout,
    redirect: "/pharmacy/medicine",
    meta: { title: "药房管理", icon: "medicine-box" },
    children: [
      {
        path: "medicine",
        name: "MedicineManagement",
        // 确保这里的路径是正确的
        component: () => import("@/views/pharmacy/medicine.vue"),
        meta: { title: "药品管理", icon: "medicine-box" },
      },
        {
      path: "pharmaceutical-company", // 不要加 /
      name: "PharmaceuticalCompanyManagement",
      component: () => import("@/views/pharmacy/PharmaceuticalCompany.vue"),
      meta: { title: "制药公司管理", icon: "document" },
    },
    ],
  },
  {
    path: "/clinic",
    component: Layout,
    redirect: "/clinic/outpatient",
    meta: { title: "门诊管理", icon: "service" },
    children: [
      {
        path: "outpatient",
        name: "OutpatientManagement",
        component: () => import("@/views/system/user/index.vue"), // 请替换为实际的门诊管理页面
        meta: { title: "门诊管理", icon: "service" },
      },
    ],
  },
  // 401 and 404 routes (now general, not under '/')
  {
    path: "/401",
    component: () => import("@/views/error/401.vue"),
    meta: { hidden: true },
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
    meta: { hidden: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { hidden: true },
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
