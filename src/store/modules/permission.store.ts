import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

// import MenuAPI, { type RouteVO } from "@/api/system/menu.api"; // 注释掉动态菜单API的导入
const modules = import.meta.glob("../../views/**/**.vue");
console.log("DEBUG: modules object keys:", Object.keys(modules));
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  /**
   * 生成静态路由数据并注册到全局路由
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve) => {
      console.log("🔧 生成静态菜单...");

      // 定义静态路由
      const staticRoutes = [
        {
          path: "/dashboard",
          component: Layout,
          redirect: "/dashboard/index",
          children: [
            {
              path: "index",
              name: "Dashboard",
              component: () => import("@/views/dashboard/index.vue"),
              meta: { title: "仪表盘", icon: "ep:home-filled", affix: true },
            },
          ],
        },
        {
          path: "/system",
          component: Layout,
          redirect: "/system/user",
          meta: { title: "系统管理", icon: "ep:setting" },
          children: [
            {
              path: "user",
              name: "UserManagement",
              component: () => import("@/views/system/user/index.vue"),
              meta: { title: "用户管理", icon: "ep:user" },
            },
          ],
        },
        {
          path: "/medical",
          component: Layout,
          redirect: "/medical/doctor",
          meta: { title: "医疗管理", icon: "ep:first-aid-kit" },
          children: [
            {
              path: "doctor",
              name: "DoctorManagement",
              component: () => import("@/views/system/user/index.vue"),
              meta: { title: "医生管理", icon: "ep:user" },
            },
            {
              path: "department",
              name: "DepartmentManagement",
              component: () => import("@/views/system/dept/index.vue"),
              meta: { title: "科室管理", icon: "ep:office-building" },
            },
          ],
        },
        {
          path: "/pharmacy",
          component: Layout,
          redirect: "/pharmacy/medicine",
          meta: { title: "药房管理", icon: "ep:medicine-box" },
          children: [
            {
              path: "medicine",
              name: "MedicineManagement",
              component: () => import("@/views/system/dict/index.vue"),
              meta: { title: "药品管理", icon: "ep:medicine-box" },
            },
            {
              path: "prescription",
              name: "PrescriptionManagement",
              component: () => import("@/views/system/user/index.vue"),
              meta: { title: "处方管理", icon: "ep:document" },
            },
          ],
        },
        {
          path: "/clinic",
          component: Layout,
          redirect: "/clinic/outpatient",
          meta: { title: "门诊管理", icon: "ep:service" },
          children: [
            {
              path: "outpatient",
              name: "OutpatientManagement",
              component: () => import("@/views/system/user/index.vue"),
              meta: { title: "门诊管理", icon: "ep:service" },
            },
          ],
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

      // 注册路由
      staticRoutes.forEach((route) => {
        router.addRoute(route);
      });

      routes.value = [...constantRoutes, ...staticRoutes];
      routesLoaded.value = true;

      console.log("✅ 静态菜单生成完成");
      resolve(staticRoutes);
    });
  }

  /**
   * 根据父菜单路径设置侧边菜单
   */
  const updateSideMenu = (parentPath: string) => {
    const matchedItem = routes.value.find((item) => item.path === parentPath);
    if (matchedItem && matchedItem.children) {
      sideMenuRoutes.value = matchedItem.children;
    }
  };

  /**
   * 重置路由
   */
  const resetRouter = () => {
    // 创建常量路由名称集合
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));

    // 从 router 实例中移除动态路由
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置为仅包含常量路由
    routes.value = [...constantRoutes];
    sideMenuRoutes.value = [];
    routesLoaded.value = false;
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
    updateSideMenu,
    resetRouter,
  };
});

/**
 * 解析后端返回的路由数据并转换为 Vue Router 兼容的路由配置 (已注释，因为使用静态路由)
 *
 * @param rawRoutes 后端返回的原始路由数据
 * @returns 解析后的路由集合
 */
// const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
//   const parsedRoutes: RouteRecordRaw[] = [];

//   rawRoutes.forEach((route) => {
//     const normalizedRoute = { ...route } as RouteRecordRaw;

//     // 处理组件路径
//     normalizedRoute.component =
//       normalizedRoute.component?.toString() === "Layout"
//         ? Layout
//         : modules[`../../views/${normalizedRoute.component}.vue`] ||
//           modules["../../views/error-page/404.vue"];

//     // 递归解析子路由
//     if (normalizedRoute.children) {
//       normalizedRoute.children = parseDynamicRoutes(route.children);
//     }

//     parsedRoutes.push(normalizedRoute);
//   });

//   return parsedRoutes;
// };

/**
 * 导出此hook函数用于在非组件环境中获取权限store实例
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
