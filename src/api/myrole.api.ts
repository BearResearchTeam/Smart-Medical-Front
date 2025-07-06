import request from "@/utils/request";

/**
 * 角色API接口 
 * 提供角色管理功能
 */
const MyRoleAPI = {
  /**
   * 根据ID获取角色详情
   * 
   */
  getRole(query: RoleListParams) {

    return request<RoleListItem>({
      url: `/api/app/role`,
      method: "get",
      params: query,
    });
  },

  /**
   * 获取角色 用于下拉
   *
   */
  getRoleasync() {

    return request<RoleItems>({
      url: `/api/app/role/role-list`,
      method: "get",
    });
  },

  /**
   * 新增角色
   * @param data 角色数据
   */
  addRole(data: RoleListItem) {
    return request<RoleListItem>({
      url: "api/app/role",
      method: "post",
      data,
    });
  },
  baseaddRolePermission(roleId: string,permissionIds: string[] ) {
    return request<RoleListItem>({
      url: `/api/app/role-permission/batch-create/${roleId}`,
      method: "post",
      data: permissionIds
    });
  },
  /**
   * 更新角色
   * @param id 角色ID
   * @param data 角色更新数据
   */
  updateRole(id: string, data: RoleListItem) {
   
    return request<RoleListItem>({
      url: `api/app/role/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除角色
   * @param ids 角色ID字符串，逗号分隔
   */
  deleteRoles(ids: string) {
   
    return request<RoleListItem>({
      url: `/api/app/role`, // 根据后端设计，可能需要调整为 query param 或 request body
      method: "delete",
      params: { idsString:ids },
    });
  },

  /**
   * 获取角色列表（分页）
   * @param params 查询参数
   */
  getRoleList(params?: RoleListParams) {
    const useMockData = true;
    console.log("获取角色列表 - 使用模拟数据:", useMockData);

    if (useMockData) {
      console.log("使用模拟角色列表数据");
      return new Promise<RolePageResult>((resolve) => {
        setTimeout(() => {
          const mockRoles: RoleListItem[] = [
            { id: "1", roleName: "管理员", description: "系统管理员" },
            { id: "2", roleName: "普通用户", description: "普通系统用户" },
            { id: "3", roleName: "访客", description: "只读权限的访客" },
          ];

          let filteredRoles = [...mockRoles];

          // 这里不再处理keywords、roleCode等

          // 模拟分页，直接返回全部
          resolve({
            totalCount: filteredRoles.length,
            totalPage: 1,
            data: filteredRoles,
          });
        }, 300);
      });
    }

    // return request<any, RolePageResult>({
    //   url: "api/app/role/list",
    //   method: "get",
    //   params,
    // });
    return Promise.reject("实际API未实现"); // 模拟未实现
  },
};

/**
 * 角色表 用于下拉
 */
export interface RoleItems {
  id: string;
  roleName: string;
}

/**
 * 角色表数据
 */
export interface RoleListItem {
  id: string;
  roleName: string;
  //roleCode: string;
  description?: string;
}
export interface RolePermissionListItem {
  id: string;
  roleId: string;
  permissionId: string[];
}


/**
 * 角色列表查询参数
 */
export interface RoleListParams {
  RoleName?: string;
  Sorting?: string;
  SkipCount: number;
  MaxResultCount: number;
}

/**
 * 角色列表分页结果
 */
export interface RolePageResult {
  totalCount: number;
  totalPage: number;
  data: RoleListItem[];
}

export default MyRoleAPI;
