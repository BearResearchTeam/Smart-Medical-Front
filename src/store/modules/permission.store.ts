import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import type { MenuTree } from "@/api/system/menu.api";
import MenuAPI from "@/api/system/menu.api";
import router from "@/router"; // 不再需要直接操作 router 实例，所以注释掉
import { log } from "console";

//import MenuAPI, { type RouteVO } from "@/api/system/menu.api"; // 注释掉动态菜单API的导入
const modules = import.meta.glob("../../views/**/**.vue");
console.log("DEBUG: modules object keys:", Object.keys(modules));

const Layout = () => import("@/layouts/index.vue");

let generationPromise: Promise<RouteRecordRaw[]> | null = null;

async function fetchAndGenerateRoutes(
  commit: (payload: RouteRecordRaw[]) => void,
  done: (payload: RouteRecordRaw[]) => void,
  fail: (reason?: any) => void
) {
  try {
    const response: any = await MenuAPI.getMenuTree(null);
    const menuTree: MenuTree[] = response || [];
    const dynamicRoutes = menuTreeToRoutes(menuTree);

    dynamicRoutes.forEach((route) => {
      if (!router.hasRoute(route.name as string)) {
        router.addRoute("Layout", route);
      }
    });

    commit(dynamicRoutes);
    done(dynamicRoutes);
  } catch (error) {
    generationPromise = null;
    fail(error);
  }
}

function menuTreeToRoutes(menuList: MenuTree[]): RouteRecordRaw[] {
  console.log("DEBUG: menuTreeToRoutes called with menuList:", menuList);
  return menuList.map((menu) => {
    const route: RouteRecordRaw = {
      path: menu.pagePath,
      name: menu.permissionCode,
      component:
        menu.type === 0 && menu.parentId === null
          ? Layout
          : modules[`../../views${menu.pagePath}.vue`],
      meta: {
        title: menu.permissionName,
        icon: menu.icon,
        alwaysShow: menu.children && menu.children.length > 0,
        hidden: menu.type == 2,
      },
      children: menu.children && menu.children.length > 0 ? menuTreeToRoutes(menu.children) : [],
    };

    // 如果有子菜单，给父级加 redirect 到第一个子菜单
    if (menu.children && menu.children.length > 0) {
      route.redirect = route.children[0].path;
    }

    return route;
  });
}

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  function generateRoutes(): Promise<RouteRecordRaw[]> {
    if (generationPromise) {
      return generationPromise;
    }

    generationPromise = new Promise((resolve, reject) => {
      fetchAndGenerateRoutes(
        (payload) => {
          routes.value = payload;
          sideMenuRoutes.value = payload;
          routesLoaded.value = true;
          console.log("✅ 动态菜单生成完成", router.getRoutes());
        },
        resolve,
        reject
      );
    });
    return generationPromise;
  }

  /**
   * 重置路由
   */
  const resetRouter = () => {
    // 创建常量路由名称集合
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    //routes,
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
    generationPromise = null; // 重置时清除Promise锁
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
    resetRouter,
    updateSideMenu: (parentPath: string) => {
      sideMenuRoutes.value = routes.value;
    },
  };
});
