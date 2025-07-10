<template>
  <div class="main-layout">
    <div class="today-visit-container">
      <div class="search-section">
        <el-input v-model="searchQuery" placeholder="请输入患者姓名/联系方式/身份证号" class="search-input" clearable
          @keyup.enter="handleSearch">
          <template #append>
            <el-button :icon="Search" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="tabs-section">
        <el-tabs v-model="activeTab" class="visit-tabs" @tab-change="handleTabChange">
          <el-tab-pane name="pending">
            <template #label>
              <span class="tab-label">未发药 <el-tag v-if="tabCounts.pending > 0" type="danger" size="small">{{
                tabCounts.pending }}</el-tag></span>
            </template>
            <div class="list-wrapper">
              <template v-if="currentPatientList.length > 0">
                <div v-for="(patient, index) in currentPatientList" :key="patient.id" class="patient-list-item"
                  :class="{ 'is-selected': selectedPatientId === patient.id }" @click="handlePatientClick(patient.id)">
                  <div class="patient-info">
                    <span class="index">{{ (pagination.currentPage - 1) * pagination.pageSize + index + 1 }}.</span>
                    <span class="name">{{ patient.patientName }}</span>
                    <span class="gender">{{ formatGender(patient.gender) }}</span>
                    <span class="age">{{ patient.age }}岁</span>
                  </div>
                  <div class="visit-time">
                    <span>{{ formatDateTime(patient.visitDate) }}</span>
                    <el-icon class="arrow-icon">
                      <ArrowRight />
                    </el-icon>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无待发药患者" />
            </div>
            <div class="pagination-section">
              <el-pagination v-if="tabCounts.pending > 0" background layout="prev, pager, next"
                :total="tabCounts.pending" :page-size="pagination.pageSize" :current-page="pagination.currentPage"
                @current-change="handlePageChange" />
            </div>
          </el-tab-pane>

          <el-tab-pane name="completed">
            <template #label>
              <span class="tab-label">已发药 <el-tag v-if="tabCounts.completed > 0" type="info" size="small">{{
                tabCounts.completed }}</el-tag></span>
            </template>
            <div class="list-wrapper">
              <template v-if="currentPatientList.length > 0">
                <div v-for="(patient, index) in currentPatientList" :key="patient.id" class="patient-list-item"
                  :class="{ 'is-selected': selectedPatientId === patient.id }" @click="handlePatientClick(patient.id)">
                  <div class="patient-info">
                    <span class="index">{{ (pagination.currentPage - 1) * pagination.pageSize + index + 1 }}.</span>
                    <span class="name">{{ patient.patientName }}</span>
                    <span class="gender">{{ formatGender(patient.gender) }}</span>
                    <span class="age">{{ patient.age }}岁</span>
                  </div>
                  <div class="visit-time">
                    <span>{{ formatDateTime(patient.visitDate) }}</span>
                    <el-icon class="arrow-icon">
                      <ArrowRight />
                    </el-icon>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无已发药患者" />
            </div>
            <div class="pagination-section">
              <el-pagination v-if="tabCounts.completed > 0" background layout="prev, pager, next"
                :total="tabCounts.completed" :page-size="pagination.pageSize" :current-page="pagination.currentPage"
                @current-change="handlePageChange" />
            </div>
          </el-tab-pane>

          <el-tab-pane name="returned">
            <template #label>
              <span class="tab-label">已退药 <el-tag v-if="tabCounts.returned > 0" type="info" size="small">{{
                tabCounts.returned }}</el-tag></span>
            </template>
            <div class="list-wrapper">
              <template v-if="currentPatientList.length > 0">
                <div v-for="(patient, index) in currentPatientList" :key="patient.id" class="patient-list-item"
                  :class="{ 'is-selected': selectedPatientId === patient.id }" @click="handlePatientClick(patient.id)">
                  <div class="patient-info">
                    <span class="index">{{ (pagination.currentPage - 1) * pagination.pageSize + index + 1 }}.</span>
                    <span class="name">{{ patient.patientName }}</span>
                    <span class="gender">{{ formatGender(patient.gender) }}</span>
                    <span class="age">{{ patient.age }}岁</span>
                  </div>
                  <div class="visit-time">
                    <span>{{ formatDateTime(patient.visitDate) }}</span>
                    <el-icon class="arrow-icon">
                      <ArrowRight />
                    </el-icon>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无已退药患者" />
            </div>
            <div class="pagination-section">
              <el-pagination v-if="tabCounts.returned > 0" background layout="prev, pager, next"
                :total="tabCounts.returned" :page-size="pagination.pageSize" :current-page="pagination.currentPage"
                @current-change="handlePageChange" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="right-panel">
      <el-card v-if="selectedPatientId" class="base-info-card">
        <template #header>
          <div class="base-info-title">患者基础信息</div>
        </template>
        <el-row :gutter="20" class="base-info-row">
          <el-col :span="12"><span class="label">姓名:</span> {{ formData.patientName }}</el-col>
          <el-col :span="12"><span class="label">性别:</span> {{ formatGender(formData.gender as unknown as number)
          }}</el-col>
          <el-col :span="12"><span class="label">年龄:</span> {{ formData.age }}</el-col>
          <el-col :span="12"><span class="label">联系方式:</span> {{ formData.contactPhone }}</el-col>
          <el-col :span="24"><span class="label">身份证号:</span> {{ formData.idNumber }}</el-col>
          <el-col :span="24"><span class="label">就诊类型:</span> {{ formData.visitType }}</el-col>
          <el-col :span="24"><span class="label">传染病史:</span> {{ formData.isInfectiousDisease ? '有' : '无' }}</el-col>
          <el-col :span="24"><span class="label">发病时间:</span> {{ formData.diseaseOnsetTime }}</el-col>
        </el-row>
      </el-card>

      <el-card
        v-if="selectedPatientId && drugIteminfo && (Array.isArray(drugIteminfo) ? drugIteminfo.length > 0 : true)"
        class="prescription-info-card">
        <template #header>
          <div class="card-header">
            <span>处方信息</span>
          </div>
        </template>
        <div class="prescription-content">
          <div class="drug-list">
            <h4>药品清单:</h4>
            <el-empty v-if="!drugIteminfo || (Array.isArray(drugIteminfo) && drugIteminfo.length === 0)"
              description="此张处方无药品项" />
            <div v-for="(drug, index) in (Array.isArray(drugIteminfo) ? drugIteminfo : [drugIteminfo])" v-else
              :key="index" class="drug-item">
              <p>
                <span class="index">{{ index + 1 }}.</span>
                <span class="drug-name">{{ drug.drugName }}</span>
                <span class="dosage-info">
                  {{ drug.dosage }}{{ drug.dosageUnit }} / {{ drug.usage }} / {{ drug.frequency }} (共{{ drug.number }}{{
                    drug.numberUnit }})
                </span>
              </p>
              <p class="drug-medical-advice">医嘱: {{ drug.medicalAdvice || '无' }}</p>
              <el-divider v-if="index < (Array.isArray(drugIteminfo) ? drugIteminfo.length : 1) - 1" />
            </div>
          </div>
          <el-button v-if="activeTab === 'pending'" type="primary" @click="handlePrintPrescription">分配</el-button>

        </div>

      </el-card>

      <eldialogpatient v-model="PatientdialogVisible" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, reactive } from 'vue';
