<template>
  <div class="app-container" v-if="canViewPage">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="DepartmentName">
          <el-input v-model="queryParams.EmployeeName" placeholder="医生名称" @keyup.enter="handleQuery" />
        </el-form-item>


        <el-form-item class="search-buttons">
          <el-button class="filter-item" type="primary" icon="search" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">

      <el-table v-loading="loading" :data="filteredTableData" default-expand-all class="data-table__content"
        @selection-change="handleSelectionChange" stripe highlight-current-row border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="130" />
        <el-table-column prop="auditName" label="审核人" width="130" />
        <el-table-column prop="departmentName" label="科室名称" width="130" />
        <el-table-column prop="employeeId" label="工号" width="130" />
        <el-table-column prop="employeeName" label="医生名称" width="200" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isActive === 0" type="primary">待审核</el-tag>
            <el-tag v-if="scope.row.isActive === 1" type="success">通过</el-tag>
            <el-tag v-if="scope.row.isActive === 2" type="danger">驳回</el-tag>

          </template>
        </el-table-column>
        <el-table-column prop="auditDesc" label="审核意见" width="200" />


        <el-table-column label="操作" fixed="right" align="left" width="200">
          <template #default="scope">
            <div class="table-action-row">
              <el-button type="primary" link size="small" icon="view" @click.stop="handleOpenDialog(scope.row)">
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="tableData.totleCount > 0" v-model:total="tableData.totleCount"
        v-model:page="queryParams.SkipCount" v-model:limit="queryParams.MaxResultCount" @pagination="handleQuery" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" @closed="handleCloseDialog">
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="医生姓名" prop="employeeName">
          <el-input v-model="formData.employeeName" placeholder="请输入医生姓名" :readonly="isAuditDialog" />
        </el-form-item>
        <el-form-item label="医生个人证件照" prop="Doctorimgs">
          <el-upload class="avatar-uploader" :action="baseURL" :show-file-list="false" :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload" :disabled="isAuditDialog">
            <img v-if="formData.doctorimgs" :src="formData.doctorimgs" class="avatar" />
            <i v-else-if="!isAuditDialog" class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="科室名称" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择科室" filterable :disabled="isAuditDialog">
            <el-option v-for="item in deptOptions" :key="item.id" :label="item.departmentName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="医生单号" prop="employeeId">
          <el-input v-model="formData.employeeId" placeholder="请输入医生单号" :readonly="isAuditDialog" />
        </el-form-item>



        <el-form-item label="医生手机号" prop="employeePhone">
          <el-input v-model="formData.employeePhone" placeholder="请输入医生手机号" :readonly="isAuditDialog" />
        </el-form-item>
        <el-form-item label="医生性别" prop="sex">
          <el-radio-group v-model="formData.sex" :disabled="isAuditDialog">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="医生职称" prop="accountId">
          <el-input v-model="formData.accountId" placeholder="请输入账号标识" :readonly="isAuditDialog" />
        </el-form-item>
        <el-form-item label="机构名称" prop="institutionName">
          <el-input v-model="formData.institutionName" placeholder="请输入机构名称" :readonly="isAuditDialog" />
        </el-form-item>

        <el-form-item label="医生擅长" prop="doctorGoodat">
          <el-input v-model="formData.doctorGoodat" :readonly="isAuditDialog" />
        </el-form-item>
        <el-form-item label="医生简介" prop="desc">
          <el-input v-model="formData.desc" type="textarea" :readonly="isAuditDialog" />
        </el-form-item>

        <el-form-item label="医生证书" prop="certificate">
          <el-upload class="certificate-uploader" :action="baseURL" :show-file-list="false"
            :on-success="handleCertificateSuccess" :disabled="isAuditDialog">
            <img v-if="formData.certificate" :src="formData.certificate" class="certificate" />
            <i v-else-if="!isAuditDialog" class="el-icon-plus certificate-uploader-icon"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="医生是否审核" v-if="formData.id !== undefined">
          <el-radio-group v-model="formData.isActive">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-form-item label="审核意见" prop="auditDesc">
        <el-input v-model="formData.auditDesc" type="textarea" :readonly="isAuditDialog" />
      </el-form-item>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
  <div v-else>
    <span>当前无与您相关的审核记录</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "doctor",
  inheritAttrs: false,
});
import { ref, reactive, onMounted } from 'vue';
import DeptAPI from "@/api/doctor/doctordept.api";
import DoctorAPI, { DoctorAuditform, DoctorPageVO, DoctorPageQuery, DoctorForm, DoctorListResponse } from "@/api/doctor/doctor.api";
import { computed } from 'vue';
import type { UploadProps } from 'element-plus'
import request from "@/utils/request";
import { useUserStore } from '@/store';
const userStore = useUserStore();
const baseURL = ref(request.defaults.baseURL + "api/Imgs/UploadFile");
const handleCertificateSuccess = (res: any) => {
  formData.certificate = request.defaults.baseURL + res
  console.log(res)
}

