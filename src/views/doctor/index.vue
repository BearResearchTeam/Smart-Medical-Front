<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="DepartmentName">
          <el-input v-model="queryParams.EmployeeName" placeholder="科室名称" @keyup.enter="handleQuery" />
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
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleAddDoctor">
            新增
          </el-button>
          <el-button type="danger" :disabled="selectIds.length === 0" icon="delete" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData.data" default-expand-all class="data-table__content"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="130" />
        <el-table-column prop="departmentName" label="科室名称" width="130" />
        <el-table-column prop="employeeId" label="工号" width="130" />
        <el-table-column prop="employeeName" label="医生名称" width="200" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isActive == 'true'" type="success">正常</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>


        <el-table-column label="操作" fixed="right" align="left" width="200">
          <template #default="scope">
            <el-button type="primary" link size="small" icon="edit" @click.stop="handleOpenDialog(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" icon="delete" @click.stop="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="tableData.totleCount > 0" v-model:total="tableData.totleCount"
        v-model:page="queryParams.SkipCount" v-model:limit="queryParams.MaxResultCount" @pagination="handleQuery" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" @closed="handleCloseDialog">
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">


        <el-form-item label="科室名称" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择科室" filterable>
            <el-option v-for="item in deptOptions" :key="item.id" :label="item.departmentName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="医生单号" prop="employeeId">
          <el-input v-model="formData.employeeId" placeholder="请输入医生单号" />
        </el-form-item>

        <el-form-item label="医生名称" prop="directorName">
          <el-input v-model="formData.employeeName" placeholder="请输入医生名称" />
        </el-form-item>
        <el-form-item label="账号标识" prop="accountId">
          <el-input v-model="formData.accountId" placeholder="请输入账号标识" />
        </el-form-item>
        <el-form-item label="机构名称" prop="institutionName">
          <el-input v-model="formData.institutionName" placeholder="请输入机构名称" />
        </el-form-item>

        <el-form-item label="医生是否请假">
          <el-radio-group v-model="formData.isActive">
            <el-radio :value="true">正常</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "doctor",
  inheritAttrs: false,
});
import DeptAPI from "@/api/doctor/doctordept.api";
import DoctorAPI, { DoctorPageVO, DoctorPageQuery, DoctorForm, DoctorListResponse } from "@/api/doctor/doctor.api";

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DoctorPageQuery>({
  EmployeeName: "",
  Sorting: 1,
  SkipCount: 1,
  MaxResultCount: 3
});

const dialog = reactive({
  title: "",
  visible: false,
});


// 将 deptList 替换为 tableData
const tableData = reactive<DoctorListResponse>({
  data: [],
  totleCount: 0,
  totlePage: 0,
});

const formData = reactive<DoctorForm>({
  id: "",
  departmentId: "",
  isActive: true,
  accountId: "",
  employeeId: "",
  employeeName: "",
  institutionName: "",
  departmentName: "",
});

const rules = reactive({
  parentId: [{ required: true, message: "上级部门不能为空", trigger: "change" }],
  name: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  code: [{ required: true, message: "部门编号不能为空", trigger: "blur" }],
  sort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
});

// 1. 定义下拉数据
const deptOptions: any = ref<{ id: string; departmentName: string }>();

// 2. 获取科室列表
async function fetchDeptOptions() {
  const res = await DeptAPI.getdept();
  deptOptions.value = res;
  console.log("打印科室列表", res);
}

// 显示科室列表
async function handleQuery() {
  loading.value = true;
  const param = {
    EmployeeName: queryParams.EmployeeName,
    Sorting: queryParams.Sorting,
    SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount,
    MaxResultCount: queryParams.MaxResultCount,
  }
  const res = await DoctorAPI.getdoctorPage(param);
  console.log("打印完整响应对象", res); // 打印完整响应对象
  tableData.data = res.data || [];
  tableData.totleCount = res.totleCount;
  tableData.totlePage = res.totlePage;
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
 * 打开科室弹窗
 * @param deptId 科室ID
 */
async function handleOpenDialog(dept?: any) {

  console.log("打开科室弹窗，deptId:", dept.id); // 打印传入的 deptId
  dialog.visible = true;
  if (dept.id) {
    dialog.title = "修改科室";
    //formData. = dept.type;
    Object.assign(formData, dept); // 使用 Object.assign 合并对象
    // DeptAPI.getFormData(deptId).then((data) => {
    //   Object.assign(formData, data);
    // });
  } else {
    dialog.title = "新增科室";
    //formData.parentId = parentId || "0";
  }
}

// 提交科室表单
async function handleSubmit() {
  deptFormRef.value.validate(async (valid: any) => {
    if (valid) {
      loading.value = true;
      if (!formData.id) {
        await DoctorAPI.createdoctor(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        await DoctorAPI.updatedoctor(formData.id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 删除科室
function handleDelete(deptId?: number) {
  const deptIds = [deptId || selectIds.value].join(",").toString();

  if (!deptIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      console.log("deptIds:", deptIds); // 打印要删除科室ID
      loading.value = true;
      DoctorAPI.deletedoctor(deptIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
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

function handleAddDoctor() {
  dialog.title = "新增医生";
  dialog.visible = true;
  Object.assign(formData, {
    id: undefined,
    departmentId: "",
    isActive: true,
    accountId: "",
    employeeId: "",
    employeeName: "",
    institutionName: "",
    departmentName: ""
  });
}

onMounted(() => {
  fetchDeptOptions();
  handleQuery();
});

</script>
