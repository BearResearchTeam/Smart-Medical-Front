<template>
  <div class="app-container">
    <!-- 查询区域 -->
    <div class="search-container horizontal-search">
      <ElForm ref="queryFormRef" :model="queryParams" :inline="true" class="search-form">
        <ElFormItem label="药品名称" prop="drugName" class="search-item">
          <ElInput v-model="queryParams.drugName" placeholder="药品名称" />
        </ElFormItem>
        <ElFormItem label="药品类型" prop="drugType" class="search-item">
          <ElInput v-model="queryParams.drugType" placeholder="药品类型" />
        </ElFormItem>
        <ElFormItem label="生产日期" prop="productionDateRange" class="search-item">
          <ElDatePicker
            v-model="queryParams.productionDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem label="库存范围" class="search-item">
          <ElInputNumber
            v-model="queryParams.stockMin"
            :min="0"
            placeholder="最小"
            style="width: 100px"
          />
          <span class="range-separator">-</span>
          <ElInputNumber
            v-model="queryParams.stockMax"
            :min="0"
            placeholder="最大"
            style="width: 100px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" icon="Search" @click="handleQuery">搜索</ElButton>
          <ElButton icon="Refresh" @click="handleResetQuery">重置</ElButton>
          <ElButton type="info" icon="OfficeBuilding" @click="goToPharmaceuticalCompany">
            制药公司
          </ElButton>
        </ElFormItem>
      </ElForm>
    </div>
    <ElCard shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <ElButton type="success" icon="Plus" @click="handleOpenDialog()">新增</ElButton>

          <ElButton type="primary" icon="Download" @click="handleOpenStockInDialog">入库</ElButton>

          <ElButton
            type="danger"
            :disabled="selectIds.length === 0"
            icon="Delete"
            @click="handleDeleteBatch()"
          >
            删除
          </ElButton>

          <a href="https://localhost:44394/api/app/drug/export-drug-excel" download>
            <ElButton>导出药品数据</ElButton>
          </a>
        </div>
      </div>

      <ElTable
        v-loading="loading"
        :data="tableData.pageData"
        border
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" align="center" />
        <ElTableColumn type="index" label="序号" width="60" />
        <ElTableColumn prop="drugName" label="药品名称" width="120" />
        <ElTableColumn prop="drugType" label="药品类型" width="100" />
        <ElTableColumn prop="feeName" label="收费项目" width="100" />
        <ElTableColumn prop="dosageForm" label="剂型" width="100" />
        <ElTableColumn prop="specification" label="规格" width="120" />
        <ElTableColumn prop="purchasePrice" label="进价" width="90" />
        <ElTableColumn prop="salePrice" label="售价" width="90" />
        <ElTableColumn prop="stock" label="库存" width="90" />
        <ElTableColumn prop="stockLower" label="库存下限" width="90" />
        <ElTableColumn prop="stockUpper" label="库存上限" width="90" />

        <ElTableColumn
          prop="productionDate"
          label="生产日期"
          width="160"
          :formatter="formatDateOnly"
        />
        <ElTableColumn prop="expiryDate" label="有效期至" width="160" :formatter="formatDateOnly" />
        <ElTableColumn prop="effect" label="功效" width="120" />
        <ElTableColumn prop="category" label="中药/西药" width="120">
          <template #default="scope">
            {{ scope.row.category === 1 ? "中药" : "西药" }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="pharmaceuticalCompanyName" label="供应商名称" width="90" />
        <ElTableColumn label="操作" fixed="right" align="left" width="160">
          <template #default="scope">
            <ElButton
              type="primary"
              link
              size="small"
              icon="Edit"
              @click.stop="handleOpenDialog(scope.row)"
            >
              编辑
            </ElButton>
            <ElButton
              type="danger"
              link
              size="small"
              icon="Delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-if="tableData.totalCount > 0"
        v-model:total="tableData.totalCount"
        v-model:current-page="queryParams.pageIndex"
        v-model:page-size="queryParams.pageSize"
        class="pagination-container"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleQuery"
        @size-change="handleQuery"
      />
    </ElCard>

    <ElDialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="700px"
      @closed="handleCloseDialog"
    >
      <ElForm ref="drugFormRef" :model="formData" :rules="rules" label-width="100px">
        <ElRow>
          <ElCol :span="12">
            <ElFormItem label="药品名称" prop="drugName">
              <ElInput v-model="formData.drugName" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="药品类型" prop="drugType">
              <ElInput v-model="formData.drugType" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="收费项目" prop="feeName">
              <ElInput v-model="formData.feeName" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="剂型" prop="dosageForm">
              <ElInput v-model="formData.dosageForm" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="规格" prop="specification">
              <ElInput v-model="formData.specification" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="进价" prop="purchasePrice">
              <ElInputNumber
                v-model="formData.purchasePrice"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="售价" prop="salePrice">
              <ElInputNumber
                v-model="formData.salePrice"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="库存" prop="stock">
              <ElInputNumber v-model="formData.stock" :min="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="库存下限" prop="stockLower">
              <ElInputNumber v-model="formData.stockLower" :min="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="库存上限" prop="stockUpper">
              <ElInputNumber v-model="formData.stockUpper" :min="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分类" prop="category">
              <ElInputNumber v-model="formData.category" :min="1" :max="2" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="生产日期" prop="productionDate">
              <ElDatePicker
                v-model="formData.productionDate"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有效期至" prop="expiryDate">
              <ElDatePicker
                v-model="formData.expiryDate"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="功效" prop="effect">
              <ElInput v-model="formData.effect" type="textarea" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="制药公司" prop="pharmaceuticalCompanyId">
              <ElSelect v-model="formData.pharmaceuticalCompanyId" placeholder="请选择公司">
                <ElOption
                  v-for="item in companyOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
          <ElButton @click="handleCloseDialog">取 消</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 药品入库对话框 -->
    <ElDialog
      v-model="stockInDialog.visible"
      title="药品入库"
      width="400px"
      @closed="handleCloseStockInDialog"
    >
      <ElForm ref="stockInFormRef" :model="stockInForm" label-width="100px" :rules="stockInRules">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="入库数量" prop="quantity" required>
              <ElInputNumber v-model="stockInForm.quantity" :min="1" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="单价" prop="unitPrice" required>
              <ElInputNumber
                v-model="stockInForm.unitPrice"
                :min="0"
                :precision="2"
                style="width: 100%"
                @change="calcTotalAmount"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总金额" prop="totalAmount" required>
              <ElInputNumber
                v-model="stockInForm.totalAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                disabled
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="批号" prop="batchNumber" required>
              <ElInput v-model="stockInForm.batchNumber" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="供应商" prop="supplier" required>
              <ElInput v-model="stockInForm.supplier" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="生产日期" prop="productionDate" required>
              <ElDatePicker
                v-model="stockInForm.productionDate"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="有效期" prop="expiryDate" required>
              <ElDatePicker
                v-model="stockInForm.expiryDate"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="制药公司" prop="pharmaceuticalCompanyId" required>
              <ElSelect v-model="stockInForm.pharmaceuticalCompanyId" placeholder="请选择公司">
                <ElOption
                  v-for="item in companyOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="状态" prop="status" required>
              <ElInput v-model="stockInForm.status" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="创建时间" prop="creationTime" required>
              <ElDatePicker
                v-model="stockInForm.creationTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="操作人" prop="operator" required>
              <ElInput v-model="stockInForm.operator" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="备注" prop="remark" required>
              <ElInput v-model="stockInForm.remark" type="textarea" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="入库时间" prop="inStockTime" required>
              <ElDatePicker
                v-model="stockInForm.inStockTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="handleStockInSubmit">确 定</ElButton>
          <ElButton @click="handleCloseStockInDialog">取 消</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox, ElForm } from "element-plus";
