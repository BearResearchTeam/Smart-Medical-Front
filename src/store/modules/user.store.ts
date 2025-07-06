import { store } from "@/store";
import { Auth } from "@/utils/auth";
import type { LoginFromDataLMZ, LoginFormData } from "@/api/myuser.api";
import { usePermissionStore } from "./permission.store";
import { Storage } from "@/utils/storage";
import { AUTH_KEYS } from "@/constants";
import MyUserAPI from "@/api/myuser.api";
import { defineStore } from 'pinia'
import { log } from "console";


// 用户信息的存储键
const USER_INFO_KEY = "user_info";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref({
    userId: "1",
    username: "admin",
    realName: "管理员",
    avatar: "",
    roles: ["admin"],
    perms: ["*:*:*"],
    // 添加更多用户相关字段
    userEmail: "",
    userPhone: "",
    userSex: true,
  });

  // 初始化时从本地存储加载用户信息
  const initUserInfo = () => {
    const savedUserInfo = Storage.get(USER_INFO_KEY);
    if (savedUserInfo) {
      userInfo.value = { ...userInfo.value, ...savedUserInfo };
    }
  };

  // 保存用户信息到本地存储
  const saveUserInfo = () => {
    Storage.set(USER_INFO_KEY, userInfo.value);
  };

 
const permissions = ref<string[]>([]);
  // 登录
  async function login(loginData: LoginFormData) {
    try {
      debugger
      // 检查是否使用模拟数据
      //const useMockData = localStorage.getItem("useMockData") === "true";

      // 如果使用模拟数据，直接返回模拟结果
      // if (useMockData) {
      //   console.log("使用模拟数据登录");

      //   // 保存记住我选项
      //   Storage.set(AUTH_KEYS.REMEMBER_ME, loginData.rememberMe);

      //   // 设置登录状态（使用模拟令牌）
      //   Auth.setTokens("mock-token", "mock-refresh-token", loginData.rememberMe);

      //   // 模拟数据也更新 userInfo
      //   userInfo.value = {
      //     ...userInfo.value,
      //     userId: "1", // 模拟用户ID
      //     username: loginData.username,
      //     realName: loginData.username, // 模拟真实姓名
      //     userEmail: "mock@example.com",
      //     userPhone: "13800138000",
      //     userSex: true, // 模拟性别
      //   };

      //   // 保存用户信息到本地存储
      //   saveUserInfo();

      //   return {
      //     id: "1",
      //     userName: loginData.username,
      //     userEmail: "admin@example.com",
      //     userPhone: "13800138000",
      //     userSex: true,
      //   };
      // }

      // 调用API进行登录
      //console.log("调用真实API登录");
      const result = await MyUserAPI.login(loginData);
      //console.log(result);

      //console.log(result);

      //将返回的用户信息存入localStorage
      localStorage.setItem("userInfo", JSON.stringify(result));
      //console.log("result", result);
       
      permissions.value = result.permissions ?? [];
      // // 保存记住我选项
      // Storage.set(AUTH_KEYS.REMEMBER_ME, loginData.rememberMe);

      // // 设置登录状态
      // Auth.setTokens(
      //   result.accessToken || "mock-token",
      //   result.refreshToken || "mock-refresh-token",
      //   loginData.rememberMe,
      // );

      // 打印登录结果，以便调试
      console.log("登录API返回结果:", result);

      // 更新用户信息状态
      // userInfo.value = {
      //   ...userInfo.value,
      //   userId: result.id,
      //   username: result.userName,
      //   realName: result.userName,
      //   userEmail: result.userEmail,
      //   userPhone: result.userPhone,
      //   userSex: result.userSex === true,
      //   // 保持现有的角色和权限
      //   roles: userInfo.value.roles,
      //   perms: userInfo.value.perms,
      // };

      // // 保存用户信息到本地存储
      // saveUserInfo();

      // // 检查 accessToken 和 refreshToken 是否存在
      // if (!result.accessToken || !result.refreshToken) {
      //   console.warn("警告: 登录响应中缺少 accessToken 或 refreshToken。请检查后端或API接口定义。");
      // }

      return result;
    } catch (error) {
      console.error("登录失败:", error);
      localStorage.setItem("useMockData", "true");
      console.log("切换到模拟数据模式");
      throw error;
    }
  }
  // 检查用户是否具有指定权限
 function hasPerm(code: string) {
  return permissions.value.includes(code);
}
  // 获取用户信息
  async function getUserInfo() {
    try {
      // 如果本地没有用户信息，尝试从本地存储加载
      if (!userInfo.value.userId) {
        initUserInfo();
      }
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
      // 清除本地存储的用户信息
      Storage.remove(USER_INFO_KEY);
      // 重置用户信息
      userInfo.value = {
        userId: "",
        username: "",
        realName: "",
        avatar: "",
        roles: [],
        perms: [],
        userEmail: "",
        userPhone: "",
        userSex: true,
      };
      // 重置路由
      usePermissionStore().resetRouter();
      return true;
    } catch (error) {
      console.error("重置状态失败:", error);
      throw error;
    }
  }

  // 初始化时加载用户信息
  initUserInfo();

  return {
    userInfo,
    permissions,
    hasPerm,
    login,
    getUserInfo,
    logout,
    resetAllState,
  };

}, {
   persist: {
    storage: sessionStorage,
  },
});

export function useUserStoreHook() {
  return useUserStore(store);
}
