import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestConfig,
  type AxiosError,
} from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import { Auth } from "@/utils/auth";
import router from "@/router";
import { ElMessage, ElMessageBox } from "element-plus";
import { store } from "@/store";
import type { BackendApiResponse } from "@/types/api";

/**
 * 创建 HTTP 请求实例
 *
 * 注意：如果后端API地址有变化，请修改下面的baseURL
 * - 开发环境通常是: http://localhost:端口号/
 * - 如果使用Docker或其他环境，请相应调整
 * - 如果后端服务未启动，可以将baseURL设置为空字符串，前端将使用模拟数据
 */
const service = axios.create({
  baseURL: "https://localhost:44394/",
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: false, // 禁用跨源凭据
});

// 打印baseURL值，方便调试
console.log("HTTP请求baseURL:", service.defaults.baseURL);

/**
 * 请求拦截器 - 添加 Authorization 头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 发送请求: ${config.method} ${config.url}`);

    // 确保登录接口使用POST方法
    if (config.url?.includes("/login") && !config.method) {
      console.log("强制设置登录请求为POST方法");
      config.method = "post";
    }

    // JWT认证相关代码已注释
    /*
    const accessToken = Auth.getAccessToken();

    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    */

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse<BackendApiResponse>) => {
    // 如果响应是二进制流，则直接返回（用于文件下载、Excel 导出等）
    if (response.config.responseType === "blob") {
      return response;
    }

    const { isSuc, data, msg, code } = response.data;

    // 请求成功：检查 isSuc 和 code
    if (isSuc === true && code.toString() === ResultEnum.SUCCESS) {
      return data;
    }

    // 业务错误
    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Business Error"));
  },
  async (error: AxiosError) => {
    const { response, message } = error;
    if (message?.includes("timeout")) {
      ElMessage.error("请求超时，请稍后重试");
    } else if (response) {
      handleError(response.status);
    } else {
      ElMessage.error("网络错误，请检查您的网络连接");
    }
    return Promise.reject(error);
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
      service(config).then(resolve).catch(reject);
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
  const userStore = useUserStoreHook();
  await userStore.logout();
  ElMessage.warning(message);
  await router.push("/login");
}

// 错误处理
function handleError(status: number) {
  switch (status) {
    case 401:
      ElMessageBox.confirm("登录已过期，请重新登录", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const userStore = useUserStoreHook();
        userStore.logout().then(() => {
          location.reload();
        });
      });
      break;
    case 403:
      ElMessage.error("您没有权限访问该资源");
      break;
    case 404:
      ElMessage.error("请求的资源不存在");
      break;
    default:
      ElMessage.error(`请求错误，状态码：${status}`);
  }
}

// 之前这里导出了一个包裹函数，现在直接导出axios实例
// const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
//   return service(config);
// };

export default service; // 直接导出service实例，它拥有get, post等方法