import { Search, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 假设这些是你的API和类型定义
import UserAPI, {
  IPatient, PatientListQuery,
  FormData, DrugItem
} from '@/api/system/Distribute.api';
import { isConstructorDeclaration } from 'typescript';



// 右侧基础信息卡片数据
const formData = ref<FormData>({
  patientName: '',
  gender: "", // 假设 gender 是 string 或 number 类型，例如 0代表女，1代表男
  age: "",
  contactPhone: '',
  idNumber: '',
  visitType: '',
  isInfectiousDisease: false,
  diseaseOnsetTime: ''
});

const PatientdialogVisible = ref(false); // 控制弹窗显示隐藏
const canEditDosage = ref(false); // 是否可以编辑处方

// 搜索框的值
const searchQuery = ref('');
// 当前激活的 Tab
const activeTab = ref<'pending' | 'completed' | 'returned'>('pending'); // 明确类型，并增加'returned'

// 选中的患者ID，用于高亮和加载右侧详情
const selectedPatientId = ref<string | null>(null);

// 分页相关状态 (统一管理)
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
});

// 各个Tab的总数（用于徽章显示），假设后端会返回这些总数
const tabCounts = reactive({
  pending: 0,
  completed: 0,
  returned: 0,
});

// 统一的患者列表，根据当前activeTab显示
const currentPatientList = ref<IPatient[]>([]);


