<template>
  <div class="tabs-container">
    <el-tabs v-model="query" @tab-change="fetchHospitalizedList">
      <el-tab-pane label="已登记" name="Registered"></el-tab-pane>
      <el-tab-pane label="正在住院中" name="InHospital"></el-tab-pane>
      <el-tab-pane label="已出院" name="Discharged"></el-tab-pane>
      <el-tab-pane label="已结算" name="Settled"></el-tab-pane>
      <el-tab-pane label="转院中" name="Transferring"></el-tab-pane>
      <el-tab-pane label="自动出院" name="AutoDischarged"></el-tab-pane>
      <el-tab-pane label="死亡" name="Deceased"></el-tab-pane>
    </el-tabs>
    <el-button type="primary" :icon="Plus" @click="openAdmissionDialog">办理入院</el-button>
  </div>

  <!-- Dialog for Admission -->
  <el-dialog v-model="dialogVisible" title="办理入院" width="500px">
    <el-form>
      <el-form-item label="选择患者">
        <el-select v-model="selectedPatientId" placeholder="请搜索并选择患者" filterable remote
          :remote-method="fetchAllPatients" :loading="dialogLoading" style="width: 100%;">
          <el-option v-for="patient in allPatients" :key="patient.id" :label="patient.patientName"
            :value="patient.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleAdmissionSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <div class="bed-card-container">
    <div v-for="item in hospitalizedList" :key="item.id" class="bed-card">
      <div class="bed-header">
        <div class="header-left">
          <span class="header-icon">🛏️</span>
          <span class="bed-no">{{ item.inpatientNumber || 'N/A' }}</span>
        </div>
        <el-dropdown v-if="getAvailableActions(item.status).length > 0"
          @command="(command) => handleStatusChange(item.id, command)">
          <span class="el-dropdown-link">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="action in getAvailableActions(item.status)" :key="action.value"
                :command="action.value">
                {{ action.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="bed-body">
        <div class="info-row">
          <span class="icon-box patient-name-icon">
            <el-icon>
              <Avatar />
            </el-icon>
          </span>
          <span class="text patient-name">{{ item.patientName }}</span>
        </div>
        <div class="info-row">
          <span class="icon-box">
            <el-icon>
              <OfficeBuilding />
            </el-icon>
          </span>
          <span class="text">{{ item.dischargeDepartment || '未知科室' }}</span>
        </div>
        <div class="info-row plain-text">
          诊断: {{ item.admissionDiagnosis || '无' }}
        </div>
        <div class="info-row plain-text">
          状态: {{ statusMap[item.status] || item.status || '未知' }}
        </div>
      </div>
    </div>
    <el-empty v-if="!loading && hospitalizedList.length === 0" description="暂无住院患者信息" />
  </div>
  <div v-if="loading" class="loading-skeleton">
    <el-skeleton v-for="i in 4" :key="i" :rows="4" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Avatar, OfficeBuilding, Plus, MoreFilled } from '@element-plus/icons-vue';
import UserAPI, { type HospitalizedPatient, type AllPatient } from '@/api/system/Distribute.api';
import { ElMessage, ElMessageBox } from 'element-plus';

const hospitalizedList = ref<HospitalizedPatient[]>([]);
const loading = ref(false);
const query = ref('InHospital');

const statusMap: { [key: string]: string } = {
  Registered: '已登记',
  InHospital: '正在住院中',
  Discharged: '已出院',
  Settled: '已结算',
  Transferring: '转院中',
  AutoDischarged: '自动出院',
  Deceased: '死亡',
};

// Dialog state
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isSubmitting = ref(false);
const allPatients = ref<AllPatient[]>([]);
const selectedPatientId = ref<string>(''); // Type 'null' is not assignable to el-select v-model

const fetchHospitalizedList = async () => {
  loading.value = true;
  try {
    const response = await UserAPI.getHospitalized(query.value);
    if (response && Array.isArray(response)) {
      hospitalizedList.value = response;
    } else {
      hospitalizedList.value = [];
    }
  } catch (error) {
    console.error("获取住院患者列表失败:", error);
    hospitalizedList.value = [];
  } finally {
    loading.value = false;
  }
};

const openAdmissionDialog = () => {
  selectedPatientId.value = ''; // Reset to empty string
  allPatients.value = [];
  fetchAllPatients(); // Pre-load patients
  dialogVisible.value = true;
};

const fetchAllPatients = async (queryString: string = '') => {
  dialogLoading.value = true;
  try {
    const response = await UserAPI.GetAllPatient();
    if (response && Array.isArray(response)) {
      // Simple frontend filtering, can be adapted if API supports search
      allPatients.value = response.filter(p => p.patientName.toLowerCase().includes(queryString.toLowerCase()));
    }
  } catch (error) {
    console.error("获取患者列表失败:", error);
    ElMessage.error("获取患者列表失败");
  } finally {
    dialogLoading.value = false;
  }
};

const getAvailableActions = (currentStatus: string) => {
  const actions = [];
  const terminalActions = [
    { label: '转院', value: 'Transferring' },
    { label: '自动出院', value: 'AutoDischarged' },
    { label: '死亡', value: 'Deceased' },
  ];

  switch (currentStatus) {
    case 'Registered':
      actions.push({ label: '办理住院', value: 'InHospital' });
      actions.push(...terminalActions);
      break;
    case 'InHospital':
      actions.push({ label: '办理出院', value: 'Discharged' });
      actions.push(...terminalActions);
      break;
    case 'Discharged':
      actions.push({ label: '结算', value: 'Settled' });
      actions.push(...terminalActions);
      break;
    case 'Settled':
      actions.push(...terminalActions);
      break;
  }
  return actions;
};


const handleStatusChange = async (patientId: string, newStatus: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要将状态更改为 "${statusMap[newStatus]}" 吗?`,
      '状态变更确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await UserAPI.updateHospitalizedStatus(patientId, newStatus);
    ElMessage.success('状态更新成功！');
    fetchHospitalizedList(); // Refresh list
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态更新失败:', error);
      ElMessage.error('状态更新失败');
    }
  }
};

const handleAdmissionSubmit = async () => {
  if (!selectedPatientId.value) {
    ElMessage.warning("请选择一个患者");
    return;
  }
  isSubmitting.value = true;
  try {
    await UserAPI.CreateAsync(selectedPatientId.value);
    ElMessage.success("办理入院成功！");
    dialogVisible.value = false;
    fetchHospitalizedList(); // Refresh the main list
  } catch (error) {
    console.error("办理入院失败:", error);
    ElMessage.error("办理入院失败");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchHospitalizedList();
});
</script>

<style scoped lang="scss">
.tabs-container {
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.bed-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 20px;
}

.bed-card {
  width: 220px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: 'Microsoft YaHei', sans-serif;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
}

.bed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #e0f7fa;
  color: #006064;
  font-weight: bold;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-icon {
    font-size: 18px;
    margin-right: 8px;
  }

  .bed-no {
    font-size: 16px;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    font-size: 20px;
  }
}

.bed-body {
  padding: 12px;
  color: #555;

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .icon-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: white;
      border-radius: 4px;
      margin-right: 8px;
      font-size: 16px;
      background-color: #78909c;
    }

    .patient-name-icon {
      background-color: #2196F3;
    }

    .patient-name {
      font-weight: 500;
    }

    .text {
      color: #333;
    }
  }

  .plain-text {
    padding-left: 32px;
    color: #333;
  }
}

.loading-skeleton {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}
</style>
