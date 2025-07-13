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

/**
 * 将后端返回的菜单树结构转换为前端路由配置
 * @param menuList 菜单树数组
 * @returns RouteRecordRaw[] 路由配置数组
 */
function menuTreeToRoutes(menuList: MenuTree[]): RouteRecordRaw[] {
  // 调试输出，方便查看传入的菜单数据
  console.log("DEBUG: menuTreeToRoutes called with menuList:", menuList);

  // 遍历每个菜单节点，生成对应的路由对象
  return menuList.map((menu) => {
    // 构建单个路由对象
    const route: RouteRecordRaw = {
      path: menu.pagePath, // 路由路径
      name: menu.permissionCode, // 路由名称（权限编码）
      component:
        // 如果是顶级菜单（type为0且parentId为null），用Layout组件，否则动态加载对应页面组件
        menu.type === 0 && menu.parentId === null
          ? Layout
          : modules[`../../views${menu.pagePath}.vue`],
      meta: {
        title: menu.permissionName, // 菜单名称
        icon: menu.icon, // 菜单图标
        alwaysShow: menu.children && menu.children.length > 0, // 有子菜单时始终显示
        hidden: menu.type == 2, // type为2时隐藏菜单
      },
      // 递归处理子菜单
      children: menu.children && menu.children.length > 0 ? menuTreeToRoutes(menu.children) : [],
    };

    // 如果有子菜单，给父级加 redirect 跳转到第一个子菜单
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

  /**
   * 动态生成路由（只生成一次，防止重复请求）
   * @returns Promise<RouteRecordRaw[]> 返回动态路由数组的Promise
   */
  function generateRoutes(): Promise<RouteRecordRaw[]> {
    // 如果已经有生成中的Promise，直接返回，避免重复请求
    if (generationPromise) {
      return generationPromise;
    }

    // 创建新的Promise，异步获取并生成路由
    generationPromise = new Promise((resolve, reject) => {
      fetchAndGenerateRoutes(
        // commit 回调：将生成的路由存入store
        (payload) => {
          routes.value = payload;           // 存储所有动态路由
          sideMenuRoutes.value = payload;   // 存储侧边栏菜单路由
          routesLoaded.value = true;        // 标记路由已加载
          console.log("✅ 动态菜单生成完成", router.getRoutes());
        },
        resolve, // done 回调：Promise resolve
        reject   // fail 回调：Promise reject
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
