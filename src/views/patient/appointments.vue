<!-- 患者预约记录页面 -->
<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header mb-4">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">{{ patientName }}的预约记录</span>
        </template>
      </el-page-header>
    </div>

    <!-- 表格内容 -->
    <el-table
      v-loading="loading"
      :data="appointmentList"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="departmentName" label="科室名称" min-width="120" align="center" />

      <el-table-column prop="doctorName" label="医生姓名" width="120" align="center" />

      <el-table-column prop="visitType" label="就诊类型" width="100" align="center" />

      <el-table-column label="是否传染病" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isinfectiousDisease ? 'danger' : 'info'">
            {{ row.isinfectiousDisease ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="diseaseOnsettime" label="发病时间" width="120" align="center">
        <template #default="{ row }">
          {{ row.diseaseOnsettime?.substring(0, 10) }}
        </template>
      </el-table-column>

      <el-table-column prop="emergencyTime" label="紧急时间" width="120" align="center">
        <template #default="{ row }">
          {{ row.emergencyTime?.substring(0, 10) }}
        </template>
      </el-table-column>

      <el-table-column label="就诊状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="
              row.visitStatus === '已完成'
                ? 'success'
                : row.visitStatus === '待就诊'
                  ? 'warning'
                  : 'info'
            "
          >
            {{ row.visitStatus }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="visitDate" label="就诊日期" width="120" align="center">
        <template #default="{ row }">
          {{ row.visitDate?.substring(0, 10) }}
        </template>
      </el-table-column>

      <el-table-column prop="createdTime" label="创建时间" width="120" align="center">
        <template #default="{ row }">
          {{ row.createdTime?.substring(0, 10) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 刷新按钮 -->
    <div class="refresh-btn mt-4">
      <el-button :loading="loading" type="primary" @click="fetchAppointmentData">
        <el-icon>
          <Refresh />
        </el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Refresh } from "@element-plus/icons-vue";
import PatientAPI from "@/api/patient/patient.api";
import type { AppointmentInfo } from "@/api/patient/patient.api";

const route = useRoute();
const router = useRouter();

// 获取路由参数
const patientId = route.query.patientId as string;
const patientName = route.query.patientName as string;

// 定义响应式数据
const appointmentList = ref<AppointmentInfo[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 获取预约记录数据
const fetchAppointmentData = async () => {
  if (!patientId) {
    console.error("未提供患者ID");
    return;
  }

  loading.value = true;
  try {
    const params = {
      MaxResultCount: pageSize.value.toString(),
      SkipCount: ((currentPage.value - 1) * pageSize.value).toString(),
    };

    const response = await PatientAPI.getAppointments(patientId, params);
    console.log("获取到的预约记录:", response);

    if (response && typeof response === "object") {
      // 假设返回的数据结构是 { items: AppointmentInfo[], totalCount: number }
      appointmentList.value = Array.isArray(response.items) ? response.items : [];
      total.value = response.totalCount || 0;
    } else {
      appointmentList.value = Array.isArray(response) ? response : [];
      total.value = Array.isArray(response) ? response.length : 0;
    }
  } catch (error) {
    console.error("获取预约记录失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchAppointmentData();
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchAppointmentData();
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 在组件挂载后获取数据
onMounted(() => {
  // 从路由参数中获取初始分页设置
  const maxResults = parseInt(route.query.MaxResultCount as string) || 10;
  const skipCount = parseInt(route.query.SkipCount as string) || 0;

  pageSize.value = maxResults;
  currentPage.value = Math.floor(skipCount / maxResults) + 1;

  fetchAppointmentData();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.page-header {
  .page-title {
    font-size: 18px;
    font-weight: bold;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.refresh-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  th {
    font-weight: bold;
  }

  .el-table__header-wrapper {
    th {
      height: 45px;
      line-height: 45px;
    }
  }
}
</style>
