<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 菜单权限列表 -->
      <el-col :lg="24" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="queryParams.PermissionName" placeholder="菜单名称/路由路径/权限标识" clearable
                @keyup.enter="handleQuery" />
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
              <el-button v-hasPerm="'sys:menu:delete'" type="danger" icon="delete" :disabled="selectIds.length === 0"
                @click="handleDelete()">
                删除
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <!-- 菜单权限管理通常不需要导入导出 -->
            </div>
          </div>

          <el-table v-loading="loading" :data="pageData.data" row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" border stripe highlight-current-row
            class="data-table__content" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column type="index" label="序号" min-width="70" align="center" />

            <el-table-column label="菜单名称" prop="permissionName" min-width="150" align="center" />
            <el-table-column label="权限" prop="permissionCode" min-width="150" align="center" />

            <el-table-column label="类型" prop="type" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.type === 0">菜单</el-tag>
                <el-tag v-else-if="row.type === 1" type="success">按钮</el-tag>
                <el-tag v-else-if="row.type === 2" type="info">其他</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="图标" prop="icon" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.icon && ElementPlusIconsVue[row.icon as keyof typeof ElementPlusIconsVue]"
                  :class="`icon-${row.icon}`">
                  <component :is="ElementPlusIconsVue[row.icon as keyof typeof ElementPlusIconsVue] || null" />
                </el-icon>
                <!-- <svg-icon v-if="row.icon" :icon-class="row.icon" /> -->

              </template>
            </el-table-column>
            <el-table-column label="路由路径" prop="pagePath" min-width="120" />
            <el-table-column label="父级Id" prop="parentId" min-width="120">
              <template #default="{ row }">
                <span>{{ row.parentId }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="primary" link size="small" icon="edit" @click="handleOpenDialog(row)">
                  编辑
                </el-button>
                <el-button type="success" link size="small" icon="plus" @click="handleOpenDialog(undefined, row.id)"
                  v-if="row.type !== 1">
                  新增
                </el-button>
                <el-button type="danger" link size="small" icon="delete" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页组件 -->
          <pagination v-if="pageData.totleCount > 0" v-model:total="pageData.totleCount"
            v-model:page="queryParams.SkipCount" v-model:limit="queryParams.MaxResultCount" @pagination="fetchData" />

        </el-card>
      </el-col>
    </el-row>

    <!-- 菜单表单 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body :size="drawerSize"
      @close="handleCloseDialog">
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级菜单" prop="parentId">
          <!-- 使用树形选择器 -->
          <el-tree-select v-model="formData.parentId" :data="menuOptions"
            :props="{ label: 'permissionName', value: 'id', children: 'children' }" check-strictly
            :render-after-expand="false" style="width: 240px" disabled placeholder="顶级菜单" />

        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="0">菜单</el-radio>
            <el-radio :value="1">按钮</el-radio>
            <el-radio :value="2">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜单名称" prop="permissionName">
          <el-input v-model="formData.permissionName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="formData.type !== 1">
          <icon-select v-model="formData.icon" />
        </el-form-item>
        <!-- :disabled="formData.type !== 0" -->
        <el-form-item label="路由路径" prop="pagePath" v-if="formData.type !== 1">
          <el-input v-model="formData.pagePath" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="权限" prop="permissionCode">
          <el-input v-model="formData.permissionCode" placeholder="请输入权限标识" />
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
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import MenuAPI, { type MenuVO, type MenuForm, type MenuQuery, type tables, type MenuTree } from "@/api/system/menu.api";
import { ElMessage, ElMessageBox, useDisabled } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
// import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/IconSelect/index.vue'; // 假设有这个组件
import { MenuTypeEnum } from "@/enums";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from "@/store";
const userStore = useUserStore();
defineOptions({
  name: "Menu",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const menuFormRef = ref();

const queryParams = reactive<MenuQuery>({
  PermissionName: undefined,
  Sorting: "0",
  SkipCount: 1,
  MaxResultCount: 60, // 每页数量
});

const pageData = reactive<tables>({
  data: [],
  totleCount: 0,
  totlePage: 0,
});
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增菜单",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<MenuForm>({
  /** 菜单ID */
  id: "",
  /** 父菜单ID */
  parentId: "",
  /** 菜单名称 */
  "permissionName": "",
  "permissionCode": "",
  "type": 0,
  "pagePath": "",
  "icon": "",
  //alwaysShow: 0, // 默认不总是显示
});

const rules = reactive({
  //parentId: [{ required: true, message: "父菜单ID不能为空", trigger: "blur" }],
  permissionName: [{ required: true, message: "菜单名称不能为空", trigger: "change" }],

});

// 选中的菜单ID
const selectIds = ref<string[]>([]);

// 菜单下拉选项 (用于父级菜单选择)
const menuOptions = ref<MenuTree[]>([]);
const menuOptionsLoading = async () => {
  const menuOptionlist = await MenuAPI.getMenuTree(null);
  menuOptions.value = menuOptionlist;

};
// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const params = {
      PermissionName: queryParams.PermissionName,
      Sorting: queryParams.Sorting,
      SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount, // 计算跳过的记录数
      MaxResultCount: queryParams.MaxResultCount, // 每页数量 1) * pageSize.value,
    };
    const result = await MenuAPI.getList(params);
    //pageData.data = result.data;
    pageData.totleCount = result.totleCount;
    pageData.totlePage = result.totlePage;

    console.log("菜单列表:", result);
    // MenuAPI.getList 返回的是扁平化列表，需要转换成树形结构
    pageData.data = buildMenuTree(result.data || []); // 假设 MenuAPI.getList 返回 { data: MenuVO[] } 或者直接 MenuVO[]



  } catch (error) {
    console.error("获取菜单列表失败:", error);
    ElMessage.error("获取菜单列表失败，请稍后重试");
    pageData.data = [];
    pageData.totleCount = 0;
    pageData.totlePage = 0;
  } finally {
    loading.value = false;
  }
}

