import { ref } from "vue";
import type { IMessage } from "@stomp/stompjs";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 用于鉴权的 token，不传时使用 getAccessToken() 的返回值 */
  token?: string;
  /** 重连延迟，单位毫秒，默认为 8000 */
  reconnectDelay?: number;
  /** 连接超时时间，单位毫秒，默认为 10000 */
  connectionTimeout?: number;
  /** 是否开启指数退避重连策略 */
  useExponentialBackoff?: boolean;
  /** 最大重连次数，默认为 5 */
  maxReconnectAttempts?: number;
  /** 最大重连延迟，单位毫秒，默认为 60000 */
  maxReconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

/**
 * STOMP WebSocket连接组合式函数 (已禁用)
 * WebSocket功能已完全禁用，提供模拟接口
 */
export function useStomp(options: UseStompOptions = {}) {
  // 连接状态标记(始终为false)
  const isConnected = ref(false);

  // 提供空实现，避免错误
  const connect = () => {
    console.log("[useStomp] WebSocket功能已禁用");
  };

  const subscribe = (_destination: string, _callback: (_message: IMessage) => void): string => {
    console.log("[useStomp] WebSocket功能已禁用");
    return "";
  };

  const unsubscribe = (_subscriptionId: string) => {
    console.log("[useStomp] WebSocket功能已禁用");
  };

  const disconnect = () => {
    console.log("[useStomp] WebSocket功能已禁用");
  };

  return {
    isConnected,
    connect,
    subscribe,
    unsubscribe,
    disconnect,
  };
}
