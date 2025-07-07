<!-- 患者管理页面 -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-box mb-4">
      <el-input
        v-model="searchKeywords"
        placeholder="请输入患者姓名/手机号/身份证号"
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 表格内容 -->
    <el-table
      v-loading="loading"
      :data="filteredPatientList"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="patientName" label="患者姓名" min-width="100" align="center" />

      <el-table-column prop="gender" label="性别" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.gender === 1 ? 'primary' : 'success'">
            {{ row.gender === 1 ? "男" : "女" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="年龄" width="80" align="center">
        <template #default="{ row }">{{ row.age }}{{ row.ageUnit }}</template>
      </el-table-column>

      <el-table-column prop="contactPhone" label="联系电话" width="120" align="center" />

      <el-table-column
        prop="idNumber"
        label="身份证号"
        width="180"
        align="center"
        show-overflow-tooltip
      />

      <el-table-column prop="visitType" label="就诊类型" width="100" align="center" />

      <el-table-column label="是否传染病" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isinfectiousDisease ? 'danger' : 'info'">
            {{ row.isinfectiousDisease ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="diseaseOnsettime"
        label="发病时间"
        width="120"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ row.diseaseOnsettime?.substring(0, 10) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="emergencyTime"
        label="紧急时间"
        width="120"
        align="center"
        show-overflow-tooltip
      >
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

      <el-table-column
        prop="visitDate"
        label="就诊日期"
        width="120"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ row.visitDate?.substring(0, 10) }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleViewAppointments(row)">预约记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 刷新按钮 -->
    <div class="refresh-btn mt-4">
      <el-button :loading="loading" type="primary" @click="fetchPatientData">
        <el-icon>
          <Refresh />
        </el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";
import PatientAPI from "@/api/patient/patient.api";
import type { UserAssociatedPatientRecord } from "@/api/patient/patient.api";
import { useRouter } from "vue-router";

// 定义响应式数据
const patientList = ref<UserAssociatedPatientRecord[]>([]);
const loading = ref(false);
const searchKeywords = ref("");

// 根据搜索关键词过滤患者列表
const filteredPatientList = computed(() => {
  if (!searchKeywords.value) {
    return patientList.value;
  }
  const keyword = searchKeywords.value.toLowerCase();
  return patientList.value.filter(
    (patient) =>
      patient.patientName?.toLowerCase().includes(keyword) ||
      patient.contactPhone?.includes(keyword) ||
      patient.idNumber?.toLowerCase().includes(keyword)
  );
});

// 获取患者数据
const fetchPatientData = async () => {
  loading.value = true;
  try {
    const response = await PatientAPI.getAssociatedPatients();
    console.log("获取到的患者数据:", response);
    patientList.value = response;
  } catch (error) {
    console.error("获取关联患者信息失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性 filteredPatientList 实现
  console.log("搜索关键词:", searchKeywords.value);
};

// 在组件挂载后获取数据
onMounted(() => {
  fetchPatientData();
});

const router = useRouter();

// 查看预约记录
const handleViewAppointments = (row: UserAssociatedPatientRecord) => {
  router.push({
    path: "/patient/appointments",
    query: {
      patientId: row.patientId,
      patientName: row.patientName,
      MaxResultCount: "10",
      SkipCount: "0",
    },
  });
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-box {
  .search-input {
    width: 300px;
  }
}

.refresh-btn {
  display: flex;
  justify-content: flex-end;
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
