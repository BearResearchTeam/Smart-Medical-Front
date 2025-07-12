<template>
  <!-- 处方管理 -->
  <div class="common-layout">
    <el-container>
      <el-aside width="260px">
        <el-button type="success" plain size="small" icon="plus" @click="handlepreadd()"
          style="margin-left: 10px;margin-top: 10px;">
          新增处方
        </el-button>
        &nbsp;&nbsp;&nbsp;
        <el-input v-model="filterText" class="w-60 mb-2" placeholder="请选择处方" style="margin-top: 20px;" />

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
                <el-button type="success" icon="plus" @click="handleOpenDialog()">
                  新增
                </el-button>
                <el-button type="danger" :disabled="selectIds.length === 0 || !selectedPrescriptionId" icon="delete"
                  @click="handleDelete(selectedPrescriptionId)">
                  删除
                </el-button>
              </div>
            </div>

            <el-table v-loading="loading" :data="tableData" default-expand-all class="data-table__content"
              @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column type="index" label="序号" width="130" />
              <el-table-column prop="drugName" label="药品名称" width="130" />
              <el-table-column prop="drugType" label="药品类型" width="130" />
              <!-- <el-table-column prop="feeName" label="费用类型" width="200" /> -->
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
      <el-form ref="prescriptionFormRef" :model="formData" :rules="rules" label-width="80px">

        <el-form-item label="处方名称" prop="prescriptionId">
          <el-input v-model="selectedPrescriptionName" placeholder="请输入处方名称" />
        </el-form-item>

        <el-form-item label="处方药品" prop="drugIdsToDeleteString">
          <el-select v-model="formData.drugIdsToDeleteString" placeholder="请选择处方药品" filterable multiple collapse-tags
            style="width: 100%;">
            <el-option v-for="item in drugselect" :key="item.id" :label="item.drugName" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>

    </el-dialog>


    <el-dialog v-model="predialog.visible" :title="predialog.title" width="600px" @closed="handleClosepredialog">
      <el-form ref="prescriptiondataFormRef" :model="prescriptionformData" :rules="prerules" label-width="100px">

        <!-- 处方名称 -->
        <el-form-item label="处方名称" prop="prescriptionName">
          <el-input v-model="prescriptionformData.prescriptionName" placeholder="请输入处方名称" />
        </el-form-item>

        <!-- 处方（多选下拉框） -->
        <el-form-item label="处方">
          <el-select v-model="prescriptionformData.parentId" placeholder="请选择处方" style="width: 100%">
            <el-option v-for="item in prescriptiondata" :key="item.id" :label="item.prescriptionName"
              :value="item.id" />
          </el-select>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button type="primary" @click="prescriptionhandleSubmit">确 定</el-button>
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



const filterText = ref('')
const treeRef = ref<TreeInstance>()
//处方树形信息
const pretree = ref<PrescriptionTree[]>([]); // 这里用 any[] 或 PrescriptionTree[]，确保是数组
const filterNode: FilterNodeMethodFunction = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}
const treeProps = {
  value: 'value',
  label: 'label',
  children: 'children'
}
onMounted(() => {
  predatalist();
  drugselectlist();
});
//处方树形列表
const predatalist = async () => {

  const param = { pid: null }
  const result = await PrescriptionAPI.Prescriptiontreelist(param);
  pretree.value = result || []; // 只赋值 data 字段
  console.log(result);
};
const queryFormRef = ref();
const prescriptionFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive({
  DrugName: ""
});

const dialog = reactive({
  title: "",
  visible: false,
});
const predialog = reactive({
  title: "",
  visible: false,
});
// 关闭弹窗
function handleClosepredialog() {
  dialog.visible = false;
  resetForm();
}

const drugselect: any = ref([]);
const drugselectlist = async () => {
  const result = await PrescriptionAPI.drugselectlist();
  drugselect.value = result;
  console.log("药品下拉列表获取", result);
};


const tableData = ref();

const formData = reactive({
  prescriptionId: undefined,
  drugIdsToDeleteString: "",
  drudids: "",
});

const rules = reactive({
  parentId: [{ required: true, message: "上级部门不能为空", trigger: "change" }],
  name: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  code: [{ required: true, message: "部门编号不能为空", trigger: "blur" }],
  sort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
});

const selectedPrescriptionId = ref<number | undefined>(undefined);
const selectedPrescriptionName = ref<string>("");

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
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  selectedPrescriptionId.value = undefined; // 先清空选中
  handleQuery(); // 再查全部
}

