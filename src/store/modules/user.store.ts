import { store } from "@/store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import MyUserAPI from "@/api/myuser.api";
import type { UserInfo } from "@/api/myuser.api";

import { Auth } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { useDictStoreHook } from "@/store/modules/dict.store";
import { useTagsViewStore } from "@/store";
import { cleanupWebSocket } from "@/plugins/websocket";

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);
  // 记住我状态
  const rememberMe = ref(Auth.getRememberMe());

  /**
   * 登录
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      MyUserAPI.login(LoginFormData)
        .then((data) => {
          // JWT相关代码（保留但不实际使用）
          const {
            accessToken,
            refreshToken,
            id,
            userName,
            nickname,
            avatar,
            roles,
            perms,
            userEmail,
            userPhone,
            userSex,
          } = data;
          // 保存记住我状态和token
          rememberMe.value = LoginFormData.rememberMe;
          // 还原：仅当accessToken存在时才设置token，以防后端不返回token
          if (accessToken) {
            Auth.setTokens(accessToken, refreshToken || "", rememberMe.value);
          } else {
            // 临时措施：如果后端未返回accessToken，设置一个虚拟token以允许前端跳转
            console.warn("后端未返回accessToken，设置虚拟token以允许前端跳转。");
            Auth.setTokens("DUMMY_ACCESS_TOKEN", "DUMMY_REFRESH_TOKEN", rememberMe.value);
          }

          // 使用后端返回的用户信息更新userInfo
          Object.assign(userInfo.value, {
            userId: id,
            username: userName,
            nickname: nickname || userName, // 如果昵称不存在，使用用户名
            avatar: avatar || "",
            roles: roles || [],
            perms: perms || [],
            userEmail: userEmail || "",
            userPhone: userPhone || "",
            userSex: userSex || false,
          });

          // 清除本地缓存模拟登录状态，现在使用pinia存储
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginUser");

          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 获取用户信息
   *
   * @returns {UserInfo} 用户信息
   */
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      // 此方法在登录时已直接获取用户信息，这里不再需要进行API调用
      // 可以直接返回当前userInfo
      if (userInfo.value && userInfo.value.userId) {
        resolve(userInfo.value);
        return;
      }
      // 还原：如果userInfo为空（例如直接访问，未经过登录流程），抛出错误
      // console.warn("用户信息为空，提供默认用户信息以避免重定向循环。"); // 临时日志已移除
      reject("用户信息为空，请登录"); // 还原原始代码
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      MyUserAPI.logout()
        .then(() => {
          // 清除本地登录状态
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginUser");

          // 重置所有系统状态
          resetAllState();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 重置所有系统状态
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState() {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    // 重置路由
    usePermissionStoreHook().resetRouter();
    // 清除字典缓存
    useDictStoreHook().clearDictCache();
    // 清除标签视图
    useTagsViewStore().delAllViews();

    // 3. 清理 WebSocket 连接
    cleanupWebSocket();
    console.log("[UserStore] WebSocket connections cleaned up");

    return Promise.resolve();
  }

  /**
   * 重置用户状态
   * 仅处理用户模块内的状态
   */
  function resetUserState() {
    // 清除用户凭证
    Auth.clearAuth();
    // 重置用户信息
    userInfo.value = {} as UserInfo;
  }

  /**
   * 刷新 token
   */
  function refreshToken() {
    // JWT令牌刷新代码，暂时注释但保留功能结构
    /*
    const refreshToken = Auth.getRefreshToken();

    if (!refreshToken) {
      return Promise.reject(new Error("没有有效的刷新令牌"));
    }
    */

    return new Promise<void>((resolve, reject) => {
      // 如果使用模拟数据，直接返回成功
      if (localStorage.getItem("isLoggedIn") === "true") {
        console.log("使用模拟刷新token，无需JWT");
        resolve();
        return;
      }

      // 实际API调用 - 使用原AuthAPI，因为MyUserAPI未实现刷新token功能
      const refreshToken = Auth.getRefreshToken();
      AuthAPI.refreshToken(refreshToken)
        .then((data) => {
          const { accessToken, refreshToken: newRefreshToken } = data;
          // 更新令牌，保持当前记住我状态
          Auth.setTokens(accessToken, newRefreshToken, Auth.getRememberMe());
          resolve();
        })
        .catch((error) => {
          console.log(" refreshToken  刷新失败", error);
          reject(error);
        });
    });
  }

  return {
    userInfo,
    rememberMe,
    getUserInfo,
    login,
    logout,
    resetAllState,
    resetUserState,
    refreshToken,
  };
});

/**
 * 在组件外部使用UserStore的钩子函数
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
