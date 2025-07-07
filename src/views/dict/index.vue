<!-- 字典 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <!-- 查询表单 -->
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="dictionaryDataName">
          <!-- 关键字输入框，回车可触发查询 -->
          <el-input v-model="queryParams.dictionaryDataName" placeholder="字典名称/编码" clearable
            @keyup.enter="handleQuery" />
        </el-form-item>

        <el-form-item label="字典状态" prop="dictionaryDataState">
          <el-select v-model="queryParams.dictionaryDataState" placeholder="全部" clearable style="width: 100px">
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>

        <!-- 搜索和重置按钮 -->
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格卡片 -->
    <el-card shadow="hover" class="data-table">
      <!-- 工具栏：新增、删除按钮 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleAddClick()">新增</el-button>
          <el-button type="danger" :disabled="ids.length === 0" icon="delete" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <!-- 字典数据表格 -->
      <el-table v-loading="loading" highlight-current-row :data="tableData.data" border class="data-table__content"
        @selection-change="handleSelectionChange">
        <!-- 多选框 -->
        <el-table-column type="selection" width="55" align="center" />
        <!-- 序号 -->
        <el-table-column type="index" label="序号" width="130" />
        <!-- 字典名称 -->
        <el-table-column label="字典名称" prop="dictionaryDataName" />
        <!-- 字典编码 -->
        <el-table-column label="字典编码" prop="dictionaryDataType" />
        <!-- 状态列，使用标签显示 -->
        <el-table-column label="状态" prop="dictionaryDataState">
          <template #default="scope">
            <el-tag :type="scope.row.dictionaryDataState === 1 ? 'success' : 'info'">
              {{ scope.row.dictionaryDataState === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列：字典数据、编辑、删除 -->
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <!-- 跳转到字典项页面 -->
            <el-button type="primary" link size="small" @click.stop="handleOpenDictData(scope.row)">
              <template #icon>
                <Collection />
              </template>
              字典数据
            </el-button>
            <!-- 编辑按钮 -->
            <el-button type="primary" link size="small" icon="edit" @click.stop="handleEditClick(scope.row)">
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" link size="small" icon="delete" @click.stop="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination v-if="tableData.totalCount > 0" v-model:total="tableData.totalCount"
        v-model:page="queryParams.pageIndex" v-model:limit="queryParams.pageSize" @pagination="fetchData" />
    </el-card>

    <!-- 字典新增/编辑弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" @close="handleCloseDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="80px">
        <el-form-item label="字典名称" prop="dictionaryDataName">
          <el-input v-model="formData.dictionaryDataName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictionaryDataType">
          <el-input v-model="formData.dictionaryDataType" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.dictionaryDataState">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.dictionaryDataDesc" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <!-- 弹窗底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 组件配置
defineOptions({
  name: "Dict",
  inherititems: false,
});

import DictAPI, { DictPageQuery, DictPageVO, DictForm } from "@/api/system/dict.api";
import router from "@/router";

// 表单和表格的ref
const queryFormRef = ref();
const dataFormRef = ref();

// 加载状态
const loading = ref(false);
// 选中项id数组
const ids = ref<number[]>([]);
// 总条数
const total = ref(0);

// 查询参数
const queryParams = reactive<DictPageQuery>({
  pageIndex: 1,
  pageSize: 2,
});
interface tableDatas {
  data: DictForm[];
  totalCount: number;
  totalPage: number;
}
// 表格数据
const tableData = reactive<tableDatas>({
  data: [],
  totalCount: 0,
  totalPage: 0,
});

// 弹窗状态
const dialog = reactive({
  title: "",
  visible: false,
});

// 表单数据
const formData = reactive<DictForm>({
  id: undefined,
  dictionaryDataName: "",
  dictionaryDataType: "",
  dictionaryDataState: 1,
  dictionaryDataDesc: "",
});

// 表单校验规则
const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    dictionaryDataName: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
    dictionaryDataType: [{ required: true, message: "请输入字典编码", trigger: "blur" }],

  };
  return rules;
});

// 获取数据
async function fetchData() {
  loading.value = true;
  // 设置查询参数
  const params: DictPageQuery = {
    ...queryParams,
    pageIndex: queryParams.pageIndex,
    pageSize: queryParams.pageSize,
  };
  const res = await DictAPI.getPage(params);
  tableData.data = res.data;
  tableData.totalCount = res.totleCount;
  tableData.totalPage = res.totlePage;
  loading.value = false;
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.pageIndex = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageIndex = 1;
  fetchData();
}

// 行选择
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 新增字典
function handleAddClick() {
  dialog.visible = true;
  dialog.title = "新增字典";
}

/**
 * 编辑字典
 *
 * @param id 字典ID
 */
function handleEditClick(row: DictForm) {
  dialog.visible = true;
  dialog.title = "修改字典";
  console.log("formData.id", row.id); // 打印表单数据

  Object.assign(formData, row);

}

// 提交字典表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;

      if (id) {
        console.log("formData", formData.id); // 打印表单数据
        // 编辑
        DictAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        // 新增
        DictAPI.create(formData)
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

// 关闭字典弹窗
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const attrGroupIds = [id || ids.value].join(",");
  if (!attrGroupIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteByIds(attrGroupIds).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 打开字典项
function handleOpenDictData(row: DictPageVO) {
  console.log("row:", row); // 打印行数据
  router.push({
    path: "/dict/dict-item",
    query: { dictionaryDataType: row.dictionaryDataType, title: "【" + row.dictionaryDataType + "】字典数据" },
  });
}

// 页面加载时自动查询
onMounted(() => {
  handleQuery();
});
</script>
