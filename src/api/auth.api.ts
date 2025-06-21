import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    // 实际调用服务器API的代码，暂时注释
    /*
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captchaKey", data.captchaKey);
    formData.append("captchaCode", data.captchaCode);
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    */

    // 返回模拟数据
    console.log("使用模拟登录数据，无需JWT");
    return Promise.resolve({
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      tokenType: "Bearer",
      expiresIn: 7200,
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken: string) {
    // 实际调用服务器API的代码，暂时注释
    /*
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
    */

    // 返回模拟数据
    console.log("使用模拟刷新Token数据，无需JWT");
    return Promise.resolve({
      accessToken: "mock-new-token",
      refreshToken: "mock-new-refresh-token",
      tokenType: "Bearer",
      expiresIn: 7200,
    });
  },

  /** 退出登录接口 */
  logout() {
    // 实际调用服务器API的代码，暂时注释
    /*
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
    */

    // 返回模拟数据
    console.log("使用模拟退出登录，无需JWT");
    return Promise.resolve();
  },

  /** 获取验证码接口*/
  getCaptcha() {
    // 可以保留验证码接口，因为它不涉及JWT
    return request<any, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

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

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expiresIn: number;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
