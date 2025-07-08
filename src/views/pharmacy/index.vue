<template>
  <div class="app-container">
    <div style="margin-bottom: 16px">
      <el-button @click="switchTheme('blue')">蓝色主题</el-button>
      <el-button @click="switchTheme('green')">绿色主题</el-button>
    </div>
    <!-- 查询区域 1-->
    <div class="search-container horizontal-search">
      <ElForm :model="queryParams" :inline="true" class="search-form">
        <ElFormItem label="公司名称" prop="companyName">
          <ElInput v-model="queryParams.companyName" placeholder="公司名称" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" icon="Search" @click="handleQuery">搜索</ElButton>
          <ElButton icon="Refresh" @click="handleResetQuery">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </div>
    <ElCard shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <ElButton type="success" icon="Plus" @click="handleOpenDialog()">新增</ElButton>
        </div>
      </div>
      <ElTable
        v-loading="loading"
        :data="companyList"
        border
        stripe
        highlight-current-row
        size="small"
        class="custom-table-advanced"
        style="max-height: 400px; overflow-y: auto"
        @sort-change="handleQuery"
      >
        <ElTableColumn type="index" label="#" width="60" align="center" />
        <ElTableColumn label="公司信息">
          <ElTableColumn prop="companyName" min-width="160">
            <template #header>
              <el-icon><OfficeBuilding /></el-icon>
              公司名称
            </template>
          </ElTableColumn>
          <ElTableColumn prop="address" min-width="180">
            <template #header>
              <el-icon><Location /></el-icon>
              地址
            </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="联系人信息">
          <ElTableColumn prop="contactPerson" min-width="100">
            <template #header>
              <el-icon><User /></el-icon>
              联系人
            </template>
          </ElTableColumn>
          <ElTableColumn prop="contactPhone" min-width="120">
            <template #header>
              <el-icon><Phone /></el-icon>
              联系电话
            </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="操作" fixed="right" align="center" width="140">
          <template #default="scope">
            <ElButton-group>
              <ElButton
                type="primary"
                link
                size="small"
                icon="Edit"
                style="color: var(--my-primary)"
                @click.stop="handleOpenDialog(scope.row)"
              >
                编辑
              </ElButton>
              <ElButton
                type="danger"
                link
                size="small"
                icon="Delete"
                style="color: #d32f2f"
                @click.stop="handleDelete(scope.row.id)"
              >
                删除
              </ElButton>
            </ElButton-group>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination
        v-if="total > 0"
        v-model:total="total"
        v-model:current-page="queryParams.pageIndex"
        v-model:page-size="queryParams.pageSize"
        class="pagination-container"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 7, 9, 11, 13]"
        @current-change="handleQuery"
        @size-change="handleSizeChange"
      />
    </ElCard>
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @closed="handleCloseDialog"
    >
      <ElForm ref="companyFormRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="公司名称" prop="companyName" required>
          <ElInput v-model="formData.companyName" />
        </ElFormItem>
        <ElFormItem label="联系人" prop="contactPerson">
          <ElInput v-model="formData.contactPerson" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="contactPhone">
          <ElInput v-model="formData.contactPhone" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="formData.address" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
          <ElButton @click="handleCloseDialog">取 消</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { getAllPharmaceuticalCompanies } from "@/api/pharmacy.api";
import { OfficeBuilding, Location, User, Phone } from "@element-plus/icons-vue";
import {
  createPharmaceuticalCompany,
  updatePharmaceuticalCompany,
  deletePharmaceuticalCompany,
} from "@/api/pharmacy.api";
import { ElMessage } from "element-plus";
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增公司");
const companyList = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  companyName: "",
  pageIndex: 1,
  pageSize: 10,
});
const formData = reactive({
  id: "",
  companyName: "",
  contactPerson: "",
  contactPhone: "",
  address: "",
});
const rules = {
  companyName: [{ required: true, message: "请输入公司名称", trigger: "blur" }],
  contactPerson: [{ required: true, message: "请输入联系人", trigger: "blur" }],
  contactPhone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
    // 如需支持座机，可用更宽松的正则
    // { pattern: /^(1[3-9]\\d{9}|0\\d{2,3}-?\\d{7,8})$/, message: "请输入正确的电话", trigger: "blur" }
  ],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
};

