<!-- 患者管理页面 -->
<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="患者姓名" prop="keywords">
          <el-input v-model="queryParams.keywords" placeholder="请输入患者姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><i-ep-search />搜索</el-button>
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>

      
    </div>

    <el-card shadow="never" class="table-container">

      <el-button type="success" icon="plus" @click="handleAdd" style="margin-bottom: 20px;">新增</el-button>
      
      <el-table v-loading="loading" :data="patientList" border>
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

        <el-table-column prop="idNumber" label="身份证号" width="180" align="center" show-overflow-tooltip />

        <el-table-column prop="visitType" label="就诊类型" width="100" align="center" />

        <el-table-column label="是否传染病" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isinfectiousDisease ? 'danger' : 'info'">
              {{ row.isinfectiousDisease ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="diseaseOnsettime" label="发病时间" width="120" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.diseaseOnsettime?.substring(0, 10) }}
          </template>
        </el-table-column>

        <el-table-column prop="emergencyTime" label="紧急时间" width="120" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.emergencyTime?.substring(0, 10) }}
          </template>
        </el-table-column>

        <el-table-column label="就诊状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visitStatus === '已完成'
              ? 'success'
              : row.visitStatus === '待就诊'
                ? 'warning'
                : 'info'
              ">
              {{ row.visitStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="visitDate" label="就诊日期" width="120" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.visitDate?.substring(0, 10) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="success" link icon="edit"
              @click="onlineAppointments(scope.row.patientId)"><i-ep-view />在线预约</el-button>

            <el-button type="primary" link icon="documentRemove"
              @click="viewAppointments(scope.row.patientId)"><i-ep-view />查看预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑患者对话框 -->
    <el-dialog v-model="dialogVisible" title="新增患者" width="600px" append-to-body @close="resetForm">
      <el-form ref="patientFormRef" :model="patientForm" label-width="100px">
        <el-form-item label="患者姓名">
          <el-input v-model="patientForm.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="patientForm.age" :min="0" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="patientForm.gender" placeholder="请选择性别">
            <el-option label="男" :value="true" />
            <el-option label="女" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="patientForm.contactPhone" placeholder="请输入联系电话" maxlength="11" show-word-limit />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="patientForm.idNumber" placeholder="请输入身份证号" maxlength="18" show-word-limit />
        </el-form-item>
        <el-form-item label="就诊类型">
          <el-input v-model="patientForm.visitType" placeholder="例如：初诊、复诊" />
        </el-form-item>
        <el-form-item label="传染病史">
          <el-switch v-model="patientForm.isInfetiousDisease" />
        </el-form-item>
        <el-form-item label="发病时间">
          <el-date-picker v-model="patientForm.diseaseOnsetTime" type="datetime" placeholder="选择发病时间"
            value-format="YYYY-MM-DD HH:mm:ss" :disabled="!patientForm.isInfetiousDisease" />
        </el-form-item>
        <el-form-item label="急诊时间">
          <el-date-picker v-model="patientForm.emergencyTime" type="datetime" placeholder="选择急诊时间"
            value-format="YYYY-MM-DD HH:mm:ss" :disabled="!patientForm.isInfetiousDisease" />
        </el-form-item>
        <el-form-item label="就诊状态">
          <el-input v-model="patientForm.visitStatus" placeholder="例如：待就诊、已就诊" />
        </el-form-item>
        <el-form-item label="就诊日期">
          <el-date-picker v-model="patientForm.visitDate" type="datetime" placeholder="选择就诊日期"
            value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { PatientAPI, PatientFormData, UserAssociatedPatientRecord, PatientPageQuery } from "@/api/patient/patient.api";
import { useUserStore } from "@/store/modules/user.store";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const queryParams = ref<PatientPageQuery>({
  keywords: "",
  pageNum: 1,
  pageSize: 10,
});

const loading = ref(false);
const total = ref(0);
const patientList = ref<UserAssociatedPatientRecord[]>([]);

const dialogVisible = ref(false);
const patientFormRef = ref<HTMLFormElement | null>(null);

const getInitialFormData = (): PatientFormData => ({
  patientName: "",
  age: undefined,
  ageUnit: "岁",
  gender: true, // 默认为男
  contactPhone: "",
  idNumber: "",
  visitType: "初诊",
  isInfetiousDisease: false,
  diseaseOnsetTime: undefined,
  emergencyTime: undefined,
  visitStatus: "待就诊",
  visitDate: "",
});

const patientForm = reactive<PatientFormData>(getInitialFormData());

watch(() => patientForm.isInfetiousDisease, (isInfetious) => {
  if (!isInfetious) {
    patientForm.diseaseOnsetTime = undefined;
    patientForm.emergencyTime = undefined;
  }
});

function handleQuery() {
  loading.value = true;
  PatientAPI.getAssociatedPatients()
    .then((data: UserAssociatedPatientRecord[]) => {
      patientList.value = Array.isArray(data) ? data : [];
      total.value = patientList.value.length;
    })
    .catch((error) => {
      console.error("获取患者列表失败:", error);
      patientList.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function resetQuery() {
  queryParams.value = {
    keywords: "",
    pageNum: 1,
    pageSize: 10,
  };
  handleQuery();
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

function resetForm() {
  Object.assign(patientForm, getInitialFormData());
  patientFormRef.value?.clearValidate();
}

async function submitForm() {
  try {
    const userId = userStore.userInfo.userId;
    if (!userId) {
      ElMessage.error("无法获取当前用户信息，请重新登录");
      return;
    }
    await PatientAPI.addPatientForUser(userId, patientForm);
    ElMessage.success("新增患者成功");
    dialogVisible.value = false;
    handleQuery();
  } catch (error) {
    console.error("新增患者失败:", error);
    ElMessage.error("新增患者失败");
  }
}

function cancel() {
  dialogVisible.value = false;
}

function onlineAppointments(patientId: string) {
  router.push({ path: "/medical/online-appointment/index", query: { patientId } });
}
function viewAppointments(patientId: string) {
  router.push({ path: "/patient/appointments", query: { patientId } });
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
