<template>
  <!-- 处方管理 -->
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="DepartmentName">
          <el-input v-model="queryParams.DepartmentName" placeholder="科室名称" @keyup.enter="handleQuery" />
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
          <el-button type="success" icon="plus" @click="handleOpenDialog(1)">
            新增
          </el-button>
          <el-button type="danger" :disabled="selectIds.length === 0" icon="delete" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData.pageData" default-expand-all class="data-table__content"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="130" />
        <el-table-column prop="departmentName" label="科室名称" width="130" />
        <el-table-column prop="departmentCategory" label="科室大类" width="130" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="directorName" label="负责人名称" width="130" />
        <el-table-column prop="doctorCount" label="医师人数" width="130" />
        <el-table-column prop="pharmacistCount" label="药师人数" width="130" />
        <el-table-column prop="nurseCount" label="护士人数" width="130" />

        <el-table-column prop="type" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === '正常'" type="success">正常</el-tag>
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

      <pagination v-if="tableData.totalCount > 0" v-model:total="tableData.totalCount"
        v-model:page="queryParams.PageIndex" v-model:limit="queryParams.PageSize" @pagination="handleQuery" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" @closed="handleCloseDialog">
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">

        <el-form-item label="科室名称" prop="departmentName">
          <el-input v-model="formData.departmentName" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="科室大类" prop="departmentCategory">
          <el-input v-model="formData.departmentCategory" placeholder="请输入科室大类" />
        </el-form-item>
        <el-form-item label="科室地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入科室地址" />

        </el-form-item>

        <el-form-item label="科室负责人姓名" prop="directorName">
          <el-input v-model="formData.directorName" placeholder="请输入科室负责人姓名" />
        </el-form-item>
        <el-form-item label="医师人数" prop="doctorCount">
          <!-- <el-input v-model="formData.doctorCount" placeholder="请输入医师人数" /> -->
          <el-input-number v-model="formData.doctorCount" controls-position="right" style="width: 100px" :min="0" />
        </el-form-item>
        <el-form-item label="药师人数" prop="pharmacistCount">
          <el-input-number v-model="formData.pharmacistCount" controls-position="right" style="width: 100px" :min="0" />
        </el-form-item>
        <el-form-item label="护士人数" prop="nurseCount">
          <el-input-number v-model="formData.nurseCount" controls-position="right" style="width: 100px" :min="0" />
        </el-form-item>
        <el-form-item label="科室类型">
          <el-radio-group v-model="formData.type">
            <el-radio value="正常">正常</el-radio>
            <el-radio value="禁用">禁用</el-radio>
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
  name: "Dept",
  inheritAttrs: false,
});

import DeptAPI, { DeptForm, DeptQuery, DeptListResponse } from "@/api/doctor/doctordept.api";

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DeptQuery>({
  DepartmentName: "",
  PageIndex: 1,
  PageSize: 2
});

const dialog = reactive({
  title: "",
  visible: false,
});

// 定义表格数据类型
interface TableDataType {
  pageData: DeptForm[];
  totalCount: number;
  totalPage: number;
}

// 将 deptList 替换为 tableData
const tableData = reactive<TableDataType>({
  pageData: [],
  totalCount: 0,
  totalPage: 0,
});

const formData = reactive<DeptForm>({
  /** 部门ID(新增不填) */
  id: undefined, // 确保 id 属性存在且未注释
  /** 部门名称 */
  "departmentName": "",
  "departmentCategory": "",
  "address": "",
  "directorName": "",
  "doctorCount": 0,
  "pharmacistCount": 0,
  "nurseCount": 0,
  "type": "启用"
});

const rules = reactive({
  parentId: [{ required: true, message: "上级部门不能为空", trigger: "change" }],
  name: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  code: [{ required: true, message: "部门编号不能为空", trigger: "blur" }],
  sort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
});

// 显示科室列表
async function handleQuery() {
  loading.value = true;
  const param = {
    DepartmentName: queryParams.DepartmentName,
    PageIndex: queryParams.PageIndex,
    PageSize: queryParams.PageSize,
  }
  const res1: DeptListResponse = await DeptAPI.getdeptlist(param);
  tableData.pageData = res1.data || [];
  tableData.totalCount = res1.totleCount;
  tableData.totalPage = res1.totlePage;
  loading.value = false;
  console.log("打印部门数据数组", res1.data); // 打印部门数据数组
  console.log("打印完整响应对象", res1); // 打印完整响应对象
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
    formData.type = dept.type;
    Object.assign(formData, dept); // 使用 Object.assign 合并对象
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
      const deptId = formData.id;
      console.log("deptId", deptId); // 打印表单数据
      if (deptId) {
        await DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        await DeptAPI.create(formData)
          .then(() => {
            ElMessage.success("新增成功");
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
      DeptAPI.deleteByIds(deptIds)
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

onMounted(() => {
  handleQuery();
});

</script>
