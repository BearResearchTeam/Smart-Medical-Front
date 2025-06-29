<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 菜单权限列表 -->
      <el-col :lg="24" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="queryParams.keywords" placeholder="菜单名称/路由路径/权限标识" clearable
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
              <el-button v-hasPerm="['sys:menu:add']" type="success" icon="plus" @click="handleOpenDialog()">
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

          <el-table v-loading="loading" :data="pageData" row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" border stripe highlight-current-row
            class="data-table__content" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="菜单名称" prop="name" min-width="150" />
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.type === 1">目录</el-tag>
                <el-tag v-else-if="row.type === 2" type="success">菜单</el-tag>
                <el-tag v-else-if="row.type === 3" type="info">按钮</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="图标" width="80" align="center">
              <template #default="{ row }">
                <svg-icon v-if="row.icon" :icon-class="row.icon" />
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sort" width="80" align="center" />
            <el-table-column label="路由路径" prop="routePath" min-width="120" />
            <!-- <el-table-column label="组件路径" prop="component" min-width="150" /> -->
            <el-table-column label="权限标识" prop="perm" min-width="150" />
            <el-table-column label="可见" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.visible === 1" type="success">显示</el-tag>
                <el-tag v-else type="info">隐藏</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="缓存" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.keepAlive === 1" type="success">是</el-tag>
                <el-tag v-else-if="row.type === 2" type="info">否</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="primary" link size="small" icon="edit" @click="handleOpenDialog(row)">
                  编辑
                </el-button>
                <el-button type="success" link size="small" icon="plus" @click="handleOpenDialog(undefined, row.id)"
                  v-if="row.type !== 3">
                  新增
                </el-button>
                <el-button type="danger" link size="small" icon="delete" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 菜单表单 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body :size="drawerSize"
      @close="handleCloseDialog">
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select v-model="formData.parentId" :data="menuOptions" :props="{ value: 'id', label: 'name' }"
            check-strictly value-key="id" placeholder="选择父级菜单" clearable style="width: 100%" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="图标" prop="icon" v-if="formData.type !== 3">
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>

        <el-form-item label="路由路径" prop="routePath" v-if="formData.type !== 3">
          <el-input v-model="formData.routePath" placeholder="请输入路由路径" />
        </el-form-item>

        <el-form-item label="组件路径" prop="component" v-if="formData.type === 2">
          <el-input v-model="formData.component" placeholder="请输入组件路径" />
        </el-form-item>

        <el-form-item label="权限标识" prop="perm" v-if="formData.type === 3">
          <el-input v-model="formData.perm" placeholder="请输入权限标识" />
        </el-form-item>

        <el-form-item label="是否可见" prop="visible" v-if="formData.type !== 3">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否缓存" prop="keepAlive" v-if="formData.type === 2">
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="总是显示" prop="alwaysShow" v-if="formData.type === 1">
          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
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
import MenuAPI, { type MenuVO, type MenuForm, type MenuQuery } from "@/api/system/menu.api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/IconSelect/index.vue'; // 假设有这个组件


defineOptions({
  name: "Menu",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const menuFormRef = ref();

const queryParams = reactive<MenuQuery>({
  keywords: undefined,
});

const pageData = ref<MenuVO[]>([]);
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增菜单",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<MenuForm>({
  parentId: "-1", // 默认顶级菜单
  name: "",
  type: 2, // 默认菜单类型为"菜单"
  visible: 1, // 默认显示
  sort: 0,
  routePath: "",
  component: "",
  perm: "",
  keepAlive: 0, // 默认不缓存
  alwaysShow: 0, // 默认不总是显示
});

const rules = reactive({
  name: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  type: [{ required: true, message: "菜单类型不能为空", trigger: "change" }],
  routePath: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (formData.type !== 3 && !value) {
          callback(new Error("路由路径不能为空"));
        } else {
          callback();
        }
      }, trigger: "blur"
    }
  ],
  component: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (formData.type === 2 && !value) {
          callback(new Error("组件路径不能为空"));
        } else {
          callback();
        }
      }, trigger: "blur"
    }
  ],
  perm: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (formData.type === 3 && !value) {
          callback(new Error("权限标识不能为空"));
        } else {
          callback();
        }
      }, trigger: "blur"
    }
  ],
});

// 选中的菜单ID
const selectIds = ref<string[]>([]);

// 菜单下拉选项 (用于父级菜单选择)
const menuOptions = ref<MenuVO[]>([]);

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const result = await MenuAPI.getList(queryParams);
    // MenuAPI.getList 返回的是扁平化列表，需要转换成树形结构
    pageData.value = buildMenuTree(result.data || []); // 假设 MenuAPI.getList 返回 { data: MenuVO[] } 或者直接 MenuVO[]
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    ElMessage.error("获取菜单列表失败，请稍后重试");
    pageData.value = [];
  } finally {
    loading.value = false;
  }
}

// 构建菜单树形结构
function buildMenuTree(menuList: MenuVO[]): MenuVO[] {
  const tree: MenuVO[] = [];
  const menuMap: { [key: string]: MenuVO } = {};

  // 将所有菜单放入一个map中，方便查找
  menuList.forEach(menu => {
    menuMap[menu.id!] = { ...menu, children: [] };
  });

  menuList.forEach(menu => {
    if (menu.parentId && menu.parentId !== '-1') {
      const parent = menuMap[menu.parentId];
      if (parent) {
        parent.children!.push(menuMap[menu.id!]);
      } else {
        // 如果父级不存在，则视为顶级菜单
        tree.push(menuMap[menu.id!]);
      }
    } else {
      tree.push(menuMap[menu.id!]);
    }
  });

  // 对树进行排序（如果需要）
  // tree.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  // tree.forEach(sortChildren);

  return tree;
}

// 递归排序子菜单 (如果需要)
// function sortChildren(menu: MenuVO) {
//   if (menu.children && menu.children.length > 0) {
//     menu.children.sort((a, b) => (a.sort || 0) - (b.sort || 0));
//     menu.children.forEach(sortChildren);
//   }
// }

// 获取菜单下拉选项
async function getMenuOptions() {
  try {
    const result = await MenuAPI.getOptions(true); // true 表示只获取父级菜单
    menuOptions.value = [{ id: "-1", name: "顶级菜单", children: [] }, ...result]; // 添加顶级菜单选项
  } catch (error) {
    console.error("获取菜单选项失败:", error);
  }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
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
      parentId: parentId || "-1", // 设置父级菜单，默认为顶级菜单
      name: "",
      type: 2, // 默认菜单类型为"菜单"
      visible: 1, // 默认显示
      sort: 0,
      routePath: "",
      component: "",
      perm: "",
      keepAlive: 0,
      alwaysShow: 0,
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
    parentId: "-1",
    name: "",
    type: 2,
    visible: 1,
    sort: 0,
    routePath: "",
    component: "",
    perm: "",
    keepAlive: 0,
    alwaysShow: 0,
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
      await MenuAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      // 新增菜单
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

onMounted(initComponent);

</script>
