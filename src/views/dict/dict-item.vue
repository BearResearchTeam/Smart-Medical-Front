<!-- 字典项管理页面 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <!-- 查询表单 -->
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="DictionaryLabel">
          <!-- 关键字输入框，回车可触发查询 -->
          <el-input v-model="queryParams.DictionaryLabel" placeholder="字典标签/字典值" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <!-- 搜索和重置按钮 -->
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格卡片 -->
    <el-card shadow="never" class="data-table">
      <!-- 工具栏：新增、删除按钮 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-button type="danger" :disabled="ids.length === 0" icon="delete" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <!-- 字典项数据表格 -->
      <el-table v-loading="loading" highlight-current-row :data="tableData.data" border
        @selection-change="handleSelectionChange">
        <!-- 多选框 -->
        <el-table-column type="selection" width="55" align="center" />
        <!-- 序号 -->
        <el-table-column type="index" label="序号" width="120" />
        <!-- 字典项标签 -->
        <el-table-column label="字典项标签" prop="dictionaryLabel" />
        <!-- 字典项值 -->
        <el-table-column label="字典项值" prop="dictionaryValue" />
        <!-- 排序 -->
        <el-table-column label="排序" prop="dictionarySort" />
        <!-- 状态列，使用标签显示 -->
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.dictionaryTypeState === 1 ? 'success' : 'info'">
              {{ scope.row.dictionaryTypeState === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列：编辑、删除 -->
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" link size="small" icon="edit" @click.stop="handleOpenDialog(scope.row)">
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

    <!-- 字典项新增/编辑弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" @close="handleCloseDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-form-item label="字典项标签" prop="dictionaryLabel">
          <el-input v-model="formData.dictionaryLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典项值" prop="dictionaryValue">
          <el-input v-model="formData.dictionaryValue" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.dictionaryTypeState">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.dictionarySort" controls-position="right" />
        </el-form-item>
        <!-- 标签类型选择 -->
        <el-form-item>
          <template #label>
            <div class="flex-y-center">
              标签类型
              <el-tooltip>
                <template #content>回显样式，为空时则显示 '文本'</template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select v-model="formData.dictionaryTypeDesc" placeholder="请选择标签类型" clearable
            @clear="formData.dictionaryTypeDesc = ''">
            <template #label="{ value }">
              <el-tag v-if="value" :type="value">
                {{ formData.dictionaryTypeDesc ? formData.dictionaryTypeDesc : "字典标签" }}
              </el-tag>
            </template>
            <el-option v-for="type in tagType" :key="type" :label="type" :value="type">
              <div flex-y-center gap-10px>
                <el-tag :type="type">{{ type ?? "字典标签" }}</el-tag>
                <span>{{ type }}</span>
              </div>
            </el-option>
          </el-select>
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
import type { TagProps } from "element-plus";
import DictAPI, { DictItemPageQuery, DictItemPageVO, DictItemForm } from "@/api/system/dict.api";

const route = useRoute();
const dictCode = ref(route.query.dictionaryDataType as string);

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictItemPageQuery>({
  pageIndex: 1,
  pageSize: 2,
  DictionaryLabel: "",
  datetype: dictCode.value || "",
});
interface tableDatas {
  data: DictItemPageVO[];
  totalCount: number;
  totalPage: number;
}
const tableData = reactive<tableDatas>({
  data: [],
  totalCount: 0,
  totalPage: 0,
});

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictItemForm>({
  id: undefined,
  /**
   * 字典编码
   */
  dictionaryLabel: "",
  /**
   * 字典数据值
   */
  dictionaryValue: "",
  /**
   * 字典数据标签
   */
  dictionaryDataType: "",
  /**
   * 状态（1:启用，0:禁用)
   */
  dictionaryTypeState: 0,
  /**
   * 字典排序
   */
  dictionarySort: 0,
  dictionaryTypeDesc: "",
});

// 标签类型
const tagType: TagProps["type"][] = ["primary", "success", "info", "warning", "danger"];

// 表单校验规则
const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    dictionaryLabel: [{ required: true, message: "请输入字典项标签", trigger: "blur" }],
    dictionaryValue: [{ required: true, message: "请输入字典项值", trigger: "blur" }],
    dictionaryTypeDesc: [{ required: true, message: "请选择标签类型", trigger: "change" }],
  };
  return rules;
});

// 获取数据
async function fetchData() {
  loading.value = true;
  // 设置查询参数
  const params: DictItemPageQuery = {
    ...queryParams,
    datetype: dictCode.value,
  };
  console.log("dictCode.value", dictCode.value);
  await DictAPI.getDictItemPage(params)
    .then((data) => {
      tableData.data = data.data;
      tableData.totalCount = data.totleCount;
      tableData.totalPage = data.totlePage;

    })
    .finally(() => {
      loading.value = false;
    });
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

// 打开弹窗（新增/编辑）
function handleOpenDialog(row?: DictItemPageVO) {
  dialog.visible = true;
  dialog.title = row ? "编辑字典项" : "新增字典项";
  Object.assign(formData, row);
  // if (row?.id) {
  //   DictAPI.getDictItemFormData(dictCode.value, row.id).then((data) => {

  //   });
  //}
}

// 提交表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      formData.dictionaryDataType = dictCode.value;
      if (id) {
        // 编辑
        DictAPI.updateDictItem(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        //formData.dictionaryDataType = dictCode.value;
        // 新增
        DictAPI.createDictItem(formData)
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

// 关闭弹窗
function handleCloseDialog() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
  formData.dictionarySort = 1;
  formData.dictionaryTypeState = 1;
  formData.dictionaryTypeDesc = "";
  dialog.visible = false;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
async function handleDelete(id?: number) {
  const itemIds = [id || ids.value].join(",");
  if (!itemIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }
  await ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteDictItems(itemIds).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 页面加载时自动查询
onMounted(() => {
  handleQuery();
});
</script>
