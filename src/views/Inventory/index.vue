<template>
  <div class="app-container">
    <!-- 查询区 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="药品名称">
        <el-input v-model="queryParams.drugName" placeholder="请输入药品名称" />
      </el-form-item>
      <el-form-item label="药品分类">
        <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
          <el-option label="中药" :value="1" />
          <el-option label="西药" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="药品类型">
        <el-input v-model="queryParams.drugType" placeholder="请输入药品类型" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleResetQuery">重置</el-button>
        <a :href="exportUrl" target="_blank" style="margin-left: 8px">
          <el-button icon="el-icon-download">导出</el-button>
        </a>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      :data="tableData.pageData"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="drugName" label="药品名称" width="120" />
      <el-table-column prop="category" label="药品分类" width="100">
        <template #default="scope">
          {{ scope.row.category === 1 ? "中药" : "西药" }}
        </template>
      </el-table-column>
      <el-table-column prop="drugType" label="药品类型" width="100" />
      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column prop="pharmaceuticalCompanyName" label="生产厂家" width="150" />
      <el-table-column prop="salePrice" label="售价(元)" width="90" />
      <el-table-column label="售价合计(元)" width="110">
        <template #default="scope">
          {{ (scope.row.salePrice * scope.row.stock).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="成本合计(元)" width="110">
        <template #default="scope">
          {{ (scope.row.purchasePrice * scope.row.stock).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="剩余数量" width="90" />
      <el-table-column prop="dosageForm" label="单位" width="80" />
      <el-table-column label="操作" fixed="right" align="left" width="160">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="tableData.totalCount > 0"
      v-model:current-page="queryParams.pageIndex"
      v-model:page-size="queryParams.pageSize"
      :total="tableData.totalCount"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; text-align: right"
      @current-change="handleQuery"
      @size-change="handleQuery"
    />
  </div>

  
</template>

<script setup lang="ts">
import {  reactive, onMounted } from "vue";
import DrugAPI from "@/api/drug.api";
import PharmaceuticalCompanyAPI from "@/api/pharmaceutical-company.api";

const queryParams = reactive({
  drugName: "",
  drugType: "",
  category: undefined,
  pharmaceuticalCompanyId: "",

  pageIndex: 1,
  pageSize: 20,
});

const tableData = reactive({
  pageData: [],
  totalCount: 0,
});
const exportUrl = "https://localhost:44394/api/app/drug/export-drug-excel";

function handleQuery() {
  // 调用DrugAPI.getDrugList，赋值tableData
  const params = {
    ...queryParams,
  };
  DrugAPI.getDrugList(params).then((res) => {
    tableData.pageData = res.data || [];
    tableData.totalCount = res.totleCount || 0;
  });
}
function handleResetQuery() {
  queryParams.drugName = "";
  queryParams.drugType = "";
  queryParams.category = undefined;
  queryParams.pharmaceuticalCompanyId = "";

  queryParams.pageIndex = 1;
  queryParams.pageSize = 20;
  handleQuery();
}

function getSummaries(param: any) {
  const { columns, data } = param;
  const sums: any = [];
  columns.forEach((column: any, index: any) => {
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    if (column.property === "salePrice") {
      sums[index] = data.reduce((sum: any, row: any) => sum + (row.salePrice || 0), 0).toFixed(2);
    } else if (column.label === "售价合计(元)") {
      sums[index] = data
        .reduce((sum: any, row: any) => sum + (row.salePrice * row.stock || 0), 0)
        .toFixed(2);
    } else if (column.label === "成本合计(元)") {
      sums[index] = data
        .reduce((sum: any, row: any) => sum + (row.purchasePrice * row.stock || 0), 0)
        .toFixed(2);
    } else if (column.property === "stock") {
      sums[index] = data.reduce((sum: any, row: any) => sum + (row.stock || 0), 0);
    } else {
      sums[index] = "";
    }
  });
  return sums;
}

function handleDetail(row: any) {
  // 例如弹窗显示详情
  // detailDialogVisible.value = true;
  // detailData.value = row;
  // 或跳转详情页
  // router.push({ name: 'DrugDetail', params: { id: row.id } });
  console.log("查看详情", row);
}

onMounted(() => {
  // 获取厂家下拉

  handleQuery();
});
</script>
<style>
.medicine-page {
  background: #f7f9fa;
  min-height: 100vh;
  padding: 0;
  width: 100vw;
  box-sizing: border-box;
  margin: 0;
}
.search-bar {
  background: #fff;
  padding: 18px 24px 8px 24px;
  border-radius: 0;
  margin-bottom: 0;
  box-shadow: none;
  width: 100%;
  box-sizing: border-box;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}
.el-form-item {
  margin-right: 18px;
  margin-bottom: 10px;
}
.el-table {
  background: #fff !important;
  width: 100% !important;
  min-width: 100% !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}
.pagination-bar {
  background: #fff;
  margin-top: 0;
  padding: 12px 0 0 0;
  border-radius: 0;
  text-align: right;
  width: 100%;
  box-sizing: border-box;
}
/* 适配el-main等外部容器 */
:deep(.el-main) {
  padding: 0 !important;
}
</style>