const handleAvatarSuccess = (res: any) => {
  formData.doctorimgs = request.defaults.baseURL + res
  console.log(res)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
const queryFormRef = ref();
const deptFormRef = ref();
const viewFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DoctorPageQuery>({
  States: 0,
  EmployeeName: "",
  Sorting: 1,
  SkipCount: 1,
  MaxResultCount: 5
});

const dialog = reactive({
  title: "",
  visible: false,
});

const viewDialog = reactive({
  title: "",
  visible: false,
});

// 将 deptList 替换为 tableData
const tableData = reactive<DoctorListResponse>({
  data: [],
  totleCount: 0,
  totlePage: 0,
});

const formData = reactive<DoctorAuditform>({
  id: undefined,
  "departmentId": "",
  "isActive": 0,
  "doctorimgs": "",
  "accountId": "",
  "employeeId": "",
  "employeeName": "",
  "employeePhone": "",
  "sex": 0,
  "institutionName": "",
  "departmentName": "",
  "doctorGoodat": "",
  "desc": "",
  "certificate": "",
  "auditName": "",
  "auditDesc": ""
});

const viewFormData = reactive<DoctorForm>({
  id: undefined,
  "departmentId": undefined,
  "isActive": 0,
  "doctorimgs": "",
  "accountId": "",
  "employeeId": "",
  "employeeName": "",
  "employeePhone": "",
  "sex": 0,
  "institutionName": "",
  "departmentName": "",
  "doctorGoodat": "",
  "desc": "",
  "certificate": "",
  "auditName": ""
});

const rules = reactive({
  departmentId: [{ required: true, message: "科室名称不能为空", trigger: "change" }],
  employeeId: [{ required: true, message: "工号不能为空", trigger: "blur" }],
  employeeName: [{ required: true, message: "医生名称不能为空", trigger: "blur" }],
  //sort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
});

// 1. 定义下拉数据
const deptOptions: any = ref<{ id: string; departmentName: string }>();

// 2. 获取科室列表
async function fetchDeptOptions() {
  const res = await DeptAPI.getdept();
  deptOptions.value = res;
  console.log("打印科室列表", res);
}

// 显示医生列表
async function handleQuery() {
  loading.value = true;
  const param = {
    States: 1 || 2,
    EmployeeName: queryParams.EmployeeName,
    Sorting: queryParams.Sorting,
    SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount,
    MaxResultCount: queryParams.MaxResultCount,
  }
  const res = await DoctorAPI.getdoctorPage(param);
  console.log("打印完整显示医生列表响应对象", res); // 打印完整响应对象
  tableData.data = res.data || [];
  tableData.totleCount = res.totleCount || 0;
  tableData.totlePage = res.totlePage || 0;
  loading.value = false;
  console.log("打印部门数据数组", res.data); // 打印部门数据数组
}
// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 处理选中项变化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开记录弹窗
 * 
 */
async function handleOpenDialog(row?: any) {
  dialog.title = row.employeeName + "-审核记录详情";
  Object.assign(formData, row); // 使用 Object.assign 合并对象

  console.log("打开弹窗，deptId:", row); // 打印传入的 deptId
  dialog.visible = true;
  // if (dept.id) {
  //   dialog.title = "审核";

  // } else {
  //   dialog.title = "新增医生";
  //   //formData.parentId = parentId || "0";
  // }
}



// 重置表单
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();

  formData.id = undefined; // 确保 id 属性重置
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}





const isAuditDialog = computed(() => dialog.visible);

// 检查当前用户是否有权限查看页面
const canViewPage = computed(() => {
  // 检查当前用户是否是任何一条记录中的审核人或医生
  return tableData.data.some(item =>
    item.auditName === userStore.userInfo.username ||
    item.employeeName === userStore.userInfo.username
  );
});

// 过滤出当前用户有权限查看的记录
const filteredTableData = computed(() => {
  return tableData.data.filter(item =>
    item.auditName === userStore.userInfo.username ||
    item.employeeName === userStore.userInfo.username
  );
});

onMounted(() => {
  fetchDeptOptions();
  handleQuery();
});

</script>

<style scoped>
.app-container {
  padding: 24px;
  background: #f4f6fa;
  min-height: 100vh;
}

.search-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.search-buttons {
  margin-left: 16px;
}

.data-table {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.data-table__toolbar {
  display: flex;
  justify-content: flex-start;
  padding: 12px 0 12px 0;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

.data-table__toolbar--actions .el-button {
  margin-right: 10px;
}

.data-table__content {
  border-radius: 8px;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th,
.el-table td {
  text-align: center;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #f8fafd;
}

.el-dialog {
  border-radius: 12px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 0 0 0;
}

.el-form-item {
  margin-bottom: 22px;
}

.table-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.certificate-uploader .certificate {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 8px;
  object-fit: contain;
  max-width: 120px;
  max-height: 120px;
}
</style>
