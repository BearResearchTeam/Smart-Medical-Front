<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="DepartmentName">
          <el-input v-model="queryParams.DepartmentName" placeholder="部门名称" @keyup.enter="handleQuery" />
        </el-form-item>

        <!-- <el-form-item label="部门状态" prop="status">
          <el-select v-model="queryParams." placeholder="全部" clearable style="width: 100px">
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item> -->

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
          <el-button v-hasPerm="['sys:dept:add']" type="success" icon="plus" @click="handleOpenDialog()">
            新增
          </el-button>
          <el-button v-hasPerm="['sys:dept:delete']" type="danger" :disabled="selectIds.length === 0" icon="delete"
            @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="deptList"  default-expand-all class="data-table__content"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" min-width="200" />
        <el-table-column prop="departmentName" label="科室名称" width="200" />
        <el-table-column prop="departmentCategory" label="科室大类" width="200" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="directorName" label="负责人名称" width="200" />
        <el-table-column prop="doctorCount" label="医师人数" width="200" />
        <el-table-column prop="pharmacistCount" label="药师人数" width="200" />
        <el-table-column prop="nurseCount" label="护士人数" width="200" />

        <el-table-column prop="type" label="状态" width="100">
          <template #default="scope">
            <el-tag v-model="scope.row.type" type="success">启用</el-tag>
            <el-tag v-model="scope.row.type" type="info">禁用</el-tag>
          </template>
        </el-table-column>


        <el-table-column label="操作" fixed="right" align="left" width="200">
          <template #default="scope">
            <el-button v-hasPerm="['sys:dept:add']" type="primary" link size="small" icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)">
              新增
            </el-button>
            <el-button v-hasPerm="['sys:dept:edit']" type="primary" link size="small" icon="edit"
              @click.stop="handleOpenDialog(scope.row.id)">
              编辑
            </el-button>
            <el-button v-hasPerm="['sys:dept:delete']" type="danger" link size="small" icon="delete"
              @click.stop="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
          <el-input-number v-model="formData.address" controls-position="right" style="width: 100px" :min="0" />
        </el-form-item>

        <el-form-item label="科室负责人姓名" prop="departmentCategory">
          <el-input v-model="formData.departmentCategory" placeholder="请输入科室负责人姓名" />
        </el-form-item>
        <el-form-item label="医师人数" prop="departmentCategory">
          <el-input v-model="formData.departmentCategory" placeholder="请输入医师人数" />
        </el-form-item>
        <el-form-item label="药师人数" prop="departmentCategory">
          <el-input v-model="formData.departmentCategory" placeholder="请输入药师人数" />
        </el-form-item>
        <el-form-item label="护士人数" prop="departmentCategory">
          <el-input v-model="formData.departmentCategory" placeholder="请输入护士人数" />
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

import DeptAPI, { DeptForm, DeptQuery } from "@/api/doctordept/doctordept.api";

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DeptQuery>({
  DepartmentName: "",
  PageIndex: 1,
  PageSize: 3,
  "totleCount": 0,
  "totlePage": 0,
});

const dialog = reactive({
  title: "",
  visible: false,
});

const deptList = ref<DeptForm[]>();
const deptOptions = ref<OptionType[]>();
const formData = reactive<DeptForm>({
  /** 部门ID(新增不填) */
 // id: "",
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
  // DeptAPI.getList(queryParams).then((data) => {
  //   deptList.value = data;
  //   loading.value = false;
  // });
  const param = {
    DepartmentName: queryParams.DepartmentName,
    PageIndex: queryParams.PageIndex,
    PageSize: queryParams.PageSize,
  }
  const res = await DeptAPI.getdeptlist(param);
  deptList.value = res.data || [];
  console.log("123", res.data);
  queryParams.totleCount = res.data.totleCount;
  queryParams.totlePage = res.data.totlePage;


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
 * 打开部门弹窗
 *
 * @param parentId 父部门ID
 * @param deptId 部门ID
 */
async function handleOpenDialog(deptId?: string) {
  // 加载部门下拉数据
  // const data = await DeptAPI.getOptions();
  // deptOptions.value = [
  //   {
  //     value: "0",
  //     label: "顶级部门",
  //     children: data,
  //   },
  // ];

  dialog.visible = true;
  if (deptId) {
    dialog.title = "修改部门";
    DeptAPI.getFormData(deptId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增部门";
    //formData.parentId = parentId || "0";
  }
}

// 提交部门表单
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const deptId = formData.id;
      if (deptId) {
        DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DeptAPI.create(formData)
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

// 删除部门
function handleDelete(deptId?: number) {
  const deptIds = [deptId || selectIds.value].join(",");

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

  formData.id = undefined;
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
