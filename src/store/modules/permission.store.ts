import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
// import router from "@/router"; // 不再需要直接操作 router 实例，所以注释掉

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

      // 直接使用 constantRoutes，因为所有静态路由已在 router/index.ts 中定义并注册
      routes.value = [...constantRoutes];
      routesLoaded.value = true;

      console.log("✅ 静态菜单生成完成");
      resolve(routes.value);
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

    // 由于所有路由已在 router/index.ts 中静态定义，这里不再需要从 router 实例中移除路由。
    // routes.value.forEach((route) => {
    //   if (route.name && !constantRouteNames.has(route.name)) {
    //     router.removeRoute(route.name);
    //   }
    // });

    // 重置为仅包含常量路由 (这里实际是清除 store 内部的路由列表，准备重新生成)
    routes.value = []; // 清空 routes.value 以便重新生成
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
