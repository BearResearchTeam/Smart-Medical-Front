<template>
  <div class="ai-chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <el-icon class="robot-icon">
          <Robot />
        </el-icon>
        <span class="chat-title">AI 智能助手</span>
      </div>
      <div class="header-right">
        <el-button size="small" text @click="clearChat">
          <el-icon>
            <Delete />
          </el-icon>
          清空对话
        </el-button>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div ref="messagesContainer" class="chat-messages">
      <div v-for="message in messages" :key="message.id" :class="['message-item', message.role]">
        <div class="message-avatar">
          <el-avatar :size="36" :src="message.role === 'user' ? userAvatar : aiAvatar">
            <el-icon v-if="message.role === 'user'">
              <User />
            </el-icon>
            <el-icon v-else>
              <Robot />
            </el-icon>
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div v-if="message.role === 'assistant' && message.id === streamingMessageId" class="streaming-content">
              {{ streamingContent }}
              <span class="cursor">|</span>
            </div>
            <div v-else v-html="formatMessage(message.content)"></div>
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="message-item assistant">
        <div class="message-avatar">
          <el-avatar :size="36" :src="aiAvatar">
            <el-icon>
              <Robot />
            </el-icon>
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <el-input v-model="inputMessage" :placeholder="isLoading ? 'AI正在思考中...' : '请输入您的问题...'" :disabled="isLoading"
          :autosize="{ minRows: 1, maxRows: 4 }" type="textarea" resize="none" class="message-input"
          @keydown.enter="handleSendMessage" />
        <el-button type="primary" :disabled="!inputMessage.trim() || isLoading" class="send-button"
          @click="handleSendMessage">
          <el-icon v-if="isLoading">
            <Loading />
          </el-icon>
          <el-icon v-else>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Delete, Loading, Promotion } from '@element-plus/icons-vue';
import cozeAIAPI, { type CozeAIMessage } from '@/api/coze-ai.api';

// 响应式数据
const messages = ref<CozeAIMessage[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();
const conversationId = ref('');
const streamingContent = ref('');
const streamingMessageId = ref('');

// 头像设置
const userAvatar = ref('');
const aiAvatar = ref('/src/assets/kouziImg/F65F302728FBEF745DB5211D6D024806.jpg');

// 初始化
onMounted(() => {
  // 添加欢迎消息
  addMessage({
    id: generateId(),
    role: 'assistant',
    content: '您好！我是AI智能助手，有什么可以帮助您的吗？',
    timestamp: Date.now()
  });
});

// 生成唯一ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}小时前`;
  } else {
    return date.toLocaleDateString();
  }
}

// 格式化消息内容 (支持简单的markdown)
function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// 添加消息
function addMessage(message: CozeAIMessage) {
  messages.value.push(message);
  scrollToBottom();
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// 处理发送消息
async function handleSendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage: CozeAIMessage = {
    id: generateId(),
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: Date.now()
  };

  addMessage(userMessage);
  const messageContent = inputMessage.value.trim();
  inputMessage.value = '';
  isLoading.value = true;

  try {
    // 创建AI消息占位符
    const aiMessageId = generateId();
    const aiMessage: CozeAIMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    addMessage(aiMessage);
    streamingMessageId.value = aiMessageId;
    streamingContent.value = '';

    // 发送流式请求
    const response = await cozeAIAPI.sendStreamMessage({
      content: messageContent,
      conversationId: conversationId.value
    });

    if (!response.body) {
      throw new Error('无法获取响应流');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
    }

    // 解析完整的响应
    try {
      const responseData = JSON.parse(fullContent);
      if (responseData.success && responseData.content) {
        // 设置对话ID
        if (responseData.conversationId) {
          conversationId.value = responseData.conversationId;
        }
        
        // 更新AI消息内容
        const finalMessage = messages.value.find(m => m.id === aiMessageId);
        if (finalMessage) {
          finalMessage.content = responseData.content;
        }
        streamingMessageId.value = '';
        streamingContent.value = '';
      } else {
        throw new Error(responseData.errorMessage || '发送消息失败');
      }
    } catch (parseError) {
      throw new Error('解析响应失败');
    }

  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败，请重试');

    // 移除最后一条AI消息
    messages.value = messages.value.filter(m => m.id !== streamingMessageId.value);
    streamingMessageId.value = '';
    streamingContent.value = '';
  } finally {
    isLoading.value = false;
  }
}

// 清空对话
function clearChat() {
  messages.value = [];
  conversationId.value = '';
  streamingMessageId.value = '';
  streamingContent.value = '';

  // 重新添加欢迎消息
  addMessage({
    id: generateId(),
    role: 'assistant',
    content: '您好！我是AI智能助手，有什么可以帮助您的吗？',
    timestamp: Date.now()
  });
}
</script>

<style scoped lang="scss">
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .robot-icon {
      font-size: 24px;
    }

    .chat-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .header-right {
    .el-button {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeInUp 0.3s ease;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }

    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }

  &.assistant {
    .message-bubble {
      background: white;
      color: #303133;
      border: 1px solid #e4e7ed;
    }
  }
}

.message-avatar {
  margin: 0 12px;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  :deep(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
  }

  :deep(strong) {
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
  }
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding: 0 4px;
}

.streaming-content {
  .cursor {
    animation: blink 1s infinite;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #909399;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;

  :deep(.el-textarea__inner) {
    border-radius: 20px;
    border: 2px solid #e4e7ed;
    padding: 12px 16px;
    resize: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: #667eea;
    }
  }
}

.send-button {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-10px);
  }
}
</style>