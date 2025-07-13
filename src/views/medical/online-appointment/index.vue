<template>
  <div class="app-container">
    <!-- 主体容器 -->
    <el-container style="padding: 20px; background-color: #f9fbfd;">
      <el-main>
        <!-- 卡片容器 -->
        <el-card shadow="hover" class="form-card">
          <template #header>
            <div class="card-header">
              <h3 class="title">
                <i class="el-icon-document-add"></i> 线上预约
              </h3>
            </div>
          </template>

          <!-- 表单区域 -->
          <el-form ref="appointmentFormRef" :model="appointmentFormData" :rules="appointmentRules" label-width="140px"
            label-position="right">
            <!-- 预约信息 -->
            <el-divider content-position="left">
              <span class="section-title">📅 预约信息</span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="预约时间" prop="appointmentDateTime">
                  <el-date-picker v-model="appointmentFormData.appointmentDateTime" type="datetime" placeholder="选择预约时间"
                    value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="备注" prop="remarks">
                  <el-input v-model="appointmentFormData.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 患者信息 -->
            <el-divider content-position="left">
              <span class="section-title">🧍 患者信息</span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="患者姓名" prop="patientName">
                  <el-input v-model="appointmentFormData.patientName" placeholder="请输入患者姓名" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="appointmentFormData.gender">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="年龄" prop="age">
                  <el-input-number v-model="appointmentFormData.age" :min="0" :max="150" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="年龄单位" prop="ageUnit">
                  <el-select v-model="appointmentFormData.ageUnit" placeholder="请选择" style="width: 100%">
                    <el-option label="岁" value="岁" />
                    <el-option label="月" value="月" />
                    <el-option label="日" value="日" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="联系电话" prop="contactPhone">
                  <el-input v-model="appointmentFormData.contactPhone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="身份证号" prop="idNumber">
                  <el-input v-model="appointmentFormData.idNumber" placeholder="请输入身份证号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="就诊类型" prop="visitType">
                  <el-select v-model="appointmentFormData.visitType" placeholder="请选择" style="width: 100%">
                    <el-option label="初诊" value="初诊" />
                    <el-option label="复诊" value="复诊" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="传染病" prop="isInfectiousDisease">
                  <el-switch v-model="appointmentFormData.isInfectiousDisease" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 条件显示字段 -->
            <transition name="fade">
              <div v-if="appointmentFormData.isInfectiousDisease">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="发病时间" prop="diseaseOnsetDateTime">
                      <el-date-picker v-model="appointmentFormData.diseaseOnsetDateTime" type="datetime"
                        placeholder="选择发病时间" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="急诊时间" prop="emergencyTime">
                      <el-date-picker v-model="appointmentFormData.emergencyTime" type="datetime" placeholder="选择急诊时间"
                        value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </transition>

            <!-- 提交按钮 -->
            <el-form-item>
              <el-button type="primary" @click="submitForm" style="width: 100%; margin-top: 10px;">提交预约</el-button>
              <el-button @click="resetForm" style="width: 100%; margin-top: 10px;">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ElForm } from "element-plus";
import AppointmentAPI, { type AppointmentFormData } from "@/api/medical/appointment.api";
import PatientAPI from "@/api/medical/patient.api";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const patientId = ref<string | null>(route.query.patientId as string);
const appointmentFormRef = ref<InstanceType<typeof ElForm>>();

const appointmentFormData = reactive<AppointmentFormData>({
  patientId: null, // 默认设置为 null 或者空字符串
  appointmentDateTime: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // 设置为当前时间加一天
    return date.toISOString().slice(0, 19);
  })(),
  remarks: "",
  status: 0, // 修改为默认挂号状态 0
  actualFee: 0, // 修改为默认费用 0
  visitId: "", // 默认空字符串
  visitStatus: "", // 默认空字符串
  visitDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString(); // 返回完整的 ISO 格式日期时间字符串
  })(),
  patientName: "",
  gender: 1,
  age: 0,
  ageUnit: "岁",
  contactPhone: "",
  idNumber: "",
  visitType: "初诊",
  isInfectiousDisease: false,
  diseaseOnsetDateTime: undefined,
  emergencyTime: undefined,
});

const appointmentRules = reactive({
  appointmentDateTime: [{ required: true, message: "请选择预约时间", trigger: "change" }],
  patientName: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  age: [{ required: true, message: "请输入年龄", trigger: "blur" }],
  ageUnit: [{ required: true, message: "请输入年龄单位", trigger: "blur" }],
  contactPhone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" },
  ],
  idNumber: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    { pattern: /(^\d{17}(\d|X|x)$)/, message: "请输入正确的18位身份证号", trigger: "blur" },
  ],
  visitType: [{ required: true, message: "请选择就诊类型", trigger: "change" }],
});

// 监听 isInfectiousDisease 字段，如果为 false，则清空相关时间字段
watch(
  () => appointmentFormData.isInfectiousDisease,
  (newValue) => {
    if (!newValue) {
      appointmentFormData.diseaseOnsetDateTime = undefined;
      appointmentFormData.emergencyTime = undefined;
    }
  }
);
const getpatientlist = async () => {
  const result = await PatientAPI.getPatientbyid(patientId.value || "", {})
  Object.assign(appointmentFormData, result);
  console.log("获取到的患者数据:", result);
  // 处理 diseaseOnsetDateTime 字段
  appointmentFormData.emergencyTime = result.diseaseOnsetTime
    ? new Date(result.diseaseOnsetTime).toISOString()
    : undefined;
}
const submitForm = async () => {
  if (!appointmentFormRef.value) return;

  try {
    const valid = await appointmentFormRef.value.validate(); // 直接 await 验证结果

    if (valid) {
      await ElMessageBox.confirm("确定提交预约吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });

      await AppointmentAPI.addAppointment(appointmentFormData);
      ElMessage.success("预约成功！");
      resetForm();
    } else {
      ElMessage.error("请完整填写表单信息！");
    }
  } catch (error: any) {
    if (error === 'cancel') {
      // 用户取消了确认框
      ElMessage.info("已取消预约提交");
    } else {
      ElMessage.error(error.message || "表单提交失败或发生未知错误！");
    }
  }
};

const resetForm = () => {
  if (!appointmentFormRef.value) return;
  appointmentFormRef.value.resetFields();
  appointmentFormData.patientId = null;
  const date = new Date();
  date.setDate(date.getDate() + 1);
  appointmentFormData.appointmentDateTime = date.toISOString().slice(0, 19);
  appointmentFormData.remarks = "";
  appointmentFormData.status = 0;
  appointmentFormData.actualFee = 0;
  appointmentFormData.visitId = "";
  appointmentFormData.visitStatus = "";
  appointmentFormData.visitDate = date.toISOString();
  appointmentFormData.patientName = "";
  appointmentFormData.gender = 1;
  appointmentFormData.age = 0;
  appointmentFormData.ageUnit = "岁";
  appointmentFormData.contactPhone = "";
  appointmentFormData.idNumber = "";
  appointmentFormData.visitType = "初诊";
  appointmentFormData.isInfectiousDisease = false;
  appointmentFormData.diseaseOnsetDateTime = undefined;
  appointmentFormData.emergencyTime = undefined;
};
onMounted(() => {
  console.log("patientId:", patientId.value); // 打印患者ID
  getpatientlist();

});
</script>

<style scoped>
/* 可以添加页面特定样式 */
</style>