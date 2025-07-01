import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import router from "@/router";

// 定义后端响应的基本结构
interface BackendApiResponse<T = any> {
  data: T;
  isSuc: boolean; // 新的成功标识
  code: number; // 状态码，成功时为 200
  msg: string; // 消息
}

/**
 * 创建 HTTP 请求实例
 *
 * 注意：如果后端API地址有变化，请修改下面的baseURL
 * - 开发环境通常是: http://localhost:端口号/
 * - 如果使用Docker或其他环境，请相应调整
 * - 如果后端服务未启动，可以将baseURL设置为空字符串，前端将使用模拟数据
 */
const httpRequest = axios.create({
  baseURL: "https://localhost:44394/",
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: false, // 禁用跨源凭据
});

// 打印baseURL值，方便调试
console.log("HTTP请求baseURL:", httpRequest.defaults.baseURL);





/**
 * 请求拦截器 - 添加 Authorization 头
 */
httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 发送请求: ${config.method?.toUpperCase()} ${config.url}`);

    if (config.url?.includes("/login") && !config.method) {
      config.method = "post";
    }

    // 从 localStorage 获取 token
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const accessToken = userInfo.accessToken;

      if (accessToken && config.headers?.Authorization !== "no-auth") {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log("✅ 已添加 accessToken 到请求头");
      }
    } catch (e) {
      console.warn("⚠️ 解析 userInfo 出错", e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<BackendApiResponse>) => {
    // 二进制流（如 Excel）直接返回
    if (response.config.responseType === "blob") {
      return response;
    }
    //解构
    const { isSuc, data, msg, code } = response.data;

    if (isSuc === true && code.toString() === ResultEnum.SUCCESS) {
      return data;
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Business Error"));
  },

  async (error) => {
    console.error("❌ 响应拦截器捕获错误:", error);

    const useMockData = localStorage.getItem("useMockData") === "true";
    const { response, code, message, config } = error;
    // 保存原始请求配置
    // 原来的请求
    const originalRequest = config;
    // ✅ 模拟数据模式 - 忽略错误
    if (useMockData) {
      console.warn("🚧 模拟数据模式开启，跳过 API 错误处理");
      return {};
    }

    // ✅ 网络错误处理
    if (!response) {
      let errorMsg = "网络连接失败";

      if (code === "ERR_NETWORK") {
        errorMsg = "网络错误，无法连接到服务器";
      } else if (code === "ECONNABORTED") {
        errorMsg = "请求超时，服务器响应时间过长";
      } else if (message) {
        errorMsg = `${errorMsg}: ${message}`;
      }

      ElMessage.error(errorMsg);
      ElMessage.info("建议启用【模拟数据】模式继续开发");
      return Promise.reject(error);
    }

    // ✅ 401 未授权 - 尝试刷新 Token
    if (response.status === 401 || code === "ERR_BAD_REQUEST") {
      console.warn("⛔ 未授权或Token失效，尝试刷新...");

      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const refreshToken = userInfo.refreshToken;

        if (refreshToken) {
          // 刷新 Token
          const refreshRes = await axios.post(httpRequest.defaults.baseURL + "refresh", {
            refreshToken,
          });
          // 刷新成功
          const newTokenInfo = refreshRes.data;
          localStorage.setItem("userInfo", JSON.stringify(newTokenInfo));

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokenInfo.accessToken}`;
          }
          // 返回重试后的请求结果
          return httpRequest(originalRequest);
        } else {
          throw new Error("无有效 refreshToken");
        }
      } catch (refreshErr) {
        console.error("🔁 刷新 token 失败:", refreshErr);
        ElMessage.warning("登录状态已过期，请重新登录");
        // 你也可以在这里跳转到登录页
        window.location.href = "/login";
        return Promise.reject(new Error("未授权，需重新登录"));
      }
    }

    // ✅ 其他 API 错误
    const { msg } = response.data as BackendApiResponse;
    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "Request Error"));
  }
);




/**
 * 重试请求的回调函数类型
 */
type RetryCallback = () => void;

// JWT认证相关代码已注释
/*
// Token 刷新相关状态
let isRefreshingToken = false;
const pendingRequests: RetryCallback[] = [];

/**
 * 刷新 Token 并重试请求
 */
/*
async function refreshTokenAndRetry(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    // 封装需要重试的请求
    const retryRequest = () => {
      const newToken = Auth.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      httpRequest(config).then(resolve).catch(reject);
    };

    // 将请求加入等待队列
    pendingRequests.push(retryRequest);

    // 如果没有正在刷新，则开始刷新流程
    if (!isRefreshingToken) {
      isRefreshingToken = true;

      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // 刷新成功，重试所有等待的请求
          pendingRequests.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              console.error("Retry request error:", error);
            }
          });
          // 清空队列
          pendingRequests.length = 0;
        })
        .catch(async (error) => {
          console.error("Token refresh failed:", error);
          // 刷新失败，清空队列并跳转登录页
          pendingRequests.length = 0;
          await redirectToLogin("登录状态已失效，请重新登录");
          // 拒绝所有等待的请求
          pendingRequests.forEach(() => {
            reject(new Error("Token refresh failed"));
          });
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}
*/

/**
 * 重定向到登录页面
 */
async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  try {
    ElNotification({
      title: "提示",
      message,
      type: "warning",
      duration: 3000,
    });

    await useUserStoreHook().resetAllState();

    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
  }
}

export default httpRequest;
