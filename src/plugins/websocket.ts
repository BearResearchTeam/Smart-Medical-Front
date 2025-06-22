import { useDictSync } from "@/composables/useDictSync";
import { Auth } from "@/utils/auth";
// 不直接导入 store 或 userStore

// 空的WebSocket实例Map
const websocketInstances = new Map<string, any>();

// 用于防止重复初始化的状态标记
let isInitialized = false;
let dictWebSocketInstance: ReturnType<typeof useDictSync> | null = null;

/**
 * 注册WebSocket实例(已禁用)
 */
export function registerWebSocketInstance(key: string, instance: any) {
  console.log(`[WebSocketPlugin] WebSocket功能已禁用, 跳过注册: ${key}`);
}

/**
 * 获取WebSocket实例(已禁用)
 */
export function getWebSocketInstance(key: string) {
  console.log(`[WebSocketPlugin] WebSocket功能已禁用, 无法获取实例: ${key}`);
  return null;
}

/**
 * WebSocket插件 - 已禁用
 */
export function setupWebSocket() {
  console.log("WebSocket功能已禁用");
}

/**
 * 清理WebSocket连接(已禁用)
 */
export function cleanupWebSocket() {
  console.log("[WebSocketPlugin] WebSocket功能已完全禁用");
  return;
}

/**
 * 重新初始化WebSocket(已禁用)
 */
export function reinitializeWebSocket() {
  console.log("[WebSocketPlugin] WebSocket功能已完全禁用");
  return;
}
