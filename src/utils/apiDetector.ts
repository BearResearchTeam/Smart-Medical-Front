import axios from "axios";

/**
 * API检测器
 * 用于检测后端API是否可用，并自动设置模拟数据模式
 */
export class ApiDetector {
  /**
   * 检测API是否可用并自动设置模拟数据模式
   * @param url 要检测的API地址
   * @param timeout 超时时间（毫秒）
   * @returns Promise<boolean> 是否可用
   */
  static async autoDetectAndSetMode(url: string, timeout: number = 3000): Promise<boolean> {
    try {
      console.log(`[ApiDetector] 正在检测API: ${url}`);

      // 创建一个可以取消的请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 发送请求检测API是否可用
      const response = await axios.get(url, {
        signal: controller.signal,
        timeout,
        validateStatus: () => true, // 任何状态码都视为成功（我们只需要知道服务器是否响应）
      });

      // 清除超时
      clearTimeout(timeoutId);

      console.log(`[ApiDetector] API响应状态: ${response.status}`, response.data);

      // 检查响应是否有效
      if (response.status >= 200 && response.status < 500) {
        // API可用，关闭模拟数据模式
        localStorage.setItem("useMockData", "false");
        console.log("[ApiDetector] API可用，已关闭模拟数据模式");
        return true;
      } else {
        // API返回了错误状态码
        localStorage.setItem("useMockData", "true");
        console.log(`[ApiDetector] API返回错误状态码: ${response.status}，已启用模拟数据模式`);
        return false;
      }
    } catch (error: any) {
      // 输出详细错误信息
      console.error("[ApiDetector] API检测失败:", error);
      if (error.code) {
        console.error(`[ApiDetector] 错误代码: ${error.code}`);
      }
      if (error.message) {
        console.error(`[ApiDetector] 错误信息: ${error.message}`);
      }

      // API不可用，启用模拟数据模式
      localStorage.setItem("useMockData", "true");
      console.log("[ApiDetector] API不可用，已启用模拟数据模式");
      return false;
    }
  }

  /**
   * 测试与指定URL的连接
   * @param baseUrl API基础URL
   * @returns 连接状态描述
   */
  static async testConnection(baseUrl: string): Promise<string> {
    try {
      // 尝试连接，改用GET方法代替OPTIONS
      const response = await axios({
        method: "get",
        url: baseUrl,
        timeout: 5000,
        validateStatus: () => true, // 允许任何状态码
      });

      // 检查响应状态
      if (response.status >= 200 && response.status < 500) {
        return `连接成功 (状态码: ${response.status})`;
      } else if (response.status >= 500) {
        return `服务器错误 (状态码: ${response.status})`;
      } else {
        return `未知状态 (状态码: ${response.status})`;
      }
    } catch (error: any) {
      // 错误处理
      if (error.code === "ECONNABORTED") {
        return "连接超时，API服务器不可达";
      } else if (error.code === "ERR_NETWORK") {
        return "网络错误，请检查API服务器是否运行";
      } else if (error.response) {
        return `API服务器返回错误 (状态码: ${error.response.status})`;
      } else {
        return `连接失败: ${error.message || "未知错误"}`;
      }
    }
  }
}