const themes = {
  blue: {
    "--my-primary": "#1976d2",
    "--my-gradient": "linear-gradient(90deg, #e0f7fa 0%, #b2ebf2 100%)",
    "--my-header-bg": "#e3f2fd",
  },
  green: {
    "--my-primary": "#388e3c",
    "--my-gradient": "linear-gradient(90deg, #e8f5e9 0%, #a5d6a7 100%)",
    "--my-header-bg": "#e8f5e9",
  },
};
function switchTheme(themeName: "blue" | "green") {
  const theme = themes[themeName];
  Object.keys(theme).forEach((key) => {
    document.documentElement.style.setProperty(key, (theme as Record<string, string>)[key]);
  });
}

function handleQuery() {
  loading.value = true;
  formData.companyName = queryParams.companyName;
  queryParams.pageIndex = 1; // 每次查询都重置为第一页
  getAllPharmaceuticalCompanies({ companyName: queryParams.companyName })
    .then((res: any) => {
      companyList.value = Array.isArray(res) ? res : [];
      total.value = companyList.value.length;
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSizeChange(newSize: any) {
  queryParams.pageSize = newSize;
  queryParams.pageIndex = 1; // 通常切换容量后回到第一页
  handleQuery();
}

function handleResetQuery() {
  queryParams.companyName = "";
  handleQuery();
}

///弹框
function handleOpenDialog(row?: any) {
  if (row) {
    dialogTitle.value = "编辑公司";
    Object.assign(formData, row);
  } else {
    dialogTitle.value = "新增公司";
    Object.assign(formData, {
      id: "",
      companyName: "",
      contactPerson: "",
      contactPhone: "",
      address: "",
    });
  }
  dialogVisible.value = true;
}
//重置
function handleCloseDialog() {
  dialogVisible.value = false;
}
async function handleSubmit() {
  // 表单校验
  const isEdit = !!formData.id;
  if (isEdit) {
    // 编辑：需要传 id 和 data
    updatePharmaceuticalCompany(formData.id, formData)
      .then(() => {
        ElMessage.success("编辑成功");
        dialogVisible.value = false;
        handleQuery();
      })
      .catch(() => {
        ElMessage.error("编辑失败");
      });
  } else {
    // 新增：只传 data
    createPharmaceuticalCompany(formData)
      .then(() => {
        ElMessage.success("新增成功");
        dialogVisible.value = false;
        handleQuery();
      })
      .catch(() => {
        ElMessage.error("新增失败");
      });
  }
}

function handleDelete(id: string) {
  deletePharmaceuticalCompany(id)
    .then(() => {
      ElMessage.success("删除成功");
      handleQuery();
    })
    .catch(() => {
      ElMessage.error("删除失败");
    });
}

onMounted(() => {
  switchTheme("blue");
  handleQuery();
});
</script>

<style>
.custom-table-advanced {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px 0 rgba(0, 128, 255, 0.08);
  background: #fff;
}
.custom-table-advanced .el-table__header th {
  font-weight: bold;
  background: var(--my-gradient);
  color: var(--my-primary);
  border-bottom: 2px solid var(--my-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}
.custom-table-advanced .el-table__row {
  transition: background 0.2s;
}
.custom-table-advanced .el-table__row:hover {
  background: var(--my-header-bg) !important;
}
.custom-table-advanced .el-table__body td {
  border-bottom: 1px solid #e0e0e0;
}
.custom-table-advanced .el-table__cell {
  border-radius: 6px;
}
</style>
