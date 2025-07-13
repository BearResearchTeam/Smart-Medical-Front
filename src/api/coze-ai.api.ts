import httpRequest from "@/utils/request";

export interface CozeAIRequest {
  content: string;
  botId?: string;
  userId?: string;
  conversationId?: string;
  stream?: boolean;
  autoSaveHistory?: boolean;
}

export interface CozeAIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface CozeAIResponse {
  message: string;
  conversationId?: string;
  messageId?: string;
}

class CozeAIAPI {
  /**
   * 发送流式消息到Coze AI
   */
  async sendStreamMessage(params: CozeAIRequest): Promise<Response> {
    const requestData = {
      content: params.content,
      botId: "7524702072735367168",
      userId: "2864527505",
      conversationId: "1234567890",
      stream: true,
      autoSaveHistory: true,
    };

    // 使用原生fetch进行流式请求
    const response = await fetch(
      `${httpRequest.defaults.baseURL}api/app/kou-zi-aI/send-stream-merged`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: httpRequest.defaults.headers.Authorization || "",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  /**
   * 原生流式消息到Coze AI
   */
  async sendNativeStreamMessage(params: CozeAIRequest): Promise<Response> {
    const requestData = {
      content: params.content,
      botId: params.botId || "7524702072735367168",
      userId: params.userId || "2864527505",
      conversationId: params.conversationId || "",
      stream: true,
      autoSaveHistory: true,
    };

    // 使用原生fetch进行流式请求
    const response = await fetch(
      `${httpRequest.defaults.baseURL}api/app/kou-zi-aI/send-stream-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: httpRequest.defaults.headers.Authorization || "",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  /**
   * 非流式发送消息
   */
  async sendMessage(params: CozeAIRequest): Promise<CozeAIResponse> {
    const requestData = {
      content: params.content,
      botId: params.botId || "123",
      userId: params.userId || "",
      conversationId: params.conversationId || "",
      stream: false,
      autoSaveHistory: params.autoSaveHistory !== false,
    };

    return httpRequest.post("/api/app/kou-zi-aI/send-stream-merged", requestData);
  }
}

export default new CozeAIAPI();
