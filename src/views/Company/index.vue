<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="药品名称">
        <el-input v-model="queryParams.drugName" placeholder="请输入药品名称" clearable />
      </el-form-item>
      <el-form-item label="批号">
        <el-input v-model="queryParams.batchNumber" placeholder="请输入批号" clearable />
      </el-form-item>
      <el-form-item label="供应商">
        <el-input v-model="queryParams.supplier" placeholder="请输入供应商" clearable />
      </el-form-item>
      <el-form-item label="入库日期">
        <el-date-picker
          v-model="queryParams.inStockDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="pagedData" border style="width: 100%">
      <el-table-column prop="drugName" label="药品名称" min-width="120" />
      <el-table-column prop="specification" label="规格" min-width="100" />
      <el-table-column prop="batchNumber" label="批号" min-width="100" />
      <el-table-column prop="quantity" label="入库数量" min-width="80" />
      <el-table-column prop="unitPrice" label="单价" min-width="80" />
      <el-table-column prop="totalAmount" label="总金额" min-width="100" />
      <el-table-column prop="productionDate" label="生产日期" min-width="120" />
      <el-table-column prop="expiryDate" label="有效期" min-width="120" />
      <el-table-column prop="supplier" label="供应商" min-width="120" />
      <el-table-column prop="status" label="入库状态" min-width="80" />
      <el-table-column prop="creationTime" label="入库时间" min-width="120" />
      <el-table-column prop="companyName" label="制药公司" min-width="120" />
      <el-table-column prop="contactPerson" label="联系人" min-width="100" />
      <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
      <el-table-column prop="address" label="公司地址" min-width="180" />
      <el-table-column label="操作" fixed="right" align="left" width="120">
        <template #default="scope">
          <el-button
            type="primary"
            link
            size="small"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
          <!-- 可扩展编辑、删除等操作 -->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="filteredData.length > 0"
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="filteredData.length"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 50, 100]"
      class="pagination-container"
      @current-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />
  </div>
  <el-dialog
    v-model="detailDialogVisible"
    title="供应商详情"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="公司名称">{{ detailData.companyName }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ detailData.contactPerson }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ detailData.contactPhone }}</el-descriptions-item>
      <el-descriptions-item label="公司地址">{{ detailData.address }}</el-descriptions-item>
      <el-descriptions-item label="公司ID">{{ detailData.companyId }}</el-descriptions-item>
      <el-descriptions-item label="药品名称">{{ detailData.drugName }}</el-descriptions-item>
      <el-descriptions-item label="批号">{{ detailData.batchNumber }}</el-descriptions-item>
      <el-descriptions-item label="入库数量">{{ detailData.quantity }}</el-descriptions-item>
      <el-descriptions-item label="入库时间">{{ detailData.creationTime }}</el-descriptions-item>
      <!-- 可根据需要补充更多字段 -->
    </el-descriptions>
    <template #footer>
      <el-button @click="detailDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { getDrugInStockCompanyFullList } from "@/api/medical/appointment.api";

const queryParams = reactive({
  drugName: "",
  batchNumber: "",
  supplier: "",
  inStockDateRange: [],
});

const tableData = ref<any[]>([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
});

const filteredData = computed(() => {
  let data = tableData.value;
  if (queryParams.drugName) {
    data = data.filter((item) => item.drugName?.includes(queryParams.drugName));
  }
  if (queryParams.batchNumber) {
    data = data.filter((item) => item.batchNumber?.includes(queryParams.batchNumber));
  }
  if (queryParams.supplier) {
    data = data.filter((item) => item.supplier?.includes(queryParams.supplier));
  }
  if (queryParams.inStockDateRange?.length === 2) {
    const [start, end] = queryParams.inStockDateRange;
    data = data.filter((item) => {
      if (!item.creationTime) return false;
      return item.creationTime >= start && item.creationTime <= end;
    });
  }
  return data;
});

const pagedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredData.value.slice(start, end);
});

const detailDialogVisible = ref(false);
const detailData = ref<any>({});

function handleQuery() {
  pagination.currentPage = 1;
}

function handleReset() {
  queryParams.drugName = "";
  queryParams.batchNumber = "";
  queryParams.supplier = "";
  queryParams.inStockDateRange = [];
  handleQuery();
}

function handlePageChange(page: number) {
  pagination.currentPage = page;
}
function handlePageSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
}

function handleDetail(row: any) {
  detailData.value = row;
  detailDialogVisible.value = true;
}

onMounted(() => {
  getDrugInStockCompanyFullList().then((res) => {
    console.log("接口返回：", res);
    if (Array.isArray(res.data)) {
      tableData.value = res.data;
    } else if (Array.isArray(res)) {
      tableData.value = res;
    } else {
      tableData.value = [];
    }
  });
});
</script>

<style scoped>
.app-container {
  padding: 0 16px;
}
.search-form {
  margin-bottom: 16px;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style>
