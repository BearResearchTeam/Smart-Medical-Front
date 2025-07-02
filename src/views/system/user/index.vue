<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 用户列表 -->
      <el-col :lg="24" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="queryParams.keywords" placeholder="用户名/昵称/手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker v-model="queryParams.createTime" :editable="false" type="daterange" range-separator="~"
                start-placeholder="开始时间" end-placeholder="截止时间" value-format="YYYY-MM-DD" />
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
              <el-button v-hasPerm="['sys:user:add']" type="success" icon="plus" @click="handleOpenDialog()">
                新增
              </el-button>
              <el-button v-hasPerm="'sys:user:delete'" type="danger" icon="delete" :disabled="selectIds.length === 0"
                @click="handleDelete()">
                删除
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <el-button v-hasPerm="'sys:user:import'" icon="upload" @click="handleOpenImportDialog">
                导入
              </el-button>

              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                导出
              </el-button>
            </div>
          </div>

          <el-table v-loading="loading" :data="pageData" border stripe highlight-current-row class="data-table__content"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="用户名" prop="userName" />
            <el-table-column label="邮箱" align="center" prop="userEmail" width="160" />
            <el-table-column label="手机号码" align="center" prop="userPhone" width="120" />
            <el-table-column label="性别" width="100" align="center">
              <template #default="{ row }">
                <span v-if="row.userSex === true">男</span>
                <span v-else-if="row.userSex === false">女</span>
                <span v-else>未知</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="primary" link size="small" icon="edit" @click="handleOpenDialog(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" icon="delete" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="fetchData" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" append-to-body :size="drawerSize"
      @close="handleCloseDialog">
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" :readonly="!!formData.id" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item v-if="!formData.id" label="用户密码" prop="userPwd">
          <el-input v-model="formData.userPwd" placeholder="请输入用户密码" type="password" show-password />
        </el-form-item>

        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="formData.userEmail" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>

        <el-form-item label="手机号码" prop="userPhone">
          <el-input v-model="formData.userPhone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <!-- 恢复性别字段 -->
        <el-form-item label="性别" prop="userSex">
          <el-radio-group v-model="displayUserSex">
            <el-radio :value="true">男</el-radio>
            <el-radio :value="false">女</el-radio>
            <el-radio :value="'unknown'">未知</el-radio>
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

    <!-- 用户导入 (保留) -->
    <UserImport v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import MyUserAPI, { type UserListItem, type UserAddRequest, type UserUpdateRequest } from "@/api/myuser.api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";

import UserImport from "./components/UserImport.vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const userFormRef = ref();

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 10,
  keywords: undefined,
  status: undefined,
  createTime: undefined,
});

const pageData = ref<UserListItem[]>([]);
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增用户",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<UserAddRequest & UserUpdateRequest & { id?: string }>({
  userName: "",
  userPwd: "", // 初始化密码字段
  userEmail: "",
  userPhone: "",
  userSex: null, // 恢复性别字段
  id: undefined,
});

const rules = reactive({
  userName: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  userPwd: [
    { required: true, message: "用户密码不能为空", trigger: "blur" },
    { min: 6, message: "密码不能少于6位", trigger: "blur" },
  ],
  userEmail: [
    { pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/, message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  userPhone: [
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" },
  ],
  // 可以根据需要添加性别验证规则，例如：
  userSex: [{ required: true, message: "性别不能为空", trigger: "change" }],
});

// 选中的用户ID
const selectIds = ref<string[]>([]);
// 导入弹窗显示状态
const importDialogVisible = ref(false);

// 恢复 userSex 的计算属性
const displayUserSex = computed({
  get() {
    if (formData.userSex === true) return true;
    if (formData.userSex === false) return false;
    return 'unknown'; // 将null映射为'unknown'字符串
  },
  set(value: boolean | 'unknown') {
    if (value === 'unknown') {
      formData.userSex = null;
    } else {
      formData.userSex = value;
    }
  },
});

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    // 构造查询参数，与API接口匹配
    const params = {
      pageIndex: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keywords: queryParams.keywords,
      status: queryParams.status,
      beginTime: queryParams.createTime ? queryParams.createTime[0] : undefined,
      endTime: queryParams.createTime ? queryParams.createTime[1] : undefined,
    };

    console.log("发送查询参数:", params);

    const result = await MyUserAPI.getUserList(params);
    console.log("获取用户列表结果:", result);

    if (result) {
      pageData.value = result.data || [];
      total.value = result.totalCount || 0;
    } else {
      pageData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败，请稍后重试");
    pageData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.createTime = undefined;
  fetchData();
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开弹窗
 * @param row 用户行数据 (可选，用于编辑)
 */
async function handleOpenDialog(row?: UserListItem) {
  dialog.visible = true;
  if (row) {
    dialog.title = "修改用户";
    // 直接反填当前行数据
    Object.assign(formData, row);
    // 密码字段默认值
    formData.userPwd = "123456";
    // 确保ID也正确赋值
    formData.id = row.id;
  } else {
    dialog.title = "新增用户";
    // 重置formData
    Object.assign(formData, {
      userName: "",
      userPwd: "", // 新增时密码必填，确保清空
      userEmail: "",
      userPhone: "",
      id: undefined, // 确保新增时ID为空
    });
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined; // 清空ID
}

// 提交用户表单（防抖）
const handleSubmit = useDebounceFn(async () => {
  const valid = await userFormRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      // 编辑用户
      // 在调用更新接口前，将密码赋固定值
      formData.userPwd = "123456";
      await MyUserAPI.updateUser(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      // 新增用户
      await MyUserAPI.addUser(formData);
      ElMessage.success("新增成功");
    }
    handleCloseDialog();
    handleQuery();
  } catch (error) {
    console.error("提交用户失败:", error);
    ElMessage.error("操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 删除用户
 * @param id 用户ID (可选，用于单行删除)
 */
function handleDelete(id?: string) {
  const userIds = [id || selectIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      loading.value = true;
      try {
        await MyUserAPI.deleteUsers(userIds);
        ElMessage.success("删除成功");
        handleResetQuery();
      } catch (error) {
        console.error("删除用户失败:", error);
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

// 打开导入弹窗
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

// 导出用户
function handleExport() {
  ElMessage.info("导出功能暂未实现");
}

// 初始化组件
const initComponent = () => {
  handleQuery();
};

onMounted(initComponent);
</script>
