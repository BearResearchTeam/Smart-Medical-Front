<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="患者姓名" prop="PatientName">
          <el-input v-model="queryParams.PatientName" placeholder="请输入患者姓名" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号码" prop="Phone">
          <el-input v-model="queryParams.Phone" placeholder="请输入手机号码" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="身份证号" prop="IdCard">
          <el-input v-model="queryParams.IdCard" placeholder="请输入身份证号" @keyup.enter="handleQuery" />
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
            新增患者
          </el-button>
          <el-button type="danger" :disabled="selectIds.length === 0" icon="delete" @click="handleDelete()">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData.pageData" class="data-table__content"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.gender === '男'" type="primary">男</el-tag>
            <el-tag v-else type="danger">女</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="手机号码" width="130" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />
        <el-table-column prop="emergencyContact" label="紧急联系人" width="120" />
        <el-table-column prop="emergencyPhone" label="紧急联系电话" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '正常'" type="success">正常</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />

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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" @closed="handleCloseDialog">
      <el-form ref="patientFormRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="formData.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="formData.age" controls-position="right" style="width: 100%" :min="0"
                :max="150" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="formData.emergencyContact" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="formData.emergencyPhone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="病史" prop="medicalHistory">
          <el-input v-model="formData.medicalHistory" type="textarea" :rows="3" placeholder="请输入病史信息" />
        </el-form-item>

        <el-form-item label="过敏史" prop="allergies">
          <el-input v-model="formData.allergies" type="textarea" :rows="3" placeholder="请输入过敏史信息" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
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
  name: "Patient",
  inheritAttrs: false,
});

import PatientAPI, { PatientForm, PatientQuery, PatientListResponse } from "@/api/medical/patient.api";
import { ElMessage, ElMessageBox } from "element-plus";

const queryFormRef = ref();
const patientFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<PatientQuery>({
  PatientName: "",
  Phone: "",
  IdCard: "",
  PageIndex: 1,
  PageSize: 10
});

const dialog = reactive({
  title: "",
  visible: false,
});

// 定义表格数据类型
interface TableDataType {
  pageData: PatientForm[];
  totalCount: number;
  totalPage: number;
}

const tableData = reactive<TableDataType>({
  pageData: [],
  totalCount: 0,
  totalPage: 0,
});

const formData = reactive<PatientForm>({
  id: undefined,
  patientName: "",
  gender: "男",
  age: 0,
  phone: "",
  idCard: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  medicalHistory: "",
  allergies: "",
  status: "正常"
});

const rules = reactive({
  patientName: [{ required: true, message: "患者姓名不能为空", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  age: [{ required: true, message: "年龄不能为空", trigger: "change" }],
  phone: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ],
  idCard: [
    { required: true, message: "身份证号不能为空", trigger: "blur" },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: "请输入正确的身份证号", trigger: "blur" }
  ],
  address: [{ required: true, message: "地址不能为空", trigger: "blur" }],
  emergencyContact: [{ required: true, message: "紧急联系人不能为空", trigger: "blur" }],
  emergencyPhone: [
    { required: true, message: "紧急联系电话不能为空", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

// 显示患者列表
async function handleQuery() {
  loading.value = true;
  try {
    const param = {
      PatientName: queryParams.PatientName,
      Phone: queryParams.Phone,
      IdCard: queryParams.IdCard,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
    };
    const res: PatientListResponse = await PatientAPI.getPatientList(param);
    if (res.success) {
      tableData.pageData = res.data || [];
      tableData.totalCount = res.totleCount;
      tableData.totalPage = res.totlePage;
    } else {
      ElMessage.error(res.message || "获取患者列表失败");
    }
  } catch (error) {
    console.error("获取患者列表失败:", error);
    ElMessage.error("获取患者列表失败");
  } finally {
    loading.value = false;
  }
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

// 打开对话框
function handleOpenDialog(row?: PatientForm) {
  if (row) {
    dialog.title = "编辑患者信息";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增患者";
    Object.assign(formData, {
      id: undefined,
      patientName: "",
      gender: "男",
      age: 0,
      phone: "",
      idCard: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: "",
      allergies: "",
      status: "正常"
    });
  }
  dialog.visible = true;
}

// 关闭对话框
function handleCloseDialog() {
  dialog.visible = false;
  patientFormRef.value?.resetFields();
}

// 提交表单
async function handleSubmit() {
  try {
    await patientFormRef.value.validate();

    if (formData.id) {
      // 更新患者
      const res = await PatientAPI.updatePatient(formData);
      if (res.success) {
        ElMessage.success("更新患者信息成功");
        handleCloseDialog();
        handleQuery();
      } else {
        ElMessage.error(res.message || "更新患者信息失败");
      }
    } else {
      // 新增患者
      const res = await PatientAPI.addPatient(formData);
      if (res.success) {
        ElMessage.success("新增患者成功");
        handleCloseDialog();
        handleQuery();
      } else {
        ElMessage.error(res.message || "新增患者失败");
      }
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败");
  }
}

// 删除患者
async function handleDelete(id?: number) {
  try {
    const ids = id ? [id] : selectIds.value;
    if (ids.length === 0) {
      ElMessage.warning("请选择要删除的患者");
      return;
    }

    await ElMessageBox.confirm("确定要删除选中的患者吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    if (ids.length === 1) {
      const res = await PatientAPI.deletePatient(ids[0]);
      if (res.success) {
        ElMessage.success("删除患者成功");
        handleQuery();
      } else {
        ElMessage.error(res.message || "删除患者失败");
      }
    } else {
      const res = await PatientAPI.batchDeletePatient(ids);
      if (res.success) {
        ElMessage.success("批量删除患者成功");
        handleQuery();
      } else {
        ElMessage.error(res.message || "批量删除患者失败");
      }
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-buttons {
  margin-left: 10px;
}

.data-table {
  margin-top: 20px;
}

.data-table__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.data-table__toolbar--actions {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>