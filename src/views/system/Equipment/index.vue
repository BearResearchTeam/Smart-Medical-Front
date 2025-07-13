<template>
  <div class="equipment-container">
    <el-button type="primary" @click="dialogVisible = true">新增设备</el-button>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="manufacturer" label="生产厂家" />
      <el-table-column prop="purchaseDate" label="采购日期" />
      <el-table-column prop="department" label="所属科室" />
      <el-table-column prop="inUse" label="是否在用">
        <template #default="{ row }">
          <el-tag :type="row.inUse ? 'success' : 'info'">{{ row.inUse ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="location" label="位置" />
      <el-table-column prop="maintenanceTime" label="维护时间" />
      <el-table-column prop="remark" label="备注" />
    </el-table>

    <el-pagination v-if="total > 0" v-model:current-page="query.PageIndex" v-model:page-size="query.PageSize"
      :total="total" background layout="total, sizes, prev, pager, next, jumper" class="pagination"
      @size-change="fetchData" @current-change="fetchData" />
  </div>

  <el-dialog v-model="dialogVisible" title="新增设备" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="设备名称" prop="name"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="型号" prop="model"><el-input v-model="form.model" /></el-form-item>
      <el-form-item label="生产厂家"><el-input v-model="form.manufacturer" /></el-form-item>
      <el-form-item label="采购日期">
        <el-date-picker v-model="form.purchaseDate" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" />
      </el-form-item>
      <el-form-item label="科室"><el-input v-model="form.department" /></el-form-item>
      <el-form-item label="状态"><el-input v-model="form.status" /></el-form-item>
      <el-form-item label="是否在用">
        <el-switch v-model="form.inUse" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="位置"><el-input v-model="form.location" /></el-form-item>
      <el-form-item label="维护时间">
        <el-date-picker v-model="form.lastMaintenanceTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" />
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAdd">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import UserAPI, { type EquipmentQuery, type EquipmentItem, type EquipmentAddRequest } from '@/api/system/Distribute.api';

const loading = ref(false);
const list = ref<EquipmentItem[]>([]);
const total = ref(0);

const query = reactive<EquipmentQuery>({
  PageIndex: 1,
  PageSize: 12,
  // name: '', // 如果后端支持模糊搜索可加
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await UserAPI.getEquipmentList(query);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
  } finally {
    loading.value = false;
  }
};

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const form = ref<EquipmentAddRequest>({
  name: '',
  model: '',
  manufacturer: '',
  purchaseDate: '',
  department: '',
  status: '',
  inUse: true,
  location: '',
  lastMaintenanceTime: '',
  remark: '',
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }],
  department: [{ required: true, message: '请输入所属科室', trigger: 'blur' }],
});

const handleAdd = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await UserAPI.addEquipment(form.value);
        ElMessage.success('设备录入成功');
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('设备录入失败:', error);
        ElMessage.error('设备录入失败');
      }
    }
  });
};
onMounted(fetchData);
</script>

<style scoped>
.equipment-container {
  padding: 20px;
  background: #fff;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
