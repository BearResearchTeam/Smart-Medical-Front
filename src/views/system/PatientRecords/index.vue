<template>
  <div class="app-container">
    <!-- Filter Form -->
    <el-form :model="query" inline class="filter-form">
      <el-form-item label="登记时间">
        <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <el-form-item label="患者">
        <el-input v-model="query.patientName" placeholder="请输入患者姓名" clearable />
      </el-form-item>
      <el-form-item label="科室">
        <el-input v-model="query.departmentName" placeholder="请输入科室" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAddNew">新增登记</el-button>
      </el-form-item>
    </el-form>

    <!-- Table -->
    <el-table v-loading="loading" :data="list" border>
      <el-table-column type="index" label="序号" width="60" align="center" fixed />
      <el-table-column prop="patientName" label="患者" width="100" align="center" fixed />
      <el-table-column prop="gender" label="性别" width="60" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="70" align="center">
        <template #default="{ row }">
          {{ row.age }}{{ row.ageUnit }}
        </template>
      </el-table-column>
      <el-table-column prop="contactPhone" label="联系方式" width="120" align="center" />
      <el-table-column prop="idNumber" label="身份证号" width="180" align="center" />
      <el-table-column prop="departmentName" label="科室" width="120" align="center" />
      <el-table-column prop="doctorName" label="医生" width="100" align="center" />
      <el-table-column prop="visitType" label="治疗类型" width="100" align="center" />
      <el-table-column prop="patientVisitStatus" label="就诊状态" width="100" align="center" />
      <el-table-column prop="isInfectiousDisease" label="传染病" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isInfectiousDisease ? 'danger' : 'success'">{{ row.isInfectiousDisease ? '是' : '否'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="diseaseOnsetTime" label="发病时间" width="180" align="center" />
      <el-table-column prop="patientVisitDate" label="就诊日期" width="180" align="center" />
      <el-table-column prop="remarks" label="备注信息" min-width="200" align="center" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination v-if="total > 0" v-model:current-page="query.skipCount" v-model:page-size="query.maxResultCount"
      class="pagination" background layout="total, sizes, prev, pager, next, jumper" :total="total"
      @size-change="handleSearch" @current-change="fetchData" />

    <!-- Add/Edit Patient Dialog -->
    <AddPatientCon v-model="dialogConfig.visible" :mode="dialogConfig.mode" :patient-data="dialogConfig.data"
      @submit-success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { Search, Refresh, Plus } from '@element-plus/icons-vue';
import UserAPI, { type RegistrationQuery, type RegistrationItem } from '@/api/system/Distribute.api';
import { ElMessage } from 'element-plus';
import AddPatientCon from '../patient/AddPatientCon.vue';

const loading = ref(false);
const list = ref<RegistrationItem[]>([]);
const total = ref(0);
const dateRange = ref<[string, string] | []>([]);

// Dialog visibility state
const dialogConfig = reactive({
  visible: false,
  mode: 'add' as 'add' | 'view',
  data: null as RegistrationItem | null,
});

const query = reactive<RegistrationQuery>({
  maxResultCount: 1,
  skipCount: 10,
  patientName: '',
  departmentName: '',
  status: '',
  startTime: '',
  endTime: '',
});

watch(dateRange, (newVal) => {
  query.startTime = newVal?.[0] ?? '';
  query.endTime = newVal?.[1] ?? '';
});

const fetchData = async () => {
  loading.value = true;
  try {
    const apiQuery = {
      ...query,
      skipCount: (query.skipCount - 1) * query.maxResultCount,
    };
    const response = await UserAPI.getRegistrations(apiQuery);
    if (response) {
      list.value = response.items;
      total.value = response.totalCount;
    }
  } catch (error) {
    console.error("获取登记列表失败:", error);
    ElMessage.error("获取登记列表失败");
  } finally {
    loading.value = false;
  }
}

const handleSearch = () => {
  query.skipCount = 1;
  fetchData();
}

const handleReset = () => {
  dateRange.value = [];
  query.patientName = '';
  query.departmentName = '';
  query.status = '';
  handleSearch();
}

const handleAddNew = () => {
  dialogConfig.mode = 'add';
  dialogConfig.data = null;
  dialogConfig.visible = true;
};

const handleView = (row: RegistrationItem) => {
  dialogConfig.mode = 'view';
  dialogConfig.data = row;
  dialogConfig.visible = true;
};

const handleSuccess = () => {
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
  background-color: #fff;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