import DrugAPI, {
  type DrugListItem,
  type DrugAddRequest,
  type DrugUpdateRequest,
  type DrugListParams,
  type DrugPageResult,
} from "@/api/drug.api";
import PharmaceuticalCompanyAPI from "@/api/pharmaceutical-company.api";
import dayjs from "dayjs";
import { drugStockInBatch } from "@/api/pharmacy.api";
import { watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

function goToPharmaceuticalCompany() {
  router.push({ path: "pharmaceutical-company" }); // 路由根据实际情况调整
}
const queryFormRef = ref<InstanceType<typeof ElForm>>();
const drugFormRef = ref<InstanceType<typeof ElForm>>();

const loading = ref(false);
const selectIds = ref<string[]>([]);
const queryParams = reactive({
  drugName: "",
  drugType: "",
  pharmaceuticalCompanyId: "",
  productionDateRange: [],
  stockMin: undefined,
  stockMax: undefined,
  pageIndex: 1,
  pageSize: 5,
});

const dialog = reactive({
  title: "",
  visible: false,
});

interface TableDataType {
  pageData: DrugListItem[];
  totalCount: number;
  totalPage: number;
}

const tableData = reactive<TableDataType>({
  pageData: [],
  totalCount: 0,
  totalPage: 0,
});

const formData = reactive<Partial<DrugListItem>>({});

const validateSalePrice = (rule: any, value: any, callback: any) => {
  if (value && formData.purchasePrice && value < formData.purchasePrice) {
    callback(new Error("售价不能低于进价"));
  } else {
    callback();
  }
};

const validateStockUpper = (rule: any, value: any, callback: any) => {
  if (value && formData.stockLower && value < formData.stockLower) {
    callback(new Error("库存上限不能低于库存下限"));
  } else {
    callback();
  }
};

const validateExpiryDate = (rule: any, value: any, callback: any) => {
  if (value && formData.productionDate && new Date(value) < new Date(formData.productionDate)) {
    callback(new Error("有效期必须晚于生产日期"));
  } else {
    callback();
  }
};

const rules = reactive({
  drugName: [{ required: true, message: "药品名称不能为空", trigger: "blur" }],
  drugType: [{ required: true, message: "药品类型不能为空", trigger: "blur" }],
  feeName: [{ required: true, message: "收费项目不能为空", trigger: "blur" }],
  dosageForm: [{ required: true, message: "剂型不能为空", trigger: "blur" }],
  specification: [{ required: true, message: "规格不能为空", trigger: "blur" }],
  purchasePrice: [{ required: true, message: "进价不能为空", trigger: "blur" }],
  salePrice: [
    { required: true, message: "售价不能为空", trigger: "blur" },
    { validator: validateSalePrice, trigger: "blur" },
  ],
  stock: [{ required: true, message: "库存不能为空", trigger: "blur" }],
  stockLower: [{ required: true, message: "库存下限不能为空", trigger: "blur" }],
  stockUpper: [
    { required: true, message: "库存上限不能为空", trigger: "blur" },
    { validator: validateStockUpper, trigger: "blur" },
  ],
  productionDate: [{ required: true, message: "生产日期不能为空", trigger: "change" }],
  expiryDate: [
    { required: true, message: "有效期至不能为空", trigger: "change" },
    { validator: validateExpiryDate, trigger: "change" },
  ],
  category: [{ required: true, message: "分类不能为空", trigger: "blur" }],

  // ...其他字段校验...
  pharmaceuticalCompanyId: [{ required: true, message: "请选择制药公司", trigger: "change" }],
});

const stockInRules = reactive({
  quantity: [{ required: true, message: "请输入入库数量", trigger: "blur" }],
  unitPrice: [{ required: true, message: "请输入单价", trigger: "blur" }],
  totalAmount: [{ required: true, message: "请输入总金额", trigger: "blur" }],
  batchNumber: [{ required: true, message: "请输入批号", trigger: "blur" }],
  pharmaceuticalCompanyId: [{ required: true, message: "请选择制药公司", trigger: "change" }],
  stockUpper: [{ required: true, message: "请输入库存上限", trigger: "blur" }],
  stockLower: [{ required: true, message: "请输入库存下限", trigger: "blur" }],
  operator: [{ required: true, message: "请输入操作人", trigger: "blur" }],
  stockInTime: [{ required: true, message: "请选择入库时间", trigger: "change" }],
});
/**
 * 规范化后端返回的药品数据，处理中英文混合键名和测试数据问题
 * @param drug 后端返回的原始药品对象
 * @returns 规范化后的药品对象
 */
function normalizeDrugData(drug: any): DrugListItem {
  return {
    id: drug.id || drug.drugID, // 兼容后端返回的drugID
    drugName: drug.drugName,
    drugType: drug.drugType,
    feeName: drug.feeName,
    dosageForm: drug.dosageForm,
    specification: drug.specification,
    purchasePrice: drug.purchasePrice,
    salePrice: drug.salePrice,
    stock: drug.stock,
    stockUpper: drug.stockUpper,
    stockLower: drug.stockLower,
    productionDate: drug.productionDate,
    expiryDate: drug.expiryDate,
    effect: drug.effect,
    category: drug.category,
    pharmaceuticalCompanyId: drug.pharmaceuticalCompanyId,
    pharmaceuticalCompanyName: drug.pharmaceuticalCompanyName,
  };
}

function handleQuery() {
  loading.value = true;
  const params: DrugListParams = {
    drugName: queryParams.drugName,
    drugType: queryParams.drugType,
    stockLower: queryParams.stockMin,
    stockUpper: queryParams.stockMax,
    pageIndex: queryParams.pageIndex,
    pageSize: queryParams.pageSize,
    pharmaceuticalCompanyId: queryParams.pharmaceuticalCompanyId, // 确保已添加
  };
  if (queryParams.productionDateRange && queryParams.productionDateRange.length === 2) {
    params.productionDateStart = queryParams.productionDateRange[0];
    params.productionDateEnd = queryParams.productionDateRange[1];
  }

  DrugAPI.getDrugList(params)
    .then((res: DrugPageResult) => {
      const rawDrugList = res?.data || [];
      const normalizedData = rawDrugList
        .map(normalizeDrugData) // 规范化数据键名
        .filter((drug) => drug.drugName && drug.drugName !== "string"); // 过滤掉测试数据

      tableData.pageData = normalizedData;
      tableData.totalCount = res?.totleCount || 0; // 保持后端返回的总数以确保分页正确
      tableData.totalPage = res?.totalPage || 0;
    })
    .catch((error) => {
      console.error("查询药品列表失败:", error);
      // 发生错误时，将表格数据重置为空数组，防止页面崩溃
      tableData.pageData = [];
      tableData.totalCount = 0;
      tableData.totalPage = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.stockMin = undefined;
  queryParams.stockMax = undefined;
  handleQuery();
}

function handleSelectionChange(selection: DrugListItem[]) {
  selectIds.value = selection.map((item) => item.id);
}

function handleOpenDialog(row?: DrugListItem) {
  dialog.visible = true;
  if (row && row.id) {
    dialog.title = "编辑药品";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增药品";
    Object.keys(formData).forEach((key) => (formData[key as keyof DrugListItem] = undefined));
  }
}
async function handleSubmit() {
  drugFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      if (formData.id) {
        await DrugAPI.updateDrug(formData.id, formData as DrugUpdateRequest)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        await DrugAPI.addDrug(formData as DrugAddRequest)
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

function handleDelete(id: string) {
  ElMessageBox.confirm("确定要删除该药品吗？", "提示", { type: "warning" }).then(() => {
    loading.value = true;
    DrugAPI.deleteDrug(id)
      .then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

function handleDeleteBatch() {
  if (!selectIds.value.length) {
    ElMessage.warning("请勾选要删除的药品");
    return;
  }
  ElMessageBox.confirm("确定要删除选中的药品吗？", "提示", { type: "warning" }).then(() => {
    loading.value = true;
    // 这里假设后端支持批量删除接口，如不支持请循环调用
    Promise.all(selectIds.value.map((id) => DrugAPI.deleteDrug(id)))
      .then(() => {
        ElMessage.success("批量删除成功");
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

function handleCloseDialog() {
  dialog.visible = false;
  nextTick(() => {
    drugFormRef.value?.resetFields?.();
    Object.keys(formData).forEach((key) => (formData[key as keyof DrugListItem] = undefined));
  });
}
const companyOptions = ref<{ id: string; name: string }[]>([]);

async function fetchCompanyOptions() {
  try {
    const res = await PharmaceuticalCompanyAPI.getAll();

    // 假如后端返回 { data: [{ companyId, companyName }, ...] }

    companyOptions.value = (res.data || res).map((item: any) => ({
      id: item.id, // 用 companyId 作为 value
      name: item.companyName, // 用 companyName 作为 label
    }));
    console.log("公司下拉数据：", companyOptions.value);
  } catch {
    companyOptions.value = [];
  }
}

function formatDateOnly(row: any, column: any, cellValue: string) {
  if (!cellValue) return "";
  return dayjs(cellValue).format("YYYY-MM-DD");
}

function calcTotalAmount() {
  stockInForm.totalAmount = Number(stockInForm.unitPrice) * Number(stockInForm.quantity);
}
const stockInDialog = reactive({ visible: false });
const stockInForm = reactive({
  quantity: 1,
  unitPrice: 0,
  totalAmount: 0,
  batchNumber: "",
  supplier: "",
  productionDate: "",
  expiryDate: "",
  pharmaceuticalCompanyId: "",
  status: "已入库",
  creationTime: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  operator: "",
  remark: "",
  inStockTime: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
});

function handleOpenStockInDialog() {
  stockInDialog.visible = true;
  if (selectIds.value.length === 1) {
    const drug = tableData.pageData.find((d) => d.id === selectIds.value[0]);
    if (drug) {
      stockInForm.unitPrice = drug.purchasePrice || 0;
      stockInForm.supplier = drug.pharmaceuticalCompanyName || "";
      stockInForm.remark = "";
      stockInForm.quantity = 1;
      stockInForm.totalAmount = drug.purchasePrice || 0;
      stockInForm.productionDate = drug.productionDate || "";
      stockInForm.expiryDate = drug.expiryDate || "";
      stockInForm.status = "正常";
    }
  } else {
    // 多选时可清空或用默认值
    stockInForm.unitPrice = 0;
    stockInForm.supplier = "";
    stockInForm.remark = "";
    stockInForm.quantity = 1;
    stockInForm.totalAmount = 0;
    stockInForm.productionDate = "";
    stockInForm.expiryDate = "";
    stockInForm.status = "正常";
  }
  stockInForm.operator = ""; // 可自动带入当前用户
  stockInForm.inStockTime = dayjs().format("YYYY-MM-DDTHH:mm:ss");
}
function handleCloseStockInDialog() {
  stockInDialog.visible = false;
}
watch(
  () => [stockInForm.unitPrice, stockInForm.quantity],
  ([unitPrice, quantity]) => {
    stockInForm.totalAmount = Number(unitPrice) * Number(quantity);
  }
);
// 3. handleStockInSubmit 支持批量
function handleStockInSubmit() {
  if (!selectIds.value.length) {
    ElMessage.warning("请先勾选要入库的药品");
    return;
  }
  const details = tableData.pageData
    .filter((drug) => selectIds.value.includes(drug.id))
    .map((drug) => ({
      drugId: drug.id,
      pharmaceuticalCompanyId: drug.pharmaceuticalCompanyId,
      quantity: Number(stockInForm.quantity),
      unitPrice: Number(stockInForm.unitPrice),
      totalAmount: Number(stockInForm.totalAmount),
      productionDate: stockInForm.productionDate, // 或 drug.productionDate
      expiryDate: stockInForm.expiryDate, // 或 drug.expiryDate
      supplier: stockInForm.supplier,
      batchNumber: stockInForm.batchNumber, // 必须有值
      status: stockInForm.status || "正常",
      creationTime: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      // 允许扩展更多字段
    }));
  const payload = {
    details,
    operator: stockInForm.operator,
    remark: stockInForm.remark,
    inStockTime: stockInForm.inStockTime,
  };

  console.log("批量入库请求体：", payload);
  if (details.length === 0) {
    ElMessage.warning("没有可入库的药品");
    return;
  }
  if (details.some((item) => item.quantity <= 0)) {
    ElMessage.warning("入库数量必须大于0");
    return;
  }
  drugStockInBatch(payload)
    .then(() => {
      if (!stockInForm.remark || stockInForm.remark.trim() === "") {
        ElMessage.warning("备注不能为空！");
        return;
      }
      ElMessage.success("批量入库成功");
      handleCloseStockInDialog();
      handleQuery();
    })
    .catch((err) => {
      ElMessage.error("批量入库失败");
      if (err && err.response && err.response.data) {
        console.error("后端错误信息：", err.response.data);
      }
    });
}
onMounted(() => {
  fetchCompanyOptions();

  handleQuery();
});
</script>

<style scoped>
.search-container {
  margin-bottom: 16px;
}
.data-table__toolbar {
  margin-bottom: 8px;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.range-separator {
  margin: 0 8px;
}
.horizontal-search {
  display: flex;
  align-items: center;
}
.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.search-item {
  margin-right: 24px;
  min-width: 220px;
}
.range-separator {
  margin: 0 8px;
}
:deep(.el-form-item__error) {
  color: #f76560 !important;
}
</style>
