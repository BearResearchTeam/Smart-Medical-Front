<!-- 患者预约记录页面 -->
<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="flex justify-between mb-2">
        <h3 class="text-lg font-semibold">
          {{ patientName ? `${patientName} 的预约记录` : "预约记录" }}
        </h3>
        <el-button @click="goBack">
          <i-ep-arrow-left />
          返回
        </el-button>
      </div>

      <el-table v-loading="loading" :data="appointmentList" border>
        <el-table-column prop="patientName" label="患者名称" align="center" />
        <el-table-column prop="appointmentDateTime" label="预约时间" align="center" />
        <el-table-column prop="isInfectiousDisease" label="是否传染病" align="center">
          <template #default="scope">
            <span>{{ scope.row.isInfectiousDisease ? "否" : "是" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="idNumber" label="身份证号" align="center" />
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PatientAPI, AppointmentInfo } from "@/api/patient/patient.api";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();

const patientId = ref<string | null>(route.query.patientId as string);
const patientName = ref<string | null>(route.query.patientName as string);

const appointmentList = ref<AppointmentInfo[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const fetchAppointmentData = async () => {
  if (!patientId.value) {
    ElMessage.error("未找到患者ID");
    return;
  }

  loading.value = true;
  try {
    const params = {
      MaxResultCount: pageSize.value.toString(),
      SkipCount: ((currentPage.value - 1) * pageSize.value).toString(),
    };
    const response = await PatientAPI.getAppointments(patientId.value, params);

    console.log(response);

    if (response && Array.isArray(response.data)) {
      appointmentList.value = response.data;
      total.value = response.totleCount;
    } else {
      appointmentList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取预约记录失败:", error);
    ElMessage.error("获取预约记录失败");
    appointmentList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchAppointmentData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchAppointmentData();
};

const goBack = () => {
  router.back();
};

onMounted(() => {
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
