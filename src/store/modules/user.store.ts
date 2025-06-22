import { store } from "@/store";
import { Auth } from "@/utils/auth";
import type { LoginFormData } from "@/api/myuser.api";
import { usePermissionStore } from "./permission.store";
import { Storage } from "@/utils/storage";
import { AUTH_KEYS } from "@/constants";
import MyUserAPI from "@/api/myuser.api";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref({
    userId: "1",
    username: "admin",
    realName: "管理员",
    avatar: "",
    roles: ["admin"],
    perms: ["*:*:*"],
  });

  // 登录
  async function login(loginData: LoginFormData) {
    try {
      // 检查是否使用模拟数据
      const useMockData = localStorage.getItem("useMockData") === "true";

      // 如果使用模拟数据，直接返回模拟结果
      if (useMockData) {
        console.log("使用模拟数据登录");

        // 保存记住我选项
        Storage.set(AUTH_KEYS.REMEMBER_ME, loginData.rememberMe);

        // 设置登录状态（使用模拟令牌）
        Auth.setTokens("mock-token", "mock-refresh-token", loginData.rememberMe);

        return {
          id: "1",
          userName: loginData.username,
          userEmail: "admin@example.com",
          userPhone: "13800138000",
          userSex: true,
        };
      }

      // 调用API进行登录
      console.log("调用真实API登录");
      const result = await MyUserAPI.login(loginData);

      // 保存记住我选项
      Storage.set(AUTH_KEYS.REMEMBER_ME, loginData.rememberMe);

      // 设置登录状态
      Auth.setTokens(
        result.accessToken || "mock-token",
        result.refreshToken || "mock-refresh-token",
        loginData.rememberMe
      );

      return result;
    } catch (error) {
      console.error("登录失败:", error);
      // 如果API调用失败，尝试使用模拟数据
      localStorage.setItem("useMockData", "true");
      console.log("切换到模拟数据模式");
      throw error;
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      // 返回静态用户信息
      return userInfo.value;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      throw error;
    }
  }

  // 退出登录
  async function logout() {
    try {
      // 重置状态
      await resetAllState();
      return true;
    } catch (error) {
      console.error("退出登录失败:", error);
      throw error;
    }
  }

  // 重置所有状态
  async function resetAllState() {
    try {
      // 清除token
      Auth.clearAuth();
      // 重置路由
      usePermissionStore().resetRouter();
      return true;
    } catch (error) {
      console.error("重置状态失败:", error);
      throw error;
    }
  }

  return {
    userInfo,
    login,
    getUserInfo,
    logout,
    resetAllState,
  };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
