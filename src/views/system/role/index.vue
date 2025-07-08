<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :lg="24" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="RoleName">
              <el-input v-model="queryParams.RoleName" placeholder="角色名/描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>

            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="hover" class="data-table">
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                新增
              </el-button>
              <el-button type="danger" icon="delete" :disabled="selectIds.length === 0" @click="handleDelete()">
                删除
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <!-- 角色管理通常不需要导入导出，如果需要可在此添加 -->
            </div>
          </div>

          <el-table v-loading="loading" :data="pageData.data" border stripe highlight-current-row
            class="data-table__content" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="角色名称" prop="roleName" />
            <el-table-column label="描述" prop="description" />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="success" link size="small" icon="plus" @click="handlerolepermission(row)">
                  分配权限
                </el-button>
                <el-button type="primary" link size="small" icon="edit" @click="handleOpenDialog(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" icon="delete" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-if="pageData.totalCount > 0" v-model:total="pageData.totalCount"
            v-model:page="queryParams.SkipCount" v-model:limit="queryParams.MaxResultCount" @pagination="fetchData" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色表单 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body :size="drawerSize"
      @close="handleCloseDialog">
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>



  <el-dialog v-model="permissionDialog.visible" :title="permissionDialog.title" width="500px"
    @close="handleClosePermissionDialog">
    <el-form ref="permissionFormRef" :model="permissionFormData" label-width="80px">
      <!-- 角色名称输入框 -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input :value="permissionFormData.roleName" placeholder="请输入角色名称" disabled />
      </el-form-item>

      <!-- 权限名称下拉框 -->
      <el-form-item label="权限名称" prop="permissionName">
        <!-- 使用树形选择器 -->
        <el-tree-select v-model="permissionFormData.permissionId" :data="menuOptions"
          :props="{ label: 'permissionName', value: 'id', children: 'children' }" check-strictly
          :render-after-expand="false" style="width: 240px" multiple />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmitPermission">确 定</el-button>
        <el-button @click="handleClosePermissionDialog">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import MyRoleAPI, { type RoleListItem, type RoleListParams, type RolePageResult, type RolePermissionListItem } from "@/api/myrole.api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import MenuAPI, { type MenuTree } from "@/api/system/menu.api";
import RoleAPI from "@/api/system/role.api";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const roleFormRef = ref(); // 更改为 roleFormRef

const queryParams = reactive<RoleListParams>({
  RoleName: "",
  Sorting: "",
  SkipCount: 1,
  MaxResultCount: 2,
});

const pageData = reactive<RolePageResult>({
  totalCount: 0,
  totalPage: 0,
  data: [],
});
const queryskip = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增角色",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<RoleListItem>({
  roleName: "",
  description: "",
  id: "",
});

const rules = reactive({
  roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
  roleCode: [{ required: true, message: "角色编码不能为空", trigger: "blur" }],
});

// 选中的角色ID
const selectIds = ref<string[]>([]);

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    // 构造查询参数，与API接口匹配
    const params = {
      RoleName: queryParams.RoleName,
      Sorting: queryParams.Sorting,
      SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount,
      MaxResultCount: queryParams.MaxResultCount,
    };
    queryskip.value = (queryParams.SkipCount - 1) * queryParams.MaxResultCount;
    console.log("发送查询参数:", params);

    const result = await MyRoleAPI.getRole(params);
    console.log("获取角色列表结果:", result);
    pageData.data = result.data || [];
    pageData.totalCount = result.totleCount;
    pageData.totalPage = result.totlePage;

  } catch (error) {
    console.error("获取角色列表失败:", error);
    ElMessage.error("获取角色列表失败，请稍后重试");
    pageData.data = [];
    //total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.SkipCount = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.SkipCount = 1;
  fetchData();
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开弹窗
 * @param row 角色行数据 (可选，用于编辑)
 */
async function handleOpenDialog(row?: RoleListItem) {
  dialog.visible = true;
  if (row) {
    dialog.title = "修改角色";
    // 直接反填当前行数据
    Object.assign(formData, row);
    // 确保ID也正确赋值
    formData.id = row.id;
  } else {
    dialog.title = "新增角色";
    // 重置formData
    Object.assign(formData, {
      roleName: "",
      roleCode: "",
      description: "",
      id: undefined, // 确保新增时ID为空
    });
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = ""; // 清空ID
}

// 提交角色表单（防抖）
const handleSubmit = useDebounceFn(async () => {
  const valid = await roleFormRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      // 编辑角色
      await MyRoleAPI.updateRole(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      // 新增角色
      await MyRoleAPI.addRole(formData);
      ElMessage.success("新增成功");
    }
    handleCloseDialog();
    handleQuery();
  } catch (error) {
    console.error("提交角色失败:", error);
    ElMessage.error("操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 删除角色
 * @param id 角色ID (可选，用于单行删除)
 */
function handleDelete(id?: string) {
  const roleIds = [id || selectIds.value].join(",");
  if (!roleIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除角色?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      loading.value = true;
      try {
        await MyRoleAPI.deleteRoles(roleIds);
        ElMessage.success("删除成功");
        handleResetQuery();
      } catch (error) {
        console.error("删除角色失败:", error);
        ElMessage.error("删除失败，请稍后重试");
      } finally {
        loading.value = false;
      }
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 初始化组件
const initComponent = () => {
  handleQuery();
};
// 权限分配弹框数据
const permissionDialog = reactive({
  visible: false,
  title: "角色分配权限",
});

const permissionFormRef = ref();
const permissionFormData = reactive({
  roleId: "", // 角色ID
  roleName: "", // 角色名称
  permissionId: [] as string[], // 权限ID（多选）
});

// 权限下拉框选项
const menuOptions = ref<MenuTree[]>([]);
const menuOptionsLoading = async () => {
  const menuOptionlist = await MenuAPI.getMenuTreeAll(null);
  menuOptions.value = menuOptionlist;

};
/**
 * 打开权限分配弹框
 * @param row 角色行数据
 */
function handlerolepermission(row: RoleListItem) {
  permissionDialog.visible = true;
  permissionDialog.title = `角色分配权限 - ${row.roleName}`;
  permissionFormData.roleId = row.id; // 赋值角色ID
  permissionFormData.roleName = row.roleName; // 赋值角色名称
  permissionFormData.permissionId = []; // 清空权限ID
}

/**
 * 关闭权限分配弹框
 */
function handleClosePermissionDialog() {
  permissionDialog.visible = false;
  permissionFormRef.value.resetFields();
}

/**
 * 提交权限分配表单
 */
async function handleSubmitPermission() {
  const valid = await permissionFormRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    // 调用批量分配权限接口
    await MyRoleAPI.baseaddRolePermission(permissionFormData.roleId, permissionFormData.permissionId);
    ElMessage.success("权限分配成功");
    handleClosePermissionDialog();
  } catch (error) {
    console.error("权限分配失败:", error);
    ElMessage.error("权限分配失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  menuOptionsLoading();
  initComponent();
});
</script>
