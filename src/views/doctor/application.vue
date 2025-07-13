<template>
  <div class="app-container">

    <el-button type="primary" @click="dialogVisible = true" class="flow-btn">审批流转设置</el-button>

    <!-- 医生信息表单（弹窗外） -->
    <div class="dialog-form-box">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="医生姓名" prop="employeeName">
          <el-input v-model="form.employeeName" />
        </el-form-item>
        <el-form-item label="所属科室" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择科室" filterable>
            <el-option v-for="item in deptOptions" :key="item.id" :label="item.departmentName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="医生职称" prop="accountId">
          <el-input v-model="form.accountId" />
        </el-form-item>
        <!-- <el-form-item label="医生工号" prop="EmployeeId">
          <el-input v-model="form.EmployeeId" readonly />
        </el-form-item> -->
        <el-form-item label="医生手机号" prop="employeePhone">
          <el-input v-model="form.employeePhone" maxlength="11" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio v-for="item in genderOptions" :key="item.dictionaryLabel" :label="item.dictionaryLabel">{{
              item.dictionaryValue }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="机构名称" prop="institutionName">
          <el-input v-model="form.institutionName" />
        </el-form-item>
        <el-form-item label="医生擅长" prop="doctorGoodat">
          <el-input v-model="form.doctorGoodat" />
        </el-form-item>
        <el-form-item label="医生简介" prop="desc">
          <el-input v-model="form.desc" type="textarea" />
        </el-form-item>
        <el-form-item label="医生证书" prop="certificate">
          <el-upload class="certificate-uploader" :action="baseURL" :show-file-list="false"
            :on-success="handleCertificateSuccess" :before-upload="beforeCertificateUpload">
            <img v-if="form.certificate" :src="form.certificate" class="certificate" />
            <i v-else class="el-icon-plus certificate-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="医生个人证件照" prop="Doctorimgs">
          <el-upload class="avatar-uploader" :action="baseURL" :show-file-list="false" :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="form.doctorimgs" :src="form.doctorimgs" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="submitAuditadd">提交医生表单</el-button>
    </div>

    <!-- 审批流转设置弹窗 -->
    <el-dialog v-model="dialogVisible" width="500px" :show-close="false" class="flow-dialog">
      <template #header>
        <el-button type="primary" class="dialog-title-btn">审批流转设置</el-button>
      </template>
      <div class="dialog-form-box">
        <el-form :model="form" ref="formRef2" label-width="100px">
          <el-form-item label="审核人" prop="auditName">
            <el-cascader v-model="form.auditName" :options="roleUserOptions"
              :props="{ checkStrictly: true, emitPath: false }" placeholder="请选择审核人" clearable />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import request from "@/utils/request";
import { onMounted, ref, reactive } from 'vue'
import DeptAPI from "@/api/doctor/doctordept.api";
import DoctorAPI, { DoctorPageVO, DoctorPageQuery, DoctorForm, DoctorListResponse } from "@/api/doctor/doctor.api";
import type { UploadProps } from 'element-plus'
import { useUserStore } from "@/store";
const dialogVisible = ref(false)
const formRef = ref()
const formRef2 = ref()
const baseURL = ref(request.defaults.baseURL + "api/Imgs/UploadFile")
const userStore = useUserStore();
// 只取“性别”类型
const genderOptions: any = computed(() =>
  userStore.dictypeselectdata.filter((item: any) => item.dictionaryDataType === "sys_sex")

);
const handleAvatarSuccess = (res: any) => {
  form.doctorimgs = request.defaults.baseURL + res
  console.log(res)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/gif') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
const handleCertificateSuccess = (res: any) => {
  form.certificate = request.defaults.baseURL + res
  console.log(res)
}

const beforeCertificateUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/gif') {
    ElMessage.error('图片格式不是JPG/PNG/gif格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不超过 2MB!')
    return false
  }
  return true
}
const form = reactive({
  id: undefined,
  departmentId: undefined,
  isActive: 0,
  "doctorimgs": "",
  "accountId": "",
  "employeeId": "",
  "employeeName": "",
  "employeePhone": "",
  "sex": 1,
  "institutionName": "",
  "departmentName": "",
  "doctorGoodat": "",
  "desc": "",
  "certificate": "",
  "auditName": ""
})

const rules = {
  employeeName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  departmentId: [{ required: true, message: '科室不能为空', trigger: 'change' }],
  accountId: [{ required: true, message: '职称不能为空', trigger: 'blur' }],
  employeePhone: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
  institutionName: [{ required: true, message: '机构名称不能为空', trigger: 'blur' }],
  doctorGoodat: [{ required: true, message: '医生擅长不能为空', trigger: 'blur' }],
  desc: [{ required: true, message: '医生简介不能为空', trigger: 'blur' }],
  certificate: [{ required: true, message: '医生证书不能为空', trigger: 'blur' }]
}
// function handleAvatarSuccess(res: any, file: any) {
//   form.doctorimgs = URL.createObjectURL(file.raw)
// }


function submitAudit() {
  // 审批流转设置提交逻辑
  dialogVisible.value = false
}
// 1. 定义下拉数据
const deptOptions: any = ref<{ id: string; departmentName: string }>();

// 2. 获取科室列表
async function fetchDeptOptions() {
  const res = await DeptAPI.getdept();
  deptOptions.value = res;
  console.log("打印科室列表", res);
}

// 审核人下拉数据
const roleUserOptions = ref<any[]>([]);

async function fetchRoleUserOptions() {
  const res = await DoctorAPI.getRoleUserGroupDto();
  console.log("打印审核人列表", res);
  roleUserOptions.value = (res || []).map((role: any) => ({
    value: role.roleName,
    label: role.roleName,
    children: (role.users || []).map((user: any) => ({
      value: user.userName,
      label: user.userName
    }))
  }));
}

const submitAuditadd = async () => {
  console.log("提交医生表单", form)
  await DoctorAPI.createdoctor(form)
  ElMessage.success("提交成功")

}

onMounted(() => {
  fetchDeptOptions();
  fetchRoleUserOptions();
  console.log("userStore.dictypeselectdata", userStore.dictypeselectdata)
});
</script>

<style scoped>
/* 复用原有样式 */
.flow-btn {
  margin-bottom: 20px;
}

.dialog-form-box {
  border: 2px solid #ff4d4f;
  border-radius: 8px;
  padding: 24px 32px 0 32px;
  margin-top: 10px;
}

.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  display: block;
  border-radius: 50%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.flow-dialog .el-dialog__header {
  padding: 0;
}

.dialog-title-btn {
  margin: 20px 0 0 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px 6px 0 0;
}

.certificate-uploader .certificate {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 8px;
}

.certificate-uploader-icon {
  font-size: 32px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.certificate-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.certificate-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.certificate-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>