const dispensingStatusMap: Record<typeof activeTab.value, number> = {
  pending: 0, // 未发药 (但是你上面写的是“已退药”，这里我理解为你的 Tab 叫“未发药”，对应后端2)
  completed: 1, // 已发药
  returned: 2, // 已退药 (但是你上面写的是“未发药”，这里我理解为你的 Tab 叫“已退药”，对应后端0)
};



// 格式化性别
const formatGender = (gender: number | string | null): string => {
  if (gender === null || gender === '') return '未知'; // 增加对 null 或空字符串的处理
  // 如果后端返回的是数字
  if (typeof gender === 'number') {
    return gender === 1 ? '男' : (gender === 0 ? '女' : '未知');
  }
  // 如果后端返回的是字符串（例如“男”，“女”）
  if (typeof gender === 'string') {
    return gender === '男' ? '男' : (gender === '女' ? '女' : '未知');
  }
  return '未知';
};

// 🚀🚀🚀 刘女士，这个 drugIteminfo 现在用来存储处方信息啦！ 🚀🚀🚀
// 根据你提供的数据结构，这里将其初始化为 null 或空数组，具体取决于 ConsultationRecord 返回的是单个 DrugItem 还是 DrugItem 数组
// 从你给的JSON看，它是一个数组，所以我们初始化为 DrugItem[]
const drugIteminfo = ref<DrugItem[]>([]);

const patientid = ref({
  patientId: ''
})

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

/**
 * 获取患者列表数据
 * @param status 当前激活的Tab名称
 * @param pageIndex 页码
 * @param pageSize 每页大小
 */
const fetchPatientList = async () => {
  try {
    const statusValue = dispensingStatusMap[activeTab.value];
    if (statusValue === undefined) {
      ElMessage.warning('无效的查询状态！');
      return;
    }

    const query: PatientListQuery = {
      dispensingStatus: statusValue, // 使用 dispensingStatus
      keyword: searchQuery.value,
      pageIndex: pagination.currentPage,
      pageSize: pagination.pageSize,
    };

    console.log('Fetching patient list with query:', query); // 调试输出

    const response = await UserAPI.getPatientList(query);
    if (response && response.items) {
      currentPatientList.value = response.items;
      // 更新当前Tab的总数
      tabCounts[activeTab.value] = response.totalCount;
    } else {
      currentPatientList.value = [];
      tabCounts[activeTab.value] = 0;
      ElMessage.info('未获取到患者数据。');
    }
  } catch (error) {
    console.error(`获取${activeTab.value === 'pending' ? '未发药' : (activeTab.value === 'completed' ? '已发药' : '已退药')}患者请求失败:`, error);
    ElMessage.error(`获取患者列表失败，请稍后再试！😱`);
    currentPatientList.value = [];
    tabCounts[activeTab.value] = 0;
  }
};

/**
 * 独立获取所有Tab的总数 (可选，如果后端有批量获取总数的API)
 */
const fetchAllTabCounts = async () => {
  try {
    // 分别请求每个状态的总数
    // 注意：这里仍然使用你提供的 dispendingStatusMap 的值
    const [pendingRes, completedRes, returnedRes] = await Promise.all([
      UserAPI.getPatientList({ keyword: searchQuery.value, dispensingStatus: dispensingStatusMap.pending, pageIndex: 1, pageSize: 1 }),
      UserAPI.getPatientList({ keyword: searchQuery.value, dispensingStatus: dispensingStatusMap.completed, pageIndex: 1, pageSize: 1 }),
      UserAPI.getPatientList({ keyword: searchQuery.value, dispensingStatus: dispensingStatusMap.returned, pageIndex: 1, pageSize: 1 }),
    ]);

    if (pendingRes && pendingRes.totalCount !== undefined) {
      tabCounts.pending = pendingRes.totalCount;
    }
    if (completedRes && completedRes.totalCount !== undefined) {
      tabCounts.completed = completedRes.totalCount;
    }
    if (returnedRes && returnedRes.totalCount !== undefined) {
      tabCounts.returned = returnedRes.totalCount;
    }
  } catch (error) {
    console.error('获取各Tab总数失败:', error);
    ElMessage.error('获取Tab总数失败！');
  }
};

// 搜索按钮点击事件
const handleSearch = async () => {
  pagination.currentPage = 1; // 搜索时重置回第一页
  await fetchPatientList();
  // 如果需要，每次搜索后也更新一下所有Tab的总数
  fetchAllTabCounts();
};

