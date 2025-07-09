<template>
  <!-- 处方管理 -->
  <div class="common-layout">
    <el-container>
      <el-aside width="260px">
        &nbsp;&nbsp;&nbsp;
        <el-input v-model="filterText" class="w-60 mb-2" placeholder="请选择" style="margin-top: 20px;" />

        <el-tree ref="treeRef" style="max-width: 600px" class="filter-tree" :data="pretree" :props="treeProps"
          default-expand-all :filter-node-method="filterNode" @node-click="handleTreeNodeClick" />

      </el-aside>
      <el-container>
        <el-header>
          <!-- 搜索区域 -->
          <div class="search-container">
            <el-form ref="queryFormRef" :model="queryParams" :inline="true">
              <el-form-item label="关键字" prop="DrugName">
                <el-input v-model="queryParams.DrugName" placeholder="药品名称" @keyup.enter="handleQuery" />
              </el-form-item>


              <el-form-item class="search-buttons">
                <el-button class="filter-item" type="primary" icon="search" @click="handleQuery">
                  搜索
                </el-button>
                <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-header>
        <el-main>
          <el-card shadow="hover" class="data-table">
            <div class="data-table__toolbar">
              <div class="data-table__toolbar--actions">
                <!-- <el-button type="success" icon="plus" @click="handleOpenDialog(1)">
                  新增
                </el-button> -->
                <!-- <el-button type="danger" :disabled="selectIds.length === 0" icon="delete" @click="handleDelete()">
                  删除
                </el-button> -->
              </div>
            </div>

            <el-table v-loading="loading" :data="tableData" default-expand-all class="data-table__content"
              @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column type="index" label="序号" width="130" />
              <el-table-column prop="drugName" label="药品名称" width="130" />
              <el-table-column prop="drugType" label="药品类型" width="130" />
              <el-table-column prop="feeName" label="费用类型" width="200" />
              <el-table-column prop="dosageForm" label="剂型" width="130" />
              <el-table-column prop="specification" label="规格" width="130" />
              <el-table-column prop="salePrice" label="售价" width="130" />

              <el-table-column prop="effect" label="药功效" width="100" />

              <el-table-column label="操作" fixed="right" align="left" width="200">
                <template #default="scope">
                  <!-- <el-button type="primary" link size="small" icon="edit" @click.stop="handleOpenDialog(scope.row)">
                    编辑
                  </el-button> -->
                  <el-button type="danger" link size="small" icon="delete" @click.stop="handleDelete(scope.row.id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- <pagination v-if="tableData.totalCount > 0" v-model:total="tableData.totalCount"
              v-model:page="queryParams.PageIndex" v-model:limit="queryParams.PageSize" @pagination="handleQuery" /> -->
          </el-card>

        </el-main>
      </el-container>
    </el-container>
  </div>



  <div class="app-container">

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
  name: "Prescripiton",
  inheritAttrs: false,
});

import PrescriptionAPI, { PrescriptionTree } from "@/api/prescription/prescriptionapi";
import type { FilterNodeMethodFunction, TreeInstance } from 'element-plus'
import { watch } from 'vue';

interface Tree {
  [key: string]: any
}

const filterText = ref('')
const treeRef = ref<TreeInstance>()
//处方树形信息
const pretree = ref<PrescriptionTree[]>([]); // 这里用 any[] 或 PrescriptionTree[]，确保是数组
const filterNode: FilterNodeMethodFunction = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}
const pid = ref(0);
const treeProps = {
  value: 'value',
  label: 'label',
  children: 'children'
}
onMounted(() => {
  predatalist();
});
//处方树形列表
const predatalist = async () => {

  const param = { pid: null }
  const result = await PrescriptionAPI.Prescriptiontreelist(param);
  pretree.value = result || []; // 只赋值 data 字段
  console.log(result);
};
const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive({
  DrugName: ""
});

const dialog = reactive({
  title: "",
  visible: false,
});

// 定义表格数据类型
interface TableDataType {
  pageData: "";
  totalCount: number;
  totalPage: number;
}

// 将 deptList 替换为 tableData
const tableData = ref();

const formData = reactive({
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

const selectedPrescriptionId = ref<number | null>(null);

// 显示处方列表
async function handleQuery() {
  loading.value = true;
  const param: any = {
    prescriptionid: selectedPrescriptionId.value || filterText.value,
    DrugName: queryParams.DrugName,
  };


  const result = await PrescriptionAPI.getPrescriptionList(param);
  tableData.value = result;
  loading.value = false;
  console.log("打印处方数据数组", result);
  //console.log("打印完整响应对象", res1); // 打印完整响应对象
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  selectedPrescriptionId.value = null; // 先清空选中
  handleQuery(); // 再查全部
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

// 点击树节点时，将节点label赋值到输入框
function handleTreeNodeClick(data: any) {
  filterText.value = data.label;
  selectedPrescriptionId.value = data.value; // 保存 value
  handleQuery(); // 选中后自动查询
}

onMounted(() => {
  handleQuery();
});

</script>