// 构建菜单树形结构
function buildMenuTree(menuList: MenuVO[]): MenuVO[] {
  const tree: MenuVO[] = []; // 用于存放最终的树形结构
  const menuMap: { [key: string]: MenuVO } = {}; // 用于根据id快速查找菜单项

  // 1. 先把所有菜单放到 map，key为id，value为菜单对象（并初始化children为空数组）
  menuList.forEach(menu => {
    menuMap[String(menu.id)] = { ...menu, children: [] };
  });

  // 2. 再遍历所有菜单，根据parentId归类到父级的children数组
  menuList.forEach(menu => {
    // 处理parentId，确保是字符串类型，且null/undefined时设为''
    const pid = menu.parentId === undefined || menu.parentId === null ? '' : String(menu.parentId);

    if (pid !== '' && menuMap[pid]) {
      // 如果有父级且父级存在于map中，则加入父级的children
      menuMap[pid].children!.push(menuMap[String(menu.id)]);
    } else if (pid === '' || !menuMap[pid]) {
      // 如果没有父级（顶级菜单）或父级不存在于map中，则作为根节点加入tree
      tree.push(menuMap[String(menu.id)]);
    }
  });

  return tree;
}

// 获取菜单下拉选项
async function getMenuOptions() {
  // try {
  //   const result = await MenuAPI.getOptions(true); // true 表示只获取父级菜单
  //   menuOptions.value = [{ id: "-1", name: "顶级菜单", children: [] }, ...result]; // 添加顶级菜单选项
  // } catch (error) {
  //   console.error("获取菜单选项失败:", error);
  // }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryParams.PermissionName = undefined;
  fetchData();
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开弹窗
 * @param row 菜单行数据 (可选，用于编辑)
 * @param parentId 新增时指定父级ID (可选)
 */
async function handleOpenDialog(row?: MenuVO, parentId?: string) {
  dialog.visible = true;
  getMenuOptions(); // 每次打开弹窗都获取最新的菜单选项

  if (row) {
    dialog.title = "修改菜单";
    Object.assign(formData, row);
  } else {
    dialog.title = "新增菜单";
    Object.assign(formData, {
      parentId: parentId || null, // 设置父级菜单，默认为顶级菜单
      /** 菜单名称 */
      "permissionName": "",
      "permissionCode": "",
      "type": 0,
      "pagePath": "",
      "icon": "",
      id: undefined,
    });
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();

  // 重置 formData 到初始状态
  Object.assign(formData, {

    /** 父菜单ID */
    parentId: "",
    /** 菜单名称 */
    "permissionName": "",
    "permissionCode": "",
    "type": 0,
    "pagePath": "",
    "icon": "",
    id: undefined,
  });
}

// 提交菜单表单（防抖）
const handleSubmit = useDebounceFn(async () => {
  const valid = await menuFormRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {

    if (formData.id) {
      // 编辑菜单
      formData.icon = (formData.icon?.split('-').pop()) || '';
      await MenuAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      // 新增菜单
      formData.icon = formData.icon?.split('-').pop() || '';

      await MenuAPI.create(formData);
      ElMessage.success("新增成功");
    }
    handleCloseDialog();
    handleQuery();
  } catch (error) {
    console.error("提交菜单失败:", error);
    ElMessage.error("操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 删除菜单
 * @param id 菜单ID (可选，用于单行删除)
 */
function handleDelete(id?: string) {
  const menuIds = [id || selectIds.value].join(",");
  if (!menuIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除菜单?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      loading.value = true;
      try {
        await MenuAPI.deleteById(menuIds); // 假设 MenuAPI.deleteById 可以接受逗号分隔的ID字符串
        ElMessage.success("删除成功");
        handleResetQuery();
      } catch (error) {
        console.error("删除菜单失败:", error);
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


onMounted(() => {
  initComponent();
  getMenuOptions();
  menuOptionsLoading();
});
</script>