// Tab 切换时的处理
const handleTabChange = async (name: string | number) => {
  activeTab.value = name as typeof activeTab.value;
  pagination.currentPage = 1; // 切换Tab时重置回第一页
  await fetchPatientList();
  // 切换Tab后取消选中患者，并清空右侧详情
  selectedPatientId.value = null;
  resetFormData();
  drugIteminfo.value = []; // 🚀 清空处方详情，根据你的数据是数组，所以清空为空数组
};

// 分页器页码改变时的处理
const handlePageChange = async (newPage: number) => {
  pagination.currentPage = newPage;
  await fetchPatientList();
};

// 患者列表项点击事件
const handlePatientClick = async (id: string) => {
  // 设置选中状态
  selectedPatientId.value = id;
  patientid.value.patientId = id
  console.log(id);
  canEditDosage.value = false; // 禁用处方编辑
  // DoctorPrescriptionparameter.value.patientNumber = id; // 🚀 已删除 DoctorPrescriptionparameter，所以这行也删掉

  // 🚀 清空之前的处方详情，避免闪烁
  drugIteminfo.value = []; // 🚀 清空处方详情，根据你的数据是数组，所以清空为空数组

  try {
    // 1. 获取患者基础信息
    const patientBaseInfo = await UserAPI.getPatientIDWay(id);
    console.log("患者基础信息", patientBaseInfo);
    if (patientBaseInfo) {
      // 这里的类型断言 (patientBaseInfo as unknown as FormData) 是为了兼容你 formData 的类型，
      // 确保从 API 获取的数据能正确赋值给 formData
      formData.value = patientBaseInfo as unknown as FormData;
    } else {
      ElMessage.warning('未能获取患者基础信息。');
      resetFormData();
    }

    // 2. 获取并加载患者处方信息
    // 刘女士，这里我保持了你原有的 `UserAPI.ConsultationRecord(id)` 调用
    const prescriptionData = await UserAPI.ConsultationRecord(id);
    console.log("患者处方信息", prescriptionData);

    // 🚀🚀🚀 这里是核心修改：将返回的处方数据赋值给 drugIteminfo.value.data 🚀🚀🚀
    if (prescriptionData && prescriptionData && Array.isArray(prescriptionData)) {
      // 假设 ConsultationRecord 返回的 prescriptionData 是 { data: DrugItem[], isSuc: boolean, ... } 这种结构
      drugIteminfo.value = prescriptionData;
    } else if (prescriptionData && Array.isArray(prescriptionData)) {
      // 如果 ConsultationRecord 直接返回的是 DrugItem[] 数组
      drugIteminfo.value = prescriptionData;
    } else {
      ElMessage.info('该患者暂无处方信息或处方数据格式不正确。');
      drugIteminfo.value = [];
    }

  } catch (error) {
    console.error(`获取患者ID为 ${id} 的信息失败:`, error);
    ElMessage.error(`获取患者信息失败，请重试！🤯`);
    resetFormData();
    drugIteminfo.value = []; // 发生错误时也清空处方详情
  }
};

// 重置formData的方法，避免上次点击的数据残留
const resetFormData = () => {
  formData.value = {
    patientName: '', gender: '', age: '', contactPhone: '',
    idNumber: '', visitType: '', isInfectiousDisease: false, diseaseOnsetTime: ''
  };
};
//发药
const handlePrintPrescription = async () => {
  try {
    const result = await UserAPI.DistributeMedicine(patientid.value.patientId);
    console.log("发药结果", result);

    // 假设返回值结构为 { isSuc: boolean, msg: string }
    if (result && result.isSuc) {
      ElMessage.success(result.msg || "发药成功！");
      // 可选：刷新列表
      fetchPatientList();
      fetchAllTabCounts();
    } else {
      ElMessage.error(result?.msg || "发药失败，请稍后重试");
    }
  } catch (error) {
    console.error("发药失败:", error);
    ElMessage.error("操作失败，请稍后重试");
  }
}
// 组件挂载时加载初始数据
onMounted(() => {
  fetchPatientList();
  fetchAllTabCounts(); // 首次加载所有Tab的总数
});

// 监听 selectedPatientId，当它变化时，如果为null则重置formData
watch(selectedPatientId, (newVal) => {
  if (newVal === null) {
    resetFormData();
    drugIteminfo.value = []; // 🚀 也清空处方详情
  }
});

</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  align-items: flex-start;
  padding: 32px; // 统一padding
  background: #f5f7fa;
  min-height: 100vh;
  gap: 20px; // 左右面板之间的间距
}

