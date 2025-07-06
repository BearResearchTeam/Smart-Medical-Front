<template>
  <el-dialog v-model="PatientdialogVisible" title="新增/编辑患者信息" width="80%" :before-close="handleClose" draggable center>
    <el-form ref="ruleFormRef" :model="RegistraPatientForm" label-width="auto" :rules="formRules">
      <el-row :gutter="20"> <el-col :span="12">
          <el-form-item label="姓名" prop="patientName">
            <el-input v-model="RegistraPatientForm.patientName" placeholder="请输入患者姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="RegistraPatientForm.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="RegistraPatientForm.age" :min="0" :max="150" controls-position="right"
              style="width: 100%;" /> </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄单位" prop="ageUnit">
            <el-select v-model="RegistraPatientForm.ageUnit" placeholder="请选择年龄单位" style="width: 100%;">
              <el-option label="年" value="年"></el-option>
              <el-option label="月" value="月"></el-option>
              <el-option label="日" value="日"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系方式" prop="contactPhone">
            <el-input v-model="RegistraPatientForm.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idNumber">
            <el-input v-model="RegistraPatientForm.idNumber" placeholder="请输入18位身份证号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否传染病" prop="isInfectiousDisease">
            <el-switch v-model="RegistraPatientForm.isInfectiousDisease" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发病时间" prop="diseaseOnsetTime">
            <el-date-picker v-model="RegistraPatientForm.diseaseOnsetTime" type="datetime" placeholder="请选择发病时间"
              style="width: 100%;" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" /> </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="科室" prop="departmentName">
            <el-select v-model="RegistraPatientForm.departmentName" placeholder="请选择科室" style="width: 100%;"
              @change="handleDepartmentChange">
              <el-option v-for="item in departmentList" :key="item.id" :label="item.departmentName"
                :value="item.departmentName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="医生" prop="doctorId"> <el-select v-model="RegistraPatientForm.doctorId"
              placeholder="请选择医生" style="width: 100%;" :disabled="doctorList.length === 0">
              <el-option v-for="doc in doctorList" :key="doc.id" :label="doc.employeeName" :value="doc.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="就诊类型" prop="visitType">
            <el-select v-model="RegistraPatientForm.visitType" placeholder="请选择就诊类型" style="width: 100%;">
              <el-option label="初诊" value="初诊"></el-option>
              <el-option label="复诊" value="复诊"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="就诊时间" prop="visitDate">
            <el-date-picker v-model="RegistraPatientForm.visitDate" type="datetime" placeholder="请选择就诊时间"
              style="width: 100%;" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" /> </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="RegistraPatientForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>生命体征</el-divider> <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="体温" prop="temperature">
            <el-input-number v-model="RegistraPatientForm.temperature" :min="30" :max="45" :precision="1" :step="0.1"
              controls-position="right" /> </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="脉搏" prop="pulse">
            <el-input-number v-model="RegistraPatientForm.pulse" :min="20" :max="200" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="呼吸" prop="breath">
            <el-input-number v-model="RegistraPatientForm.breath" :min="5" :max="60" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="血压" prop="bloodPressure">
            <el-input v-model="RegistraPatientForm.bloodPressure" placeholder="例如: 120/80" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="submitForm(ruleFormRef)">提 交</el-button> <el-button type="info"
          @click="resetForm(ruleFormRef)">重 置</el-button> <el-button @click="PatientdialogVisible = false">取
          消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, reactive } from 'vue';
import { ElMessageBox, ElMessage, FormInstance, FormRules } from 'element-plus'; // 导入 FormInstance, FormRules
import UserAPI, {
  RegistrationPatient, GetDoctorDepartMent, GetDoctor
} from '@/api/system/patient.api'; // 确保路径正确，RegistrationPatient已导入
// 接收父组件传入的modelValue，控制弹窗显示/隐藏
const props = defineProps<{ modelValue: boolean }>();
// 定义触发的事件，用于更新父组件的modelValue
const emit = defineEmits(['update:modelValue', 'submitSuccess']); // 添加一个提交成功事件

// 控制弹窗的显示与隐藏，通过 watch 同步 props.modelValue
const PatientdialogVisible = ref(props.modelValue);
watch(() => props.modelValue, val => {
  PatientdialogVisible.value = val;
  if (val) {
    // 弹窗打开时重置表单（或加载数据）
    resetForm(ruleFormRef.value); // 打开时重置表单
    // 如果是编辑模式，这里可以根据传入的ID加载数据
  }
});
watch(PatientdialogVisible, val => emit('update:modelValue', val));

// 表单引用，用于触发表单验证和重置
const ruleFormRef = ref<FormInstance>();

