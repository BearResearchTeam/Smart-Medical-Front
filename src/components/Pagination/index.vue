<template>
  <!-- 使用 el-scrollbar 包裹分页组件，支持滚动条 -->
  <el-scrollbar>
    <!-- 分页组件 -->
    <div :class="{ hidden: hidden }" class="pagination">
      <!-- el-pagination 是 Element Plus 的分页组件 -->
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :background="background"
        :layout="layout" :page-sizes="pageSizes" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
/**
 * 定义组件的 props，用于接收父组件传递的参数
 */
const props = defineProps({
  // 总条目数
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
  // 可选的分页大小
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [5, 10, 15, 20]; // 默认分页大小选项
    },
  },
  // 分页组件的布局
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper", // 默认布局
  },
  // 是否显示背景色
  background: {
    type: Boolean,
    default: true,
  },
  // 是否自动滚动到顶部
  autoScroll: {
    type: Boolean,
    default: true,
  },
  // 是否隐藏分页组件
  hidden: {
    type: Boolean,
    default: false,
  },
});

/**
 * 定义组件的事件，用于向父组件传递分页信息
 */
const emit = defineEmits(["pagination"]);

/**
 * 定义当前页码，使用 defineModel 绑定到父组件的 v-model:page
 */
const currentPage = defineModel("page", {
  type: Number,
  required: true,
  default: 1, // 默认当前页为第 1 页
});

/**
 * 定义分页大小，使用 defineModel 绑定到父组件的 v-model:limit
 */
const pageSize = defineModel("limit", {
  type: Number,
  required: true,
  default: 10, // 默认每页显示 10 条数据
});

/**
 * 监听 total 的变化，当总条目数变化时，调整当前页码
 */
watch(
  () => props.total,
  (newVal: number) => {
    const lastPage = Math.ceil(newVal / pageSize.value); // 计算最后一页的页码
    if (newVal > 0 && currentPage.value > lastPage) {
      currentPage.value = lastPage; // 如果当前页码超过最后一页，调整到最后一页
      emit("pagination", { page: currentPage.value, limit: pageSize.value }); // 触发分页事件
    }
  }
);

/**
 * 处理分页大小变化事件
 * @param val 新的分页大小
 */
function handleSizeChange(val: number) {
  currentPage.value = 1; // 分页大小变化时，重置到第一页
  emit("pagination", { page: currentPage.value, limit: val }); // 触发分页事件
}

/**
 * 处理当前页码变化事件
 * @param val 新的页码
 */
function handleCurrentChange(val: number) {
  emit("pagination", { page: val, limit: pageSize.value }); // 触发分页事件
}
</script>

<style lang="scss" scoped>
.pagination {
  padding: 12px; // 分页组件的内边距

  &.hidden {
    display: none; // 如果 hidden 为 true，隐藏分页组件
  }
}
</style>