// 处理选中项变化
function handleSelectionChange(selection: any) {
  // 假如你的药品唯一标识字段是 drugId
  selectIds.value = selection.map((item: any) => item.drugId);
}

/**
 * 打开处方弹窗
 * @param 处方
 */
async function handleOpenDialog(row?: any) {

  console.log("打开处方弹窗，deptId:", row); // 打印传入的 deptId
  dialog.visible = true;
  // 新增
  dialog.title = "新增处方的药品";
  formData.prescriptionId = selectedPrescriptionId.value; // 赋值id


}

// 提交处方下的药品表单
async function handleSubmit() {
  prescriptionFormRef.value.validate(async (valid: any) => {
    if (valid) {
      loading.value = true;
      //const deptId = formData.id;
      //console.log("deptId", deptId); // 打印表单数据
      console.log("formData.prescriptionId", formData.prescriptionId);
      console.log("formData.drugIdsToDeleteString", formData.drugIdsToDeleteString);
      const res = formData.drugIdsToDeleteString.join(',');
      await PrescriptionAPI.createPrescription(formData.prescriptionId, res);
      ElMessage.success("新增成功");
      dialog.visible = false;
      handleQuery();
      // if (deptId) {
      //   await DeptAPI.update(deptId, formData)
      //     .then(() => {
      //       ElMessage.success("修改成功");
      //       handleCloseDialog();
      //       handleQuery();
      //     })
      //     .finally(() => (loading.value = false));
      // } else {
      //   await DeptAPI.create(formData)
      //     .then(() => {
      //       ElMessage.success("新增成功");
      //       handleCloseDialog();
      //       handleQuery();
      //     })
      //     .finally(() => (loading.value = false));
      // }
    }
  });
}

// 删除
function handleDelete(preid?: number) {
  if (!preid) {
    ElMessage.warning("请先选择处方");
    return;
  }
  // 去重并拼接
  const drugIds = Array.from(new Set(selectIds.value)).join(",").toString();

  if (!drugIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      console.log("drugIds:", drugIds); // 打印要删除药品ID
      loading.value = true;
      console.log("preid:", preid);
      await PrescriptionAPI.basthdeletePrescription(preid, drugIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleQuery(); // 刷新表格
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
  prescriptionFormRef.value.resetFields();
  prescriptionFormRef.value.clearValidate();

  //formData.id = undefined; // 确保 id 属性重置
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 点击树节点时，将节点label赋值到输入框
function handleTreeNodeClick(data: any) {
  filterText.value = data.label;
  selectedPrescriptionId.value = data.value; // id
  selectedPrescriptionName.value = data.label; // 名称
  handleQuery(); // 选中后自动查询
}

const prescriptionformData = reactive({
  parentId: undefined, // 当前处方ID（用于编辑）
  prescriptionName: "",     // 新增/编辑的处方名称
  //drugIds: [] as number[],   // 处方关联的药品 ID 数组
});
const prerules = reactive({
  prescriptionName: [
    { required: true, message: '处方名称不能为空', trigger: 'blur' }
  ],
  drugIds: [
    { required: true, message: '请至少选择一个药品', trigger: 'change' }
  ]
});
const prescriptiondataFormRef = ref();
function handlepreadd() {
  predialog.title = "新增处方";
  predialog.visible = true;

  // 清空当前表单数据
  prescriptionformData.prescriptionName = "";
  //prescriptionformData.drugIds = [];
  prescriptionformData.id = undefined;

  // 如果你有表单验证，记得重置验证状态
  if (prescriptiondataFormRef.value) {
    prescriptiondataFormRef.value.resetFields();
  }
}
const prescriptiondata = ref();
const loadlistdata = async () => {
  prescriptiondata.value = await PrescriptionAPI.getprelistselect(selectedPrescriptionId.value);

};
async function prescriptionhandleSubmit() {
  prescriptiondataFormRef.value.validate(async (valid: any) => {
    if (valid) {
      try {
        await PrescriptionAPI.createPrescriptiondata(prescriptionformData);
        ElMessage.success("处方创建成功");
        predialog.visible = false;
        predatalist(); // 刷新树形结构
        handleQuery(); // 刷新表格
      } catch (error) {
        //ElMessage.error("处方创建失败");
        console.error("提交处方失败:", error);
      }
    } else {
      ElMessage.warning("请检查表单填写");
      return false;
    }
  });
}
onMounted(() => {
  loadlistdata();
  handleQuery();
});

</script>