// 表单数据，使用 reactive 包裹，以便深度监听
const RegistraPatientForm = reactive<RegistrationPatient>({
  patientName: '', // 初始值为空
  gender: 1, // 默认男性
  age: 18,
  ageUnit: '年',
  contactPhone: '',
  idNumber: '',
  isInfectiousDisease: false,
  diseaseOnsetTime: new Date, // 初始值设为null
  doctorId: '', // GUID一般是字符串，初始为空字符串
  departmentName: '',
  visitType: '初诊', // 默认初诊
  visitDate: new Date().toISOString(), // 就诊时间默认为当前，并转为ISO字符串
  remarks: '',
  temperature: 36.5,
  pulse: 75,
  breath: 18,
  bloodPressure: ''
});


// 定义科室列表，类型是 GetDoctorDepartMent 数组
const departmentList = ref<GetDoctorDepartMent[]>([]);

// 定义医生列表，**类型是 GetDoctor 数组**
const doctorList = ref<GetDoctor[]>([]);

// 获取科室列表的方法
const GetDoctorDepartMentList = async () => {
  try {
    const res = await UserAPI.GetDoctorDepartMentList();
    departmentList.value = Array.isArray(res) ? res : [];
  } catch (error) {
    ElMessage.error('获取科室列表失败！😢');
    console.error('获取科室列表出错:', error);
  }
};

// 科室变更时获取医生列表的方法
const handleDepartmentChange = async (departmentName: string) => {
  // 根据 departmentName 找到对应的 departmentId
  const selectedDepartment = departmentList.value.find(
    (dept) => dept.departmentName === departmentName
  );

  if (selectedDepartment) {
    try {
      const res = await UserAPI.GetDoctorCardId(selectedDepartment.id);
      // **确保这里赋值给 doctorList 的是 GetDoctor 类型的数组**
      doctorList.value = Array.isArray(res) ? res : [];
      // 清空已选医生，避免选择科室后医生ID不匹配
      RegistraPatientForm.doctorId = '';
    } catch (error) {
      ElMessage.error(`获取${departmentName}科室医生失败！😢`);
      console.error(`获取${departmentName}科室医生出错:`, error);
    }
  } else {
    // 如果没有找到对应的科室，清空医生列表
    doctorList.value = [];
    RegistraPatientForm.doctorId = '';
  }
};

onMounted(() => {
  GetDoctorDepartMentList(); // 组件挂载时获取科室列表
});
onMounted(() => {
  GetDoctorDepartMentList()
})

// 表单校验规则
const formRules = reactive<FormRules<RegistrationPatient>>({
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  ageUnit: [{ required: true, message: '请选择年龄单位', trigger: 'change' }],
  contactPhone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}(\d|X|x)$/, message: '请输入18位有效身份证号', trigger: 'blur' }
  ],
  departmentName: [{ required: true, message: '请输入科室名称', trigger: 'blur' }],
  visitType: [{ required: true, message: '请选择就诊类型', trigger: 'change' }],
  visitDate: [{ type: 'string', required: true, message: '请选择就诊时间', trigger: 'change' }] // 日期类型用string校验
  // 其他字段根据后端要求和实际情况添加校验
});


// 弹窗关闭前的处理
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确定要关闭此弹窗吗？未保存的数据会丢失哦！')
    .then(() => {
      resetForm(ruleFormRef.value); // 关闭前重置表单，保持良好习惯
      done();
    })
    .catch(() => {
      // 用户点击取消，不关闭弹窗
    });
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('提交的数据:', RegistraPatientForm);
      try {

        const result = await UserAPI.AddPatient(RegistraPatientForm);

        if (result.isSuc || result == undefined) {
          ElMessage.success('患者信息提交成功！🎉');
          PatientdialogVisible.value = false; // 提交成功后关闭弹窗
          emit('submitSuccess'); // 触发提交成功事件，通知父组件刷新列表等
        } else {
          ElMessage.error(result.msg || '患者信息提交失败，请重试！😢');
        }
      } catch (error: any) {
        ElMessage.error('网络请求失败或系统异常：' + (error.message || '未知错误'));
        console.error('提交患者信息出错:', error);
      }
    } else {
      console.log('表单验证失败！请检查必填项和格式。', fields);
      ElMessage.warning('请检查表单中的必填项或格式错误！');
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields(); // 重置表单所有字段
  // 手动重置一些非form-item绑定的值或者默认值
  RegistraPatientForm.gender = 1; // 默认值
  RegistraPatientForm.isInfectiousDisease = false; // 默认值
  RegistraPatientForm.diseaseOnsetTime = new Date; // 默认值
  RegistraPatientForm.visitType = '初诊'; // 默认值
  RegistraPatientForm.visitDate = new Date().toISOString(); // 默认值
  RegistraPatientForm.temperature = 36.5;
  RegistraPatientForm.pulse = 75;
  RegistraPatientForm.breath = 18;
};

// 暴露一些方法和数据给父组件使用，例如在父组件调用 resetForm
defineExpose({
  resetForm
});
</script>

<style scoped>
/* 可以根据需要添加 scoped 样式 */
.dialog-footer {
  text-align: right;
  /* 让按钮靠右对齐 */
}
</style>
