import request from "@/utils/request";
// 菜单基础URL
const MENU_BASE_URL = "/api/v1/menus";

const MenuAPI = {
  /**
   * 获取当前用户的路由列表
   * <p/>
   * 无需传入角色，后端解析token获取角色自行判断是否拥有路由的权限
   *
   * @returns 路由列表
   */
  getRoutes() {
    return request<MenuTree[]>({
      url: `/api/app/permission/menu-permission-tree-list`,
      method: "get",
      params: { parentId: null } // 获取顶级菜单
    });
  },

  getMenuTree(parentId: string | null = null) {
    return request<MenuTree[]>({
      url: `/api/app/permission/menu-permission-tree-list`,
      method: "get",
      params: { parentId }
    });
  },
  /**
   * 获取菜单树形列表
   *
   * @param queryParams 查询参数
   * @returns 菜单树形列表
   */
  getList(queryParams: MenuQuery) {
    return request<tables>({
      url: `/api/app/permission`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取菜单下拉数据源
   *
   * @returns 菜单下拉数据源
   */
  getOptions(onlyParent?: boolean) {
    return request<OptionType[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { onlyParent },
    });
  },

  /**
   * 获取菜单表单数据
   *
   * @param id 菜单ID
   */
  getFormData(id: string) {
    return request<MenuForm>({
      url: `${MENU_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   * 添加菜单
   *
   * @param data 菜单表单数据
   * @returns 请求结果
   */
  create(data: MenuForm) {
    return request({
      url: `/api/app/permission`,
      method: "post",
      data,
    });
  },

  /**
   * 修改菜单
   *
   * @param id 菜单ID
   * @param data 菜单表单数据
   * @returns 请求结果
   */
  update(id: string, data: MenuForm) {
    return request({
      url: `/api/app/permission/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除菜单
   *
   * @param id 菜单ID
   * @returns 请求结果
   */
  deleteById(id: string) {
    return request({
      url: `/api/app/permission/${id}`,
      method: "delete",
    });
  },

  // getMenuTree(parentId: string) {

  //   return request({
  //     url: `/api/app/permission/menu-permission-tree-list`,
  //     method: "get",
  //     params: { parentId }
  //   })
  // },
};

export default MenuAPI;

import type { MenuTypeEnum } from "@/enums/system/menu.enum";

/** 菜单查询参数 */
export interface MenuQuery {
  /** 搜索关键字 */
  PermissionName?: string;
  /** 排序 */
  Sorting: string;
  /** 页码 */
  SkipCount: number;
  /** 每页数量 */
  MaxResultCount: number;
}

/** 菜单视图对象 */
export interface MenuVO {
  "id": string,
  "permissionName": string,
  "permissionCode": string,
  "type": 0,
  "pagePath": string,
  "parentId": string | null,
  "icon": string
  /** 子菜单 */
  children?: MenuVO[];
}

/** 菜单表单对象 */
export interface MenuForm {
  /** 菜单ID */
  id?: string;
  /** 父菜单ID */
  parentId?: string;
  /** 菜单名称 */
  "permissionName": string,
  "permissionCode": string,
  "type": MenuTypeEnum,
  "pagePath": string,
  "icon": string
}

interface KeyValue {
  key: string;
  value: string;
}

/** RouteVO，路由对象 */
// export interface RouteVO {
//   /** 子路由列表 */
//   children: RouteVO[];
//   /** 组件路径 */
//   component?: string;
//   /** 路由属性 */
//   meta?: Meta;
//   /** 路由名称 */
//   name?: string;
//   /** 路由路径 */
//   path?: string;
//   /** 跳转链接 */
//   redirect?: string;
// }

// /** Meta，路由属性 */
// export interface Meta {
//   /** 【目录】只有一个子路由是否始终显示 */
//   alwaysShow?: boolean;
//   /** 是否隐藏(true-是 false-否) */
//   hidden?: boolean;
//   /** ICON */
//   icon?: string;
//   /** 【菜单】是否开启页面缓存 */
//   keepAlive?: boolean;
//   /** 路由title */
//   title?: string;
// }

export interface MenuTree {
  id: string;
  permissionName: string;
  permissionCode: string;
  type: number;
  pagePath: string;
  parentId: string | null;
  icon: string;
  children: MenuTree[];
}
export interface tables {
  data: MenuVO[];
  totleCount: number;
  totlePage: number;
}
