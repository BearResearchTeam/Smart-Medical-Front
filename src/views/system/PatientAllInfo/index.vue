<template>
  <div class="app-container">
    <!-- Filter Form -->
    <el-form :model="query" inline class="filter-form">
      <el-form-item label="关键字">
        <el-input v-model="query.Keyword" placeholder="请输入患者姓名/联系方式/身份证号" clearable style="width: 250px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
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
      <el-table-column prop="age" label="年龄" width="80" align="center">
        <template #default="{ row }">
          {{ row.age }}{{ row.ageUnit }}
        </template>
      </el-table-column>
      <el-table-column prop="contactPhone" label="联系方式" width="120" align="center" />
      <el-table-column prop="idNumber" label="身份证号" width="180" align="center" />
      <el-table-column prop="visitType" label="治疗类型" width="100" align="center" />
      <el-table-column prop="visitStatus" label="就诊状态" width="100" align="center" />
      <el-table-column prop="visitDate" label="就诊日期" width="180" align="center" />
      <el-table-column prop="diseaseOnsetTime" label="发病时间" width="180" align="center" />
      <el-table-column prop="isİnfectiousDisease" label="传染病" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isİnfectiousDisease ? 'danger' : 'success'">{{ row.isİnfectiousDisease ? '是' : '否'
            }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination v-if="total > 0" v-model:current-page="query.PageIndex" v-model:page-size="query.PageSize"
      class="pagination" background layout="total, sizes, prev, pager, next, jumper" :total="total"
      @size-change="handleSearch" @current-change="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import UserAPI, { type GetAllPatientsQuery, type PatientInfoItem } from '@/api/system/Distribute.api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const list = ref<PatientInfoItem[]>([]);
const total = ref(0);

const query = reactive<GetAllPatientsQuery>({
  PageIndex: 1,
  PageSize: 10,
  Keyword: '',
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await UserAPI.getAllPatientInfos(query);
    // 注意：这里的 response 是经过 request.ts 拦截器处理后的 data.data
    // API 文档中的拼写错误(totleCount)也需要在这里对应
    if (response) {
      list.value = response.items;
      total.value = response.totleCount; // 使用后端返回的 totleCount
    }
  } catch (error) {
    console.error("获取患者信息列表失败:", error);
    ElMessage.error("获取患者信息列表失败");
  } finally {
    loading.value = false;
  }
}

const handleSearch = () => {
  query.PageIndex = 1;
  fetchData();
}

const handleReset = () => {
  query.Keyword = '';
  handleSearch();
}

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
