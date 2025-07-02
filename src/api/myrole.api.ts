import request from "@/utils/request";

/**
 * 角色API接口
 * 提供角色管理功能
 */
const MyRoleAPI = {
  /**
   * 根据ID获取角色详情
   * @param id 角色ID
   */
  getRoleById(id: string) {
    // 强制使用模拟数据
    const useMockData = true;

    if (useMockData) {
      console.log("使用模拟获取角色详情数据:", id);
      return new Promise<RoleListItem>((resolve) => {
        setTimeout(() => {
          const mockRole: RoleListItem = {
            id,
            roleName: "模拟角色" + id,
            roleCode: "mock_code_" + id,
            description: "这是一个模拟角色的描述",
          };
          resolve(mockRole);
        }, 300);
      });
    }

    // return request<any, RoleListItem>({
    //   url: `api/app/role/${id}`,
    //   method: "get",
    // });
    return Promise.reject("实际API未实现"); // 模拟未实现
  },

  /**
   * 新增角色
   * @param data 角色数据
   */
  addRole(data: RoleAddRequest) {
    const useMockData = true;

    if (useMockData) {
      console.log("使用模拟新增角色数据:", data);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟新增角色成功");
          resolve(true);
        }, 300);
      });
    }

    // return request<any, any>({
    //   url: "api/app/role",
    //   method: "post",
    //   data,
    // });
    return Promise.reject("实际API未实现"); // 模拟未实现
  },

  /**
   * 更新角色
   * @param id 角色ID
   * @param data 角色更新数据
   */
  updateRole(id: string, data: RoleUpdateRequest) {
    const useMockData = true;

    if (useMockData) {
      console.log("使用模拟更新角色数据:", id, data);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟更新角色成功");
          resolve(true);
        }, 300);
      });
    }

    // return request<any, any>({
    //   url: `api/app/role/${id}`,
    //   method: "put",
    //   data,
    // });
    return Promise.reject("实际API未实现"); // 模拟未实现
  },

  /**
   * 删除角色
   * @param ids 角色ID字符串，逗号分隔
   */
  deleteRoles(ids: string) {
    const useMockData = true;

    if (useMockData) {
      console.log("使用模拟删除角色数据:", ids);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟删除角色成功");
          resolve(true);
        }, 300);
      });
    }

    // return request<any, any>({
    //   url: `api/app/role/${ids}`, // 根据后端设计，可能需要调整为 query param 或 request body
    //   method: "delete",
    // });
    return Promise.reject("实际API未实现"); // 模拟未实现
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
            { id: "1", roleName: "管理员", roleCode: "admin", description: "系统管理员" },
            { id: "2", roleName: "普通用户", roleCode: "user", description: "普通系统用户" },
            { id: "3", roleName: "访客", roleCode: "guest", description: "只读权限的访客" },
          ];

          let filteredRoles = [...mockRoles];

          if (params?.keywords) {
            const keyword = params.keywords.toLowerCase();
            filteredRoles = filteredRoles.filter(
              (role) =>
                role.roleName.toLowerCase().includes(keyword) ||
                role.roleCode.toLowerCase().includes(keyword) ||
                role.description.toLowerCase().includes(keyword)
            );
          }

          // 模拟分页
          const pageIndex = params?.pageIndex || 1;
          const pageSize = params?.pageSize || 10;
          const startIndex = (pageIndex - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

          resolve({
            totalCount: filteredRoles.length,
            totalPage: Math.ceil(filteredRoles.length / pageSize),
            data: paginatedRoles,
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

export interface RoleAddRequest {
  roleName: string;
  roleCode: string;
  description?: string;
}

export interface RoleUpdateRequest {
  roleName: string;
  roleCode: string;
  description?: string;
}

export interface RoleListItem {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string;
}

export interface RoleListParams {
  pageIndex?: number;
  pageSize?: number;
  keywords?: string;
}

export interface RolePageResult {
  totalCount: number;
  totalPage: number;
  data: RoleListItem[];
}

export default MyRoleAPI;
