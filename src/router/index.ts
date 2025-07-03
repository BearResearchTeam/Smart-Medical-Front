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
    redirect: "/login",
  },
  {
    path: "/dashboard",
    component: Layout,
    redirect: "/dashboard/index",
    meta: { title: "仪表盘管理", icon: "CollectionTag" },
    children: [
      {
        path: "index",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "Aim" },
      },
    ],
  },
  {
    path: "/system",
    component: Layout,
    redirect: "/system/user",
    meta: { title: "系统管理", icon: "CollectionTag" },
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
        meta: { title: "角色管理", icon: "Present", activeMenu: "/system" },
      },
      {
        path: "menu",
        name: "Menu",
        component: () => import("@/views/system/menu/index.vue"),
        meta: { title: "权限管理", icon: "calendar", activeMenu: "/system" },
      },
    ],
  },
  {
    path: "/medical",
    component: Layout,
    redirect: "/medical/doctor",
    meta: { title: "医疗管理", icon: "Edit" },
    children: [
      {
        path: "doctor",
        name: "DoctorManagement",
        component: () => import("@/views/system/doctor/index.vue"), // 请替换为实际的医生管理页面
        meta: { title: "医生管理", icon: "Avatar" },
      },
      {
        path: "department",
        name: "department",
        component: () => import("@/views/system/dept/index.vue"),
        meta: { title: "科室管理", icon: "HomeFilled" },
      },
      {
        path: "patient",
        name: "patient",
        component: () => import("@/views/medical/patient/index.vue"),
        meta: { title: "患者管理", icon: "Headset" },
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
    meta: { title: "药房管理", icon: "TakeawayBox" },
    children: [
      {
        path: "medicine",
        name: "MedicineManagement",
        component: () => import("@/views/system/drug/index.vue"), // 请替换为实际的药品管理页面
        meta: { title: "药品管理", icon: "Eleme" },
      },
      {
        path: "prescription",
        name: "PrescriptionManagement",
        component: () => import("@/views/system/prescription/index.vue"), // 请替换为实际的处方管理页面
        meta: { title: "处方管理", icon: "Tickets" },
      },
    ],
  },
  {
    path: "/clinic",
    component: Layout,
    redirect: "/clinic/outpatient",
    meta: { title: "门诊管理", icon: "DocumentAdd" },
    children: [
      {
        path: "outpatient",
        name: "OutpatientManagement",
        component: () => import("@/views/system/Outpatient/index.vue"), // 请替换为实际的门诊管理页面
        meta: { title: "门诊管理", icon: "service" },
      },
    ],
  },
  {
    path: "/dict",
    component: Layout,
    redirect: "/dict/dictdata",
    meta: { title: "数据字典管理", icon: "Grid" },
    children: [
      {
        path: "dictdata",
        name: "dictdata",
        component: () => import("@/views/system/dict/index.vue"),
        meta: { title: "字典管理", icon: "List" },
      },
      {
        path: "/system/dict-item",
        name: "dict-item",
        component: () => import("@/views/system/dict/dict-item.vue"),
        meta: { title: "字典项管理", icon: "Folder" },
      },
    ],
  },
  //  {
  //     path: "/menu",
  //     component: Layout,
  //     redirect: "/menu/menuitem",
  //     meta: { title: "菜单管理", icon: "service" },
  //     children: [
  //       {
  //         path: "menuitem",
  //         name: "menuitem",
  //         component: () => import("@/views/system/menu/index.vue"),
  //         meta: { title: "菜单管理", icon: "Management" },
  //       },
  //     ],
  //   },

  // 401 and 404 routes (now general, not under '/')
  // 401 and 404 routes (now general, not under '')
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/list",
    meta: { title: "患者管理", icon: "user-filled", affix: true },
    children: [
      {
        path: "list",
        name: "PatientManagement",
        component: () => import("@/views/patient/index.vue"),
        meta: { title: "患者管理", icon: "user-filled", affix: true },
      },
      {
        path: "appointments",
        name: "PatientAppointments",
        component: () => import("@/views/patient/appointments.vue"),
        meta: { title: "预约记录", icon: "calendar", hidden: true },
      },
    ],
  },
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
