import { useDictStoreHook } from "@/store/modules/dict.store";
import { ref } from "vue";

// 字典消息类型
export interface DictMessage {
  dictCode: string;
  timestamp: number;
}

// 字典事件回调类型
export type DictMessageCallback = (_message: DictMessage) => void;

// 全局单例实例
let instance: ReturnType<typeof createDictSyncHook> | null = null;

/**
 * 创建字典同步组合式函数
 * WebSocket功能已禁用，提供空实现
 */
function createDictSyncHook() {
  const dictStore = useDictStoreHook();

  // 连接状态(始终为false)
  const isConnected = ref(false);

  // 消息回调函数列表
  const messageCallbacks = ref<DictMessageCallback[]>([]);

  /**
   * 注册字典消息回调(已禁用)
   * @param callback 回调函数
   */
  const onDictMessage = (callback: DictMessageCallback) => {
    console.log("[DictSync] WebSocket功能已禁用");
    return () => {
      // 空函数
    };
  };

  /**
   * 初始化WebSocket(已禁用)
   */
  const initWebSocket = async () => {
    console.log("[DictSync] WebSocket功能已禁用");
  };

  /**
   * 关闭WebSocket(已禁用)
   */
  const closeWebSocket = () => {
    console.log("[DictSync] WebSocket功能已禁用");
  };

  /**
   * 处理字典事件(已禁用)
   */
  const handleDictEvent = (message: any) => {
    console.log("[DictSync] WebSocket功能已禁用");
  };

  return {
    isConnected,
    initWebSocket,
    closeWebSocket,
    handleDictEvent,
    onDictMessage,
  };
}

/**
 * 字典同步组合式函数
 * WebSocket功能已禁用，提供空实现
 */
export function useDictSync() {
  if (!instance) {
    instance = createDictSyncHook();
  }
  return instance;
}
