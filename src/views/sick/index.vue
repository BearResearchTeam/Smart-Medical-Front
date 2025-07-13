<template>
  <div>
    <!-- 患者筛选输入框 -->
    <el-input
      v-model="patientFilter"
      placeholder="搜索患者姓名/手机号"
      style="width: 220px; margin-bottom: 12px"
      clearable
    />
    <!-- 患者分组折叠面板（美化+分页） -->
    <el-collapse v-model="activeNames" style="margin-bottom: 24px">
      <el-collapse-item
        v-for="patient in filteredPatientGroupList"
        :key="patient.patientId"
        :name="patient.patientId"
      >
        <template #title>
          <span>
            <el-icon style="color: #1976d2; margin-right: 4px"><User /></el-icon>
            <span style="font-weight: bold; color: #1976d2">{{ patient.name }}</span>
            <el-tag
              :type="patient.gender === 1 ? 'primary' : patient.gender === 2 ? 'danger' : 'info'"
              size="small"
              style="margin-left: 8px"
            >
              {{ patient.gender === 1 ? "男" : patient.gender === 2 ? "女" : "未知" }}
            </el-tag>
            <span style="margin-left: 8px; color: #888">{{ patient.age }}岁</span>
            <span v-if="patient.contactPhone" style="margin-left: 12px; color: #888">
              {{ patient.contactPhone }}
            </span>
          </span>
        </template>
        <el-table
          :data="getPagedSickList(patient)"
          border
          stripe
          size="small"
          class="patient-sick-table"
        >
          <!-- 这里粘贴你原有的所有 el-table-column 字段 -->
          <el-table-column prop="sickId" label="病历ID" width="200" show-overflow-tooltip />
          <el-table-column prop="basicPatientId" label="患者ID" width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === '已结算'
                    ? 'success'
                    : scope.row.status === '新建'
                      ? 'info'
                      : 'warning'
                "
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startingTemperature" label="初始体温" width="90" />
          <el-table-column prop="temperature" label="体温" width="70" />
          <el-table-column prop="pulse" label="脉搏" width="70" />
          <el-table-column prop="breath" label="呼吸" width="70" />
          <el-table-column prop="bloodPressure" label="血压" width="90" />
          <el-table-column prop="dischargeDiagnosis" label="出院诊断" width="120" />
          <el-table-column prop="inpatientNumber" label="住院号" width="120" />
          <el-table-column prop="dischargeDepartment" label="出院科室" width="120" />
          <el-table-column label="出院时间" width="160">
            <template #default="scope">
              {{
                scope.row.dischargeTime
                  ? scope.row.dischargeTime.replace("T", " ").slice(0, 16)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column prop="admissionDiagnosis" label="入院诊断" width="120" />
          <el-table-column prop="patientBaseName" label="患者基础名" width="120" />
          <el-table-column prop="gender" label="性别" width="70">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.gender === 1 ? 'primary' : scope.row.gender === 2 ? 'danger' : 'info'
                "
              >
                {{ scope.row.gender === 1 ? "男" : scope.row.gender === 2 ? "女" : "未知" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="70" />
          <el-table-column prop="ageUnit" label="年龄单位" width="70" />
          <el-table-column prop="contactPhone" label="联系电话" width="120" />
          <el-table-column prop="idNumber" label="身份证号" width="160" />
          <el-table-column prop="visitType" label="就诊类型" width="80" />
          <el-table-column prop="isInfectiousDisease" label="传染病" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.isInfectiousDisease ? 'danger' : 'success'">
                {{ scope.row.isInfectiousDisease ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发病时间" width="160">
            <template #default="scope">
              {{
                scope.row.diseaseOnsetTime
                  ? scope.row.diseaseOnsetTime.replace("T", " ").slice(0, 16)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column label="急诊时间" width="160">
            <template #default="scope">
              {{
                scope.row.emergencyTime
                  ? scope.row.emergencyTime.replace("T", " ").slice(0, 16)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column label="就诊日期" width="160">
            <template #default="scope">
              {{ scope.row.visitDate ? scope.row.visitDate.replace("T", " ").slice(0, 16) : "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="clinicId" label="门诊ID" width="200" show-overflow-tooltip />
          <el-table-column prop="doctorId" label="医生ID" width="180" show-overflow-tooltip />
          <el-table-column label="门诊时间" width="160">
            <template #default="scope">
              {{
                scope.row.visitDateTime
                  ? scope.row.visitDateTime.replace("T", " ").slice(0, 16)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="科室" width="90" />
          <el-table-column prop="chiefComplaint" label="主诉" width="120" />
          <el-table-column prop="preliminaryDiagnosis" label="初步诊断" width="120" />
          <el-table-column prop="visitTypeClinic" label="门诊类型" width="80" />
          <el-table-column prop="dispensingStatus" label="发药状态" width="90" />
          <el-table-column prop="executionStatus" label="执行状态" width="90" />
          <el-table-column prop="clinicRemarks" label="门诊备注" width="200" />
          <el-table-column prop="prescriptionId" label="处方ID" width="180" show-overflow-tooltip />
          <el-table-column prop="prescriptionTemplateNumber" label="处方模板号" width="120" />
          <el-table-column prop="medicalAdvice" label="医嘱" width="160" />
          <el-table-column label="药品明细" width="200">
            <template #default="scope">
              <div v-for="item in scope.row.drugItems" :key="item.drugId">
                <el-tag size="small" type="info" style="margin-bottom: 2px">
                  {{ item.drugName }}（{{ item.specification }}）
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="appointmentId" label="预约ID" width="180" show-overflow-tooltip />
          <el-table-column label="预约时间" width="160">
            <template #default="scope">
              {{
                scope.row.appointmentDateTime
                  ? scope.row.appointmentDateTime.replace("T", " ").slice(0, 16)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column prop="appointmentStatus" label="预约状态" width="90" />
          <el-table-column prop="actualFee" label="实付金额" width="90" />
          <el-table-column prop="appointmentRemarks" label="预约备注" width="120" />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                icon="View"
                style="color: #1976d2"
                @click.stop="showDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页控件 -->
        <el-pagination
          v-if="patient.sickList.length > pageSize"
          :current-page="patientPageMap[patient.patientId] || 1"
          :page-size="pageSize"
          :total="patient.sickList.length"
          layout="total, prev, pager, next"
          small
          style="margin: 8px 0"
          @current-change="(page) => setPatientPage(patient.patientId, page)"
        />
      </el-collapse-item>
    </el-collapse>
    <!-- 原有表格和功能保留在下方 -->
    <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: center">
      <el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
        style="width: 120px; margin-right: 8px"
      >
        <el-option label="全部" value="" />
        <el-option label="已结算" value="已结算" />
        <el-option label="已出院" value="已出院" />
        <el-option label="新建" value="新建" />
        <el-option label="待就诊" value="待就诊" />
      </el-select>
      <el-button type="primary" @click="handleQuery">查询</el-button>
    </div>
    <el-button
      type="success"
      icon="Download"
      style="margin-bottom: 12px"
      @click="handleExportSickExcel"
    >
      导出病历信息
    </el-button>
    <el-table
      :data="tableData"
      border
      stripe
      fit
      highlight-current-row
      style="width: 100%; background: var(--my-bg); color: var(--my-text)"
      :header-cell-style="{ textAlign: 'center', background: '#e3f2fd', fontWeight: 'bold' }"
      :cell-style="{ textAlign: 'left' }"
    >
      <!-- 基本病历信息 -->
      <el-table-column prop="sickId" label="病历ID" width="200" show-overflow-tooltip />
      <el-table-column prop="basicPatientId" label="患者ID" width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.status === '已结算'
                ? 'success'
                : scope.row.status === '新建'
                  ? 'info'
                  : 'warning'
            "
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startingTemperature" label="初始体温" width="90" />
      <el-table-column prop="temperature" label="体温" width="70" />
      <el-table-column prop="pulse" label="脉搏" width="70" />
      <el-table-column prop="breath" label="呼吸" width="70" />
      <el-table-column prop="bloodPressure" label="血压" width="90" />
      <el-table-column prop="dischargeDiagnosis" label="出院诊断" width="120" />
      <el-table-column prop="inpatientNumber" label="住院号" width="120" />
      <el-table-column prop="dischargeDepartment" label="出院科室" width="120" />
      <el-table-column label="出院时间" width="160">
        <template #default="scope">
          {{
            scope.row.dischargeTime ? scope.row.dischargeTime.replace("T", " ").slice(0, 16) : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column prop="admissionDiagnosis" label="入院诊断" width="120" />

      <!-- 患者基本信息 -->
      <el-table-column prop="patientBaseName" label="患者基础名" width="120" />
      <el-table-column prop="gender" label="性别" width="70">
        <template #default="scope">
          <el-tag
            :type="scope.row.gender === 1 ? 'primary' : scope.row.gender === 2 ? 'danger' : 'info'"
          >
            {{ scope.row.gender === 1 ? "男" : scope.row.gender === 2 ? "女" : "未知" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="70" />
      <el-table-column prop="ageUnit" label="年龄单位" width="70" />
      <el-table-column prop="contactPhone" label="联系电话" width="120" />
      <el-table-column prop="idNumber" label="身份证号" width="160" />
      <el-table-column prop="visitType" label="就诊类型" width="80" />
      <el-table-column prop="isInfectiousDisease" label="传染病" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.isInfectiousDisease ? 'danger' : 'success'">
            {{ scope.row.isInfectiousDisease ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发病时间" width="160">
        <template #default="scope">
          {{
            scope.row.diseaseOnsetTime
              ? scope.row.diseaseOnsetTime.replace("T", " ").slice(0, 16)
              : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column label="急诊时间" width="160">
        <template #default="scope">
          {{
            scope.row.emergencyTime ? scope.row.emergencyTime.replace("T", " ").slice(0, 16) : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column label="就诊日期" width="160">
        <template #default="scope">
          {{ scope.row.visitDate ? scope.row.visitDate.replace("T", " ").slice(0, 16) : "-" }}
        </template>
      </el-table-column>

      <!-- 就诊信息 -->
      <el-table-column prop="clinicId" label="门诊ID" width="200" show-overflow-tooltip />
      <el-table-column prop="doctorId" label="医生ID" width="180" show-overflow-tooltip />
      <el-table-column label="门诊时间" width="160">
        <template #default="scope">
          {{
            scope.row.visitDateTime ? scope.row.visitDateTime.replace("T", " ").slice(0, 16) : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column prop="departmentName" label="科室" width="90" />
      <el-table-column prop="chiefComplaint" label="主诉" width="120" />
      <el-table-column prop="preliminaryDiagnosis" label="初步诊断" width="120" />
      <el-table-column prop="visitTypeClinic" label="门诊类型" width="80" />
      <el-table-column prop="dispensingStatus" label="发药状态" width="90" />
      <el-table-column prop="executionStatus" label="执行状态" width="90" />
      <el-table-column prop="clinicRemarks" label="门诊备注" width="200" />

      <!-- 处方信息 -->
      <el-table-column prop="prescriptionId" label="处方ID" width="180" show-overflow-tooltip />
      <el-table-column prop="prescriptionTemplateNumber" label="处方模板号" width="120" />
      <el-table-column prop="medicalAdvice" label="医嘱" width="160" />
      <el-table-column label="药品明细" width="200">
        <template #default="scope">
          <div v-for="item in scope.row.drugItems" :key="item.drugId">
            <el-tag size="small" type="info" style="margin-bottom: 2px">
              {{ item.drugName }}（{{ item.specification }}）
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 预约信息 -->
      <el-table-column prop="appointmentId" label="预约ID" width="180" show-overflow-tooltip />
      <el-table-column label="预约时间" width="160">
        <template #default="scope">
          {{
            scope.row.appointmentDateTime
              ? scope.row.appointmentDateTime.replace("T", " ").slice(0, 16)
              : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column prop="appointmentStatus" label="预约状态" width="90" />
      <el-table-column prop="actualFee" label="实付金额" width="90" />
      <el-table-column prop="appointmentRemarks" label="预约备注" width="120" />

      <!-- 操作 -->
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            link
            size="small"
            icon="View"
            style="color: #1976d2"
            @click.stop="showDetail(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="queryParams.pageIndex"
      :page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 50, 100]"
      style="margin-top: 16px"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <!-- 详情弹窗同前，可保留 -->
    <el-dialog
      v-model="dialogVisible"
      title="病历详情"
      width="95vw"
      :style="{ maxWidth: '900px' }"
      class="my-dialog"
    >
      <!-- 顶部患者主信息 -->
      <div class="detail-header">
        <el-avatar :size="48" icon="UserFilled" />
        <span class="detail-name">{{ currentSick.patientBaseName || "-" }}</span>
        <el-tag
          :type="currentSick.gender === 1 ? 'primary' : 'danger'"
          size="small"
          style="margin-left: 8px"
        >
          {{ currentSick.gender === 1 ? "男" : currentSick.gender === 2 ? "女" : "未知" }}
        </el-tag>
        <span style="margin-left: 8px; color: #888">
          {{ currentSick.age ? currentSick.age + (currentSick.ageUnit || "") : "-" }}
        </span>
      </div>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        "
      >
        <el-button
          :disabled="currentSickIndex === 0"
          size="small"
          :icon="ArrowLeft"
          plain
          @click="prevSick"
        >
          上一条
        </el-button>
        <span style="font-weight: bold">
          {{ currentSickIndex + 1 }} / {{ currentPatientSickList.length }}
        </span>
        <el-button
          :disabled="currentSickIndex === currentPatientSickList.length - 1"
          size="small"
          :icon="ArrowRight"
          plain
          @click="nextSick"
        >
          下一条
        </el-button>
      </div>
      <div style="max-height: 70vh; overflow-y: auto">
        <!-- 基本信息分组 -->
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          基本信息
        </h3>
        <el-descriptions :column="2" border class="desc-group">
          <el-descriptions-item label="年龄">
            {{ currentSick.age ? currentSick.age + (currentSick.ageUnit || "") : "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <span>{{ currentSick.contactPhone || "-" }}</span>
            <el-button
              v-if="currentSick.contactPhone"
              type="text"
              size="small"
              @click="copy(currentSick.contactPhone)"
            >
              复制
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="身份证号">
            {{ currentSick.idNumber || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="就诊类型">
            {{ currentSick.visitType || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="是否传染病">
            <el-tag :type="currentSick.isInfectiousDisease ? 'danger' : 'success'">
              {{ currentSick.isInfectiousDisease ? "是" : "否" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发病时间">
            {{ formatTime(currentSick.diseaseOnsetTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="急诊时间">
            {{ formatTime(currentSick.emergencyTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="就诊日期">
            {{ formatTime(currentSick.visitDate) }}
          </el-descriptions-item>
        </el-descriptions>
        <!-- 就诊信息分组 -->
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          就诊信息
        </h3>
        <el-descriptions :column="2" border class="desc-group">
          <el-descriptions-item label="门诊ID">
            {{ currentSick.clinicId || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="医生ID">
            {{ currentSick.doctorId || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="门诊时间">
            {{ formatTime(currentSick.visitDateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="科室">
            {{ currentSick.departmentName || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="主诉">
            {{ currentSick.chiefComplaint || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="初步诊断">
            {{ currentSick.preliminaryDiagnosis || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="门诊类型">
            {{ currentSick.visitTypeClinic || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="发药状态">
            {{ currentSick.dispensingStatus ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="执行状态">
            {{ currentSick.executionStatus ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="门诊备注">
            {{ currentSick.clinicRemarks || "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <!-- 处方信息分组 -->
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          处方信息
        </h3>
        <el-descriptions :column="2" border class="desc-group">
          <el-descriptions-item label="处方ID">
            {{ currentSick.prescriptionId || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="处方模板号">
            {{ currentSick.prescriptionTemplateNumber ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="医嘱">
            {{ currentSick.medicalAdvice || "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <!-- 预约信息分组 -->
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          预约信息
        </h3>
        <el-descriptions :column="2" border class="desc-group">
          <el-descriptions-item label="预约ID">
            {{ currentSick.appointmentId || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="预约时间">
            {{ formatTime(currentSick.appointmentDateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="预约状态">
            {{ currentSick.appointmentStatus ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="实付金额">
            {{ currentSick.actualFee ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="预约备注">
            {{ currentSick.appointmentRemarks || "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <!-- 药品明细分组 -->
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          药品明细
        </h3>
        <el-table :data="currentSick?.drugItems || []" size="small" border stripe>
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="drugName" label="药品名称" />
          <el-table-column prop="specification" label="规格" />
        </el-table>
      </div>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { getPatientSickFullInfo } from "@/api/record.api";
import { User, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { onBeforeUnmount } from "vue";
import { exportSickExcel } from "@/api/medical/appointment.api";
import { Document } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
function copy(text: string) {
  navigator.clipboard.writeText(text);
  ElMessage.success("已复制");
}
function formatTime(val: any) {
  if (!val) return "-";
  return val.replace("T", " ").slice(0, 16);
}
const loading = ref(false);
const queryParams = ref({
  pageIndex: 1,
  pageSize: 10,
  status: "",
});
const tableData = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const currentSick = ref<any>(null);
const activeNames = ref([]);
const patientFilter = ref("");
const pageSize = 5;
const patientPageMap = reactive<Record<string, number>>({});
function setPatientPage(pid: string, page: number) {
  patientPageMap[pid] = page;
}
function getPagedSickList(patient: { patientId: string; sickList: any[] }) {
  const page = patientPageMap[patient.patientId] || 1;
  const start = (page - 1) * pageSize;
  return patient.sickList.slice(start, start + pageSize);
}
const patientGroupList = computed(() => {
  const map = new Map();
  tableData.value.forEach((item) => {
    if (!map.has(item.basicPatientId)) {
      map.set(item.basicPatientId, {
        patientId: item.basicPatientId,
        name: item.patientBaseName,
        gender: item.gender,
        age: item.age,
        contactPhone: item.contactPhone,
        sickList: [],
      });
    }
    map.get(item.basicPatientId).sickList.push(item);
  });
  return Array.from(map.values());
});
const filteredPatientGroupList = computed(() =>
  patientGroupList.value.filter(
    (p) =>
      !patientFilter.value ||
      p.name.includes(patientFilter.value) ||
      (p.contactPhone && p.contactPhone.includes(patientFilter.value))
  )
);

function handleQuery() {
  loading.value = true;
  getPatientSickFullInfo()
    .then((res: any) => {
      // 本地分页和筛选
      let arr = Array.isArray(res) ? res : [];
      if (queryParams.value.status) {
        arr = arr.filter((item) => item.status === queryParams.value.status);
      }
      total.value = arr.length;
      const start = (queryParams.value.pageIndex - 1) * queryParams.value.pageSize;
      const end = start + queryParams.value.pageSize;
      tableData.value = arr.slice(start, end);
    })
    .finally(() => {
      loading.value = false;
    });
}
function handlePageChange(page: number) {
  queryParams.value.pageIndex = page;
  handleQuery();
}
function handleSizeChange(size: number) {
  queryParams.value.pageSize = size;
  queryParams.value.pageIndex = 1;
  handleQuery();
}
const currentPatientId = ref<string>("");
const currentPatientSickList = ref<any[]>([]);
const currentSickIndex = ref(0);

function showDetail(row: any) {
  currentSick.value = row;
  currentPatientId.value = row.basicPatientId;
  currentPatientSickList.value = tableData.value.filter(
    (item) => item.basicPatientId === row.basicPatientId
  );
  currentSickIndex.value = currentPatientSickList.value.findIndex(
    (item) => item.sickId === row.sickId
  );
  dialogVisible.value = true;
}
function prevSick() {
  if (currentSickIndex.value > 0) {
    currentSickIndex.value--;
    currentSick.value = currentPatientSickList.value[currentSickIndex.value];
  }
}
function nextSick() {
  if (currentSickIndex.value < currentPatientSickList.value.length - 1) {
    currentSickIndex.value++;
    currentSick.value = currentPatientSickList.value[currentSickIndex.value];
  }
}
function handleKeydown(e: KeyboardEvent) {
  if (!dialogVisible.value) return;
  if (e.key === "ArrowLeft") prevSick();
  if (e.key === "ArrowRight") nextSick();
}
function handleExportSickExcel() {
  exportSickExcel().then((res: any) => {
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "病历信息.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
}
onMounted(() => {
  handleQuery();
  window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.my-dialog .el-dialog__header {
  background: #1976d2 !important;
  color: #fff !important;
}
.my-dialog .el-descriptions__title {
  color: #1976d2;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}
.my-dialog .el-descriptions {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}
.my-dialog .el-descriptions__cell {
  background: #fff;
  color: #222;
}
.my-dialog .el-descriptions__label {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
}
.my-dialog .el-table th {
  background: #e3f2fd !important;
  color: #1976d2 !important;
  font-weight: bold;
}
.my-dialog .el-table td {
  background: #fff !important;
  color: #333 !important;
}
@media (max-width: 600px) {
  .el-table,
  .el-table th,
  .el-table td {
    font-size: 12px;
    padding: 4px 2px;
  }
  .el-pagination {
    font-size: 12px;
  }
  .el-dialog {
    width: 99vw !important;
    min-width: 0 !important;
    padding: 0 !important;
  }
}
.desc-group {
  margin-bottom: 24px;
}
.my-dialog .el-descriptions__title {
  color: #1976d2;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}
.el-collapse {
  background: #f7fbff;
  border-radius: 10px;
  margin-bottom: 24px;
}
.el-collapse-item__header {
  font-weight: bold;
  color: #1976d2;
  font-size: 16px;
  background: #e3f2fd;
  border-radius: 8px 8px 0 0;
  padding-left: 12px;
}
.el-collapse-item__wrap {
  background: #fff;
  border-radius: 0 0 8px 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}
.patient-sick-table {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .el-descriptions {
    font-size: 12px;
  }
}
.group-title {
  color: #1976d2;
  font-weight: bold;
  font-size: 18px;
  margin: 24px 0 12px 0;
  display: flex;
  align-items: center;
}
.group-title .el-icon {
  margin-right: 6px;
}
.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.detail-name {
  font-size: 20px;
  font-weight: bold;
  margin-left: 12px;
}
</style>
