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
    //const cases = request;
    //debugger;
    // 检查是否应该使用模拟数据（当baseURL为空或明确指定使用模拟数据时）
    // const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";

    // if (useMockData) {
    //   console.log("使用模拟登录数据");
    //   return new Promise<LoginResult>((resolve, reject) => {
    //     setTimeout(() => {
    //       // 模拟登录成功
    //       if (data.username === "admin" && data.password === "123456") {
    //         resolve({
    //           id: "1",
    //           userName: data.username,
    //           userEmail: "admin@example.com",
    //           userPhone: "13800138000",
    //           userSex: true,
    //           nickname: "管理员",
    //           avatar: "",
    //           roles: ["admin"],
    //           perms: ["*:*:*"],
    //         });
    //       } else {
    //         // 模拟登录失败
    //         reject(new Error("用户名或密码错误"));
    //       }
    //     }, 500); // 模拟网络延迟
    //   });
    // }

    // 正常API调用
    console.log("执行实际登录API调用", data);

    // 构造后端接口需要的请求格式
    const loginRequestData = {
      userName: data.username,
      userPwd: data.password,
      rememberMe: data.rememberMe,
    };

    //api/app/user/login
    //api/app/user-login-async/login   带token
    return request<LoginFromDataLMZ>({
      url: "api/app/user-login-async/login",
      method: "post",
      data: loginRequestData, // 将登录数据作为请求体发送
    });
  },
  /**
   * 获取用户列表
   * @param params 查询参数
   */
  batchUserrole(userId: string, roleIds: string[]) {
    return request({
      url: `/api/app/user-role/batch-create/${userId}`,
      method: "post",
      data: roleIds,
    });
  },
  /**
   * 获取当前登录用户信息
   */
  getUserInfo() {
    // 检查是否使用模拟数据
    //const useMockData = !request.defaults.baseURL || localStorage.getItem("useMockData") === "true";

    // if (useMockData) {
    //   console.log("使用模拟用户信息数据");
    //   return new Promise<UserInfo>((resolve) => {
    //     setTimeout(() => {
    //       const username = localStorage.getItem("loginUser") || "admin";
    //       resolve({
    //         userId: "1",
    //         username,
    //         nickname: username === "admin" ? "管理员" : username,
    //         avatar: "",
    //         roles: ["admin"],
    //         perms: ["*:*:*"],
    //         userEmail: "admin@example.com",
    //         userPhone: "13800138000",
    //         userSex: true,
    //       });
    //     }, 300);
    //   });
    // }

    return request<UserInfo>({
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
    return request<CaptchaInfo>({
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

    return request<UserListItem>({
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

    return request<any>({
      url: "api/app/user/user-pT",
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

    return request<any>({
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

    return request<any>({
      url: `api/app/user/${ids}`, // 根据后端设计，可能需要调整为 query param 或 request body
      method: "delete",
    });
  },

  /**
   * 获取用户列表（分页）
   * @param params 查询参数
   */
  getUserList(params?: UserListParams) {
    // 实际API调用 - 根据Swagger接口规范调用后端API
    return request<UserPageResult>({
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

    return request<any>({
      url: "api/app/user/user-pT",
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
  /** 权限 */
  //permissions: string[];
}

/** 登录响应数据LMZ */
export interface LoginFromDataLMZ {
  /** 用户ID */
  id: string;
  /** 用户名 */
  userName: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
  //////////////////////////////////////////////////
  /** 用户邮箱，用于找回密码、通知等 */
  userEmail: string;
  /** 用户手机号，常用于绑定和验证 */
  userPhone: string;
  /** 用户性别，true 为男，false 为女，null 表示未设置 */
  userSex: boolean | null;
  /** 访问令牌，用于身份认证（JWT 格式） */
  accessToken: string;
  /** accessToken 的过期时间（ISO 格式字符串） */
  accessTokenExpires: string;
  /** 用户编号，通常为 UUID，唯一标识用户 */
  userNumber: string;
  /** 用于刷新 accessToken 的令牌（JWT 格式） */
  refreshToken: string;
  /** refreshToken 的过期时间（ISO 格式字符串） */
  refreshTokenExpires: string;
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
  roleName: null;
  userRoles: [];
  roles?: string[];
  perms?: string[];
  // 假设令牌信息也包含在登录响应的data中，如果实际没有，则需要修改后端或前端逻辑
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  permissions?: string[];
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
  Sorting?: string;
  SkipCount: number;
  MaxResultCount: number;
  UserName?: string;
  UserEmail?: string;
  UserPhone?: string;
}

/** 用户分页结果 */
export interface UserPageResult {
  totleCount: number;
  totlePage: number;
  data: UserListItem[];
}