.today-visit-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  width: 400px; // 固定左侧宽度
  min-height: calc(100vh - 64px); // 减去上下padding

  .search-section {
    margin-bottom: 20px;

    .search-input {
      width: 100%; // 让搜索框充满容器
    }
  }

  .tabs-section {
    .visit-tabs {

      // 样式保持不变
      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 0;
      }

      :deep(.el-tabs__item) {
        font-size: 16px;
        padding: 0 20px;
        height: 48px;
        line-height: 48px;
      }

      :deep(.el-tabs__active-bar) {
        background-color: var(--el-color-primary);
        height: 3px;
      }

      .tab-label {
        display: flex;
        align-items: center;

        .el-tag {
          margin-left: 8px;
          border-radius: 20px;
          height: 22px;
          line-height: 20px;
          padding: 0 8px;
          font-size: 12px;
        }
      }
    }
  }

  .list-wrapper {
    min-height: 300px;
    background-color: var(--el-bg-color);
    padding: 0 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-lighter);
    margin-top: 10px; // 和Tab的间距

    .patient-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      cursor: pointer;
      transition: background-color 0.2s ease, border-left 0.2s ease; // 添加border-left过渡

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-selected {
        // 选中时的样式
        background-color: var(--el-color-primary-light-9);
        border-left: 5px solid var(--el-color-primary);
        padding-left: 15px; // 保持总宽度一致
      }

      &:last-child {
        border-bottom: none;
      }

      .patient-info {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: var(--el-text-color-regular);

        .index {
          font-weight: bold;
          margin-right: 10px;
          color: var(--el-text-color-primary);
        }

        .name {
          font-weight: bold;
          margin-right: 10px;
          color: var(--el-text-color-primary);
        }

        .gender,
        .age {
          margin-right: 10px;
          color: var(--el-text-color-secondary);
        }
      }

      .visit-time {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--el-text-color-secondary);

        .arrow-icon {
          margin-left: 8px;
          color: var(--el-text-color-placeholder);
        }
      }
    }

    :deep(.el-empty) {
      padding: 50px 0;
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-bottom: 10px;
  }
}

.right-panel {
  flex: 1; // 占据剩余空间
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 64px); // 和左侧容器高度保持一致
}

.base-info-card {
  width: 100%; // 自动适应右侧面板宽度
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #f0f1f2;
  padding: 32px 32px 24px 32px;
  flex-shrink: 0; // 不会被压缩

  .base-info-title {
    font-weight: bold;
    font-size: 18px;
    color: #333;
    margin-bottom: 20px; // 标题和内容间距
  }

  .base-info-row {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px; // 调整行间距

    .el-col {
      margin-bottom: 10px; // 每列底部的间距
    }

    .label {
      font-weight: bold;
      color: #555;
      margin-right: 6px;
    }

    // 更多样式调整，例如对齐
  }
}

// 🚀🚀🚀 新增处方信息卡片的样式 🚀🚀🚀
.prescription-info-card {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #f0f1f2;
  padding: 32px 32px 24px 32px;
  flex-shrink: 0; // 不会被压缩
  margin-top: 0px; // 与上方基础信息卡片的间距, 因为right-panel有gap，这里设为0
  overflow: auto; // 如果内容超出，可以滚动

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }

  .prescription-content {
    .medical-advice {
      font-size: 16px;
      color: #555;
      margin-bottom: 15px;

      .label {
        font-weight: bold;
        margin-right: 8px;
        color: #333;
      }
    }

    .el-divider {
      margin: 15px 0; // 调整分割线间距
    }

    .drug-list {
      h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
      }

      .drug-item {
        margin-bottom: 15px;

        p {
          margin: 5px 0;
          font-size: 15px;
          color: #666;
        }

        .index {
          font-weight: bold;
          margin-right: 8px;
          color: var(--el-color-primary);
        }

        .drug-name {
          font-weight: bold;
          color: #333;
          margin-right: 10px;
        }

        .dosage-info {
          color: #777;
        }

        .drug-medical-advice {
          font-style: italic;
          color: #888;
          margin-left: 25px; // 和上方药品名称对齐
        }
      }
    }
  }
}

// middle-info-card (处方卡片) 保持原样，或者也放入 right-panel 中并调整样式
// 这个样式因为已经被 .prescription-info-card 替代，所以可以删除，或者确保它不冲突
.middle-info-card {
  flex: 1; // 让处方卡片占据剩余空间
  width: 100%; // 自动适应右侧面板宽度
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 32px;
  overflow: auto; // 如果内容超出，可以滚动
}
</style>
