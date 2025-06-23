import { ref } from "vue";

/**
 * 在线用户计数组合式函数
 * WebSocket功能已禁用，返回模拟数据
 */
export function useOnlineCount() {
  // 在线用户数量(固定值)
  const onlineUserCount = ref(0);
  // 最后更新时间戳
  const lastUpdateTime = ref(0);
  // 连接状态(始终为false)
  const isConnected = ref(false);
  // 连接正在尝试中(始终为false)
  const isConnecting = ref(false);

  /**
   * 初始化WebSocket连接(已禁用)
   */
  const initWebSocket = () => {
    console.log("[useOnlineCount] WebSocket功能已禁用");
    return;
  };

  /**
   * 关闭WebSocket连接(已禁用)
   */
  const closeWebSocket = () => {
    console.log("[useOnlineCount] WebSocket功能已禁用");
    return;
  };

  return {
    onlineUserCount,
    lastUpdateTime,
    isConnected,
    isConnecting,
    initWebSocket,
    closeWebSocket,
  };
}
