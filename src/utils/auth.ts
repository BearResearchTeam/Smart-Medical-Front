import { Storage } from "./storage";
import { AUTH_KEYS } from "@/constants";

/**
 * 身份验证工具类
 * 集中管理所有与认证相关的功能，包括：
 * - 登录状态判断
 * - Token 的存取
 * - 记住我功能的状态管理
 */
export class Auth {
  /**
   * 判断用户是否已登录
   * @returns 是否已登录
   */
  static isLoggedIn(): boolean {
    const loggedInStatus = !!Auth.getAccessToken();
    console.log(`[Auth] isLoggedIn: ${loggedInStatus}`);
    return loggedInStatus;
  }

  /**
   * 获取当前有效的访问令牌
   * 会根据"记住我的"状态从适当的存储位置获取
   * @returns 当前有效的访问令牌
   */
  static getAccessToken(): string {
    const isRememberMe = Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
    console.log(`[Auth] getAccessToken - isRememberMe: ${isRememberMe}`);
    const token = isRememberMe
      ? Storage.get(AUTH_KEYS.ACCESS_TOKEN, "")
      : Storage.sessionGet(AUTH_KEYS.ACCESS_TOKEN, "");
    console.log(`[Auth] getAccessToken - Retrieved token: ${token ? "exists" : "empty"}`);
    return token;
  }

  /**
   * 获取刷新令牌
   * @returns 当前有效的刷新令牌
   */
  static getRefreshToken(): string {
    const isRememberMe = Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
    console.log(`[Auth] getRefreshToken - isRememberMe: ${isRememberMe}`);
    const token = isRememberMe
      ? Storage.get(AUTH_KEYS.REFRESH_TOKEN, "")
      : Storage.sessionGet(AUTH_KEYS.REFRESH_TOKEN, "");
    console.log(`[Auth] getRefreshToken - Retrieved token: ${token ? "exists" : "empty"}`);
    return token;
  }

  /**
   * 设置访问令牌和刷新令牌
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   * @param rememberMe 是否记住我
   */
  static setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    console.log(
      `[Auth] setTokens - accessToken: ${accessToken ? "exists" : "empty"}, refreshToken: ${refreshToken ? "exists" : "empty"}, rememberMe: ${rememberMe}`
    );
    // 保存"记住我"状态
    Storage.set(AUTH_KEYS.REMEMBER_ME, rememberMe);

    if (rememberMe) {
      // 使用localStorage长期保存
      Storage.set(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      Storage.set(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      // 使用sessionStorage临时保存
      Storage.sessionSet(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      Storage.sessionSet(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
      // 清除localStorage中可能存在的token
      Storage.remove(AUTH_KEYS.ACCESS_TOKEN);
      Storage.remove(AUTH_KEYS.REFRESH_TOKEN);
    }
  }

  /**
   * 清除所有身份验证相关的数据
   */
  static clearAuth(): void {
    console.log("[Auth] clearAuth called.");
    Storage.remove(AUTH_KEYS.ACCESS_TOKEN);
    Storage.remove(AUTH_KEYS.REFRESH_TOKEN);
    Storage.sessionRemove(AUTH_KEYS.ACCESS_TOKEN);
    Storage.sessionRemove(AUTH_KEYS.REFRESH_TOKEN);
    // 不清除记住我设置，保留用户偏好
  }

  /**
   * 获取"记住我"状态
   * @returns 是否记住我
   */
  static getRememberMe(): boolean {
    const rememberMeStatus = Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
    console.log(`[Auth] getRememberMe: ${rememberMeStatus}`);
    return rememberMeStatus;
  }
}
