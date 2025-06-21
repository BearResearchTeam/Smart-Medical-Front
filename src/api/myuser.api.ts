import request from "@/utils/request";

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
    return request<any, LoginResult>({
      url: "app/user/login",
      method: "post",
      data: {
        username: data.username,
        userPwd: data.password,
        // 验证码已在UI中注释，不需要发送
      },
    });
  },

  /**
   * 获取当前登录用户信息
   */
  getUserInfo() {
    return request<any, UserInfo>({
      url: "app/account/info",
      method: "get",
    });
  },

  /**
   * 退出登录
   */
  logout() {
    return request({
      url: "app/user/logout",
      method: "post",
    });
  },

  /**
   * 获取验证码
   */
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: "app/account/captcha",
      method: "get",
    });
  },

  /**
   * 获取用户列表 (静态数据)
   */
  getUserList() {
    return new Promise<UserListItem[]>((resolve) => {
      setTimeout(() => {
        const staticUserList: UserListItem[] = [
          {
            UserName: "admin",
            UserPwd: "********", // 静态密码，请勿用于实际展示
            UserEmail: "admin@example.com",
            UserPhone: "13800001111",
            UserSex: true, // true 代表男性
          },
          {
            UserName: "testuser",
            UserPwd: "********",
            UserEmail: "test@example.com",
            UserPhone: "13922223333",
            UserSex: false, // false 代表女性
          },
          {
            UserName: "guest",
            UserPwd: "********",
            UserEmail: "guest@example.com",
            UserPhone: "13012345678",
            UserSex: null, // null 代表未知
          },
        ];
        resolve(staticUserList);
      }, 500); // 模拟网络延迟
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

/** 用户列表项 (匹配C#模型) */
export interface UserListItem {
  UserName: string;
  UserPwd: string;
  UserEmail: string;
  UserPhone: string;
  UserSex: boolean | null;
}
