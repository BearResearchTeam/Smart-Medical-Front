import request from "@/utils/request";
import axios from "axios";

/**
 * 用户API接口
 * 提供用户登录、获取用户信息等功能
 */
const MyUserAPI = {
  /**
   * 用户登录接口
   * @param data 登录表单数据
   */
  login(data: LoginFormData) {
   

    // 正常API调用
    console.log("执行实际登录API调用", data);

   

    return request<any, LoginResult>({
      url: "api/app/user/login",
      method: "post",
      data // 将登录数据作为请求体发送
     
    });
  },

  /**
   * 获取当前登录用户信息
   */
  getUserInfo() {
    // 检查是否使用模拟数据
    const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";

    if (useMockData) {
      console.log("使用模拟用户信息数据");
      return new Promise<UserInfo>((resolve) => {
        setTimeout(() => {
          const username = localStorage.getItem("loginUser") || "admin";
          resolve({
            userId: "1",
            username,
            nickname: username === "admin" ? "管理员" : username,
            avatar: "",
            roles: ["admin"],
            perms: ["*:*:*"],
            userEmail: "admin@example.com",
            userPhone: "13800138000",
            userSex: true,
          });
        }, 300);
      });
    }

    return request<any, UserInfo>({
      url: "api/app/account/info",
      method: "get",
    });
  },

  /**
   * 退出登录
   */
  logout() {
    // 检查是否使用模拟数据
    const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";

    if (useMockData) {
      console.log("使用模拟登出");
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginUser");
          resolve();
        }, 300);
      });
    }

    return request({
      url: "api/app/user/logout",
      method: "post",
    });
  },

  /**
   * 获取验证码
   */
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: "api/app/account/captcha",
      method: "get",
    });
  },

  /**
   * 根据ID获取用户详情
   * @param id 用户ID
   */
  getUserById(id: string) {
    // 检查是否使用模拟数据
    const useMockData = false; // 强制使用后端API

    if (useMockData) {
      console.log("使用模拟获取用户详情数据:", id);
      return new Promise<UserListItem>((resolve) => {
        setTimeout(() => {
          const mockUser: UserListItem = {
            id,
            userName: "mockUser" + id,
            userEmail: "mock" + id + "@example.com",
            userPhone: "1300000000" + id.slice(-1),
            userSex: true,
          };
          resolve(mockUser);
        }, 300);
      });
    }

    return request<any, UserListItem>({
      url: `api/app/user/${id}`,
      method: "get",
    });
  },

  /**
   * 新增用户
   * @param data 用户数据
   */
  addUser(data: UserAddRequest) {
    const useMockData = false; // 强制使用后端API

    if (useMockData) {
      console.log("使用模拟新增用户数据:", data);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟新增用户成功");
          resolve(true);
        }, 300);
      });
    }

    return request<any, any>({
      url: "api/app/user",
      method: "post",
      data,
    });
  },

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 用户更新数据
   */
  updateUser(id: string, data: UserUpdateRequest) {
    const useMockData = false; // 强制使用后端API

    if (useMockData) {
      console.log("使用模拟更新用户数据:", id, data);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟更新用户成功");
          resolve(true);
        }, 300);
      });
    }

    return request<any, any>({
      url: `api/app/user/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除用户
   * @param ids 用户ID字符串，逗号分隔
   */
  deleteUsers(ids: string) {
    const useMockData = false; // 强制使用后端API

    if (useMockData) {
      console.log("使用模拟删除用户数据:", ids);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟删除用户成功");
          resolve(true);
        }, 300);
      });
    }

    return request<any, any>({
      url: `api/app/user/${ids}`, // 根据后端设计，可能需要调整为 query param 或 request body
      method: "delete",
    });
  },

  /**
   * 获取用户列表（分页）
   * @param params 查询参数
   */
  getUserList(params?: UserListParams) {
    // 检查是否应该使用模拟数据（当baseURL为空或明确指定使用模拟数据时）
    // 设置为false强制使用后端API
    const useMockData = false; // 修改这里强制使用后端API
    console.log("获取用户列表 - 使用模拟数据:", useMockData);

    if (useMockData) {
      console.log("使用模拟用户列表数据");
      return new Promise<UserPageResult>((resolve) => {
        setTimeout(() => {
          // 模拟用户列表数据
          const mockUsers: UserListItem[] = [
            {
              id: "1",
              userName: "admin",
              userEmail: "admin@example.com",
              userPhone: "13800138000",
              userSex: true,
            },
            {
              id: "2",
              userName: "test",
              userEmail: "test@example.com",
              userPhone: "13900139000",
              userSex: true,
            },
            {
              id: "3",
              userName: "user",
              userEmail: "user@example.com",
              userPhone: "13700137000",
              userSex: true,
            },
            {
              id: "4",
              userName: "guest",
              userEmail: "guest@example.com",
              userPhone: "13600136000",
              userSex: true,
            },
          ];

          // 简单的分页和筛选逻辑
          let filteredUsers = [...mockUsers];

          // 关键字筛选
          if (params?.keywords) {
            const keyword = params.keywords.toLowerCase();
            filteredUsers = filteredUsers.filter(
              (user) =>
                user.userName.toLowerCase().includes(keyword) ||
                user.userEmail.toLowerCase().includes(keyword) ||
                user.userPhone.includes(keyword)
            );
          }

          // 状态筛选
          if (params?.status !== undefined) {
            filteredUsers = filteredUsers.filter((user) => {
              // 这里假设status=1为正常，status=0为禁用
              // 实际逻辑可能需要根据API规范调整
              const isActive = params.status === 1;
              return isActive; // 示例逻辑，实际应根据后端API规范处理
            });
          }

          // 部门过滤
          if (params?.deptId) {
            // 在实际场景中，应该基于deptId过滤用户
            // 这里简单模拟
            filteredUsers = filteredUsers.filter((_, index) => index % 2 === 0);
          }

          // 计算总数
          const total = filteredUsers.length;

          // 分页
          const pageSize = params?.pageSize || 10;
          const pageIndex = params?.pageIndex || 1;
          const start = (pageIndex - 1) * pageSize;
          const end = start + pageSize;
          const pagedUsers = filteredUsers.slice(start, end);

          resolve({
            totalCount: total,
            totalPage: Math.ceil(total / pageSize),
            data: pagedUsers,
          });
        }, 500);
      });
    }

    // 实际API调用 - 根据Swagger接口规范调用后端API
    return request<any, UserPageResult>({
      url: "api/app/user",
      method: "get",
      params,
    });
  },

  /**
   * 用户注册
   * @param data 用户注册数据
   */
  register(data: UserRegisterRequest) {
    const useMockData = localStorage.getItem("useMockData") === "true";

    if (useMockData) {
      console.log("使用模拟注册用户数据:", data);
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log("模拟注册用户成功");
          resolve(true);
        }, 300);
      });
    }

    return request<any, any>({
      url: "api/app/user",
      method: "post",
      data,
    });
  },
};

export default MyUserAPI;

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应体中的用户数据和令牌信息 */
export interface LoginResult {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userSex: boolean;
  nickname?: string;
  avatar?: string;
  roles?: string[];
  perms?: string[];
  // 假设令牌信息也包含在登录响应的data中，如果实际没有，则需要修改后端或前端逻辑
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

/** 用户信息 (用于Pinia store) */
export interface UserInfo {
  userId?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
  userEmail?: string;
  userPhone?: string;
  userSex?: boolean;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}

/** 用户新增请求 */
export interface UserAddRequest {
  userName: string;
  userPwd?: string;
  userEmail?: string;
  userPhone?: string;
  userSex: boolean | null;
}

/** 用户更新请求 */
export interface UserUpdateRequest {
  userName: string;
  userPwd?: string;
  userEmail?: string;
  userPhone?: string;
  userSex: boolean | null;
}

/** 用户注册请求 */
export interface UserRegisterRequest {
  userName: string;
  userPwd: string;
  userEmail?: string;
  userPhone?: string;
  userSex: boolean | null;
}

/** 用户列表项数据 */
export interface UserListItem {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userSex: boolean | null;
}

/** 用户列表查询参数 */
export interface UserListParams {
  pageIndex?: number;
  pageSize?: number;
  keywords?: string;
  status?: number;
  deptId?: string;
  beginTime?: string;
  endTime?: string;
}

/** 用户分页结果 */
export interface UserPageResult {
  totalCount: number;
  totalPage: number;
  data: UserListItem[];
}
