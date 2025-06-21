import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

// import MenuAPI, { type RouteVO } from "@/api/system/menu.api"; // 注释掉动态菜单API的导入
const modules = import.meta.glob("../../views/**/**.vue");
console.log("DEBUG: modules object keys:", Object.keys(modules));
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由，包括静态路由和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  /**
   * 生成静态路由数据并注册到全局路由
   *
   * @returns Promise<RouteRecordRaw[]> 解析后的动态路由列表
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve) => {
      console.log("🔧 Starting to generate static routes...");

      // 定义您的硬编码静态路由
      const staticDynamicRoutes: RouteRecordRaw[] = [
        {
          path: "/",
          component: Layout,
          redirect: "/dashboard",
          meta: { hidden: true },
        },
        {
          path: "/dashboard",
          component: Layout,
          redirect: "/dashboard/index",
          meta: { title: "仪表盘", icon: "ep:home-filled", affix: true },
          children: [
            {
              path: "index",
              name: "Dashboard",
              component: modules["../../views/dashboard/index.vue"],
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
              component: modules["../../views/system/user/index.vue"],
              meta: { title: "用户管理", icon: "ep:user" },
            },
          ],
        },
        // 根据您的实际需求添加其他静态路由
      ];

      // 添加调试日志，检查组件是否正确导入
      console.log("DEBUG: Dashboard component value:", modules["../../views/dashboard/index.vue"]);
      console.log(
        "DEBUG: UserManagement component value:",
        modules["../../views/system/user/index.vue"]
      );

      routes.value = [...constantRoutes, ...staticDynamicRoutes];
      routesLoaded.value = true;

      console.log("✅ Static routes generation completed successfully");
      resolve(staticDynamicRoutes);
    });
  }

  /**
   * 根据父菜单路径设置侧边菜单
   *
   * @param parentPath 父菜单的路径，用于查找对应的菜单项
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
    // 创建常量路由名称集合，用于O(1)时间复杂度的查找
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
 * 导出此hook函数用于在非组件环境(如其他store、工具函数等)中获取权限store实例
 *
 * 在组件中可直接使用usePermissionStore()，但在组件外部需要传入store实例
 * 此函数简化了这个过程，避免每次都手动传入store参数
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
