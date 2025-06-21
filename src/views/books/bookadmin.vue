<template>
  <div class="app-container">
    <!-- 搜索组件 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 内容列表组件 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @export-click="handleExportClick"
      @operate-click="handleOperateClick"
    >
      <!-- 自定义类型列 -->
      <template #type="scope">
        <el-tag v-if="scope.row.type === BookType.Fiction" type="success">{{ getBookTypeName(scope.row.type) }}</el-tag>
        <el-tag v-else-if="scope.row.type === BookType.NonFiction" type="info">{{ getBookTypeName(scope.row.type) }}</el-tag>
        <el-tag v-else-if="scope.row.type === BookType.Science" type="warning">{{ getBookTypeName(scope.row.type) }}</el-tag>
        <el-tag v-else-if="scope.row.type === BookType.Biography" type="danger">{{ getBookTypeName(scope.row.type) }}</el-tag>
        <el-tag v-else-if="scope.row.type === BookType.History" type="primary">{{ getBookTypeName(scope.row.type) }}</el-tag>
        <el-tag v-else>{{ getBookTypeName(scope.row.type) }}</el-tag>
      </template>
      
      <!-- 自定义价格列 -->
      <template #price="scope">
        ¥ {{ scope.row.price.toFixed(2) }}
      </template>
    </page-content>

    <!-- 新增/编辑弹窗组件 -->
    <page-modal
      ref="bookModalRef"
      :modal-config="modalConfig"
      @submit-click="handleSubmitClick"
    >
      <!-- 图书类型选择 -->
      <template #type="scope">
        <el-select v-model="scope.formData[scope.prop]" placeholder="请选择图书类型">
          <el-option
            v-for="item in bookTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
      
      <!-- 出版日期选择 -->
      <template #publishDate="scope">
        <el-date-picker
          v-model="scope.formData[scope.prop]"
          type="date"
          placeholder="选择出版日期"
          value-format="YYYY-MM-DD"
        />
      </template>
    </page-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import usePage from "@/components/CURD/usePage";
import type { IOperateData } from "@/components/CURD/types";
import type { ISearchConfig, IContentConfig, IModalConfig } from "@/components/CURD/types";
import BookAPI, { BookType } from "@/api/system/book.api";

// 图书类型选项
const bookTypeOptions = [
  { label: '未定义', value: BookType.Undefined },
  { label: '小说', value: BookType.Fiction },
  { label: '非小说', value: BookType.NonFiction },
  { label: '科学', value: BookType.Science },
  { label: '传记', value: BookType.Biography },
  { label: '历史', value: BookType.History },
  { label: '技术', value: BookType.Technology }
];

// 获取图书类型名称
const getBookTypeName = (type: number) => {
  const option = bookTypeOptions.find(item => item.value === type);
  return option ? option.label : '未知';
};

// 使用通用页面钩子
const {
  searchRef,
  contentRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleSubmitClick,
  handleExportClick
} = usePage();

// 自定义引用
const bookModalRef = ref();

// 搜索配置
const searchConfig: ISearchConfig = {
  formItems: [
    {
      type: "input",
      label: "图书名称",
      prop: "name",
      attrs: {
        placeholder: "请输入图书名称",
        clearable: true,
        style: { width: "200px" },
      }
    },
    {
      type: "select",
      label: "图书类型",
      prop: "type",
      attrs: {
        placeholder: "请选择图书类型",
        clearable: true,
        style: { width: "200px" },
      },
      options: bookTypeOptions
    },
    {
      type: "date-picker",
      label: "出版日期",
      prop: "publishDate",
      attrs: {
        type: "daterange",
        "range-separator": "至",
        "start-placeholder": "开始日期",
        "end-placeholder": "结束日期",
        "value-format": "YYYY-MM-DD",
        style: { width: "260px" },
      }
    }
  ]
};

// 内容列表配置
const contentConfig: IContentConfig = {
  // API函数 - 获取列表数据
  indexAction: BookAPI.getPage,
  // 删除操作
  deleteAction: BookAPI.deleteByIds,
  // 导出操作
  exportAction: BookAPI.export,
  // 表格配置
  table: {
    border: true,
    highlightCurrentRow: true,
    rowKey: 'id'
  },
  // 分页配置
  pagination: {
    background: true,
    layout: "total, sizes, prev, pager, next, jumper",
    pageSize: 10,
    pageSizes: [10, 20, 50]
  },
  // 解析数据函数
  parseData(res) {
    return {
      total: res.total,
      list: res.list
    };
  },
  // 主键
  pk: "id",
  // 工具栏按钮
  toolbar: ["add", "delete", "export"],
  defaultToolbar: ["refresh", "filter", "search"],
  // 表格列配置
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "图书名称", align: "center", prop: "name" },
    { 
      label: "图书类型", 
      align: "center", 
      prop: "type", 
      templet: "custom",
      slotName: "type" 
    },
    { 
      label: "价格", 
      align: "center", 
      prop: "price", 
      templet: "custom",
      slotName: "price" 
    },
    { label: "出版日期", align: "center", prop: "publishDate" },
    { label: "创建时间", align: "center", prop: "createdTime" },
    { label: "更新时间", align: "center", prop: "updatedTime" },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 180,
      templet: "tool",
      operat: ["edit", "delete"]
    }
  ]
};

// 表单配置
const modalConfig: IModalConfig = {
  dialog: {
    title: "图书信息",
    width: 600
  },
  form: {
    labelWidth: 100
  },
  // 表单提交操作
  formAction: (data) => {
    // 根据是否有ID判断是新增还是编辑
    return data.id ? BookAPI.update(data) : BookAPI.create(data);
  },
  // 表单项
  formItems: [
    {
      label: "图书名称",
      prop: "name",
      type: "input",
      rules: [{ required: true, message: "请输入图书名称", trigger: "blur" }],
      attrs: {
        placeholder: "请输入图书名称",
        maxlength: 128
      }
    },
    {
      label: "图书类型",
      prop: "type",
      type: "custom",
      slotName: "type",
      rules: [{ required: true, message: "请选择图书类型", trigger: "change" }]
    },
    {
      label: "出版日期",
      prop: "publishDate",
      type: "custom",
      slotName: "publishDate",
      rules: [{ required: true, message: "请选择出版日期", trigger: "change" }]
    },
    {
      label: "价格",
      prop: "price",
      type: "input-number",
      rules: [{ required: true, message: "请输入价格", trigger: "blur" }],
      attrs: {
        placeholder: "请输入价格",
        min: 0,
        precision: 2,
        step: 0.1
      }
    }
  ]
};

// 处理表格操作
const handleOperateClick = (data: IOperateData) => {
  if (data.name === "edit") {
    handleEditClick(data.row, async (row) => {
      // 获取详细数据
      if (row && row.id) {
        const detail = await BookAPI.getDetail(row.id);
        return detail;
      }
      return data.row;
    }, bookModalRef);
  }
};

// 页面加载时的初始化操作
onMounted(() => {
  // 页面加载完成后自动加载数据
  contentRef.value?.fetchPageData();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  .search-container {
    margin-bottom: 20px;
  }
}
</style>