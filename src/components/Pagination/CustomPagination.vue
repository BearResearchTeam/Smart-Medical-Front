<template>
  <div class="custom-pagination">
    <el-pagination :current-page="currentPage" :page-sizes="[1, 3, 10, 50]" :page-size="pageSize" :total="totalCount"
      :background="true" layout="total, sizes, prev, pager, next, jumper, slot" @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
      <div class="pagination-info">
        共 {{ totalCount }} 条数据，{{ totalPage }} 页，当前 {{ currentPage }}/{{ totalPage }} 页
      </div>
      <div class="pagination-buttons">
        <el-button class="btn-first" :disabled="currentPage === 1" @click="goToFirstPage">
          首页
        </el-button>
        <el-button class="btn-last" :disabled="currentPage === totalPage" @click="goToLastPage">
          尾页
        </el-button>
      </div>
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
//定义需要传入的属性
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  totalPage: {
    type: Number,
    required: true
  }
});

//定义需要传递的事件
const emit = defineEmits(['size-change', 'current-change']);

const handleSizeChange = (size: number) => {
  emit('size-change', size);
};

const handleCurrentChange = (page: number) => {
  emit('current-change', page);
};

const goToFirstPage = () => {
  handleCurrentChange(1);
};

const goToLastPage = () => {
  handleCurrentChange(props.totalPage);
};
</script>

<style lang="scss" scoped>
.custom-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  .el-pagination {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .pagination-info {
      margin: 0 10px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }

    .pagination-buttons {
      display: flex;
      margin-left: 10px;

      .btn-first,
      .btn-last {
        margin: 0 5px;
        padding: 0 10px;
        height: 32px;
      }
    }
  }
}
</style>