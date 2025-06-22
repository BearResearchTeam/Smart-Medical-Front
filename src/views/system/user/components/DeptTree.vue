<!-- 部门树 -->
<template>
  <el-card shadow="never">
    <el-input v-model="deptName" placeholder="部门名称" clearable>
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <el-tree ref="deptTreeRef" class="mt-2" :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }" :expand-on-click-node="false"
      :filter-node-method="handleFilter" default-expand-all @node-click="handleNodeClick" />
  </el-card>
</template>

<script setup lang="ts">
import DeptAPI from "@/api/system/dept.api";
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
});

const deptList = ref<OptionType[]>([]); // 部门列表，初始化为空数组而非undefined
const deptTreeRef = ref(); // 部门树
const deptName = ref(""); // 部门名称，初始化为空字符串

const emits = defineEmits(["update:modelValue", "node-click"]);

const deptId = useVModel(props, "modelValue", emits);

// 只有当deptTreeRef和deptName都有值时才过滤
watch(deptName, (newVal) => {
  if (deptTreeRef.value) {
    deptTreeRef.value.filter(newVal);
  }
});

/**
 * 部门筛选
 */
function handleFilter(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
}

/** 部门树节点 Click */
function handleNodeClick(data: { [key: string]: any }) {
  deptId.value = data.value;
  emits("node-click");
}

// 改用onMounted并添加错误处理
onMounted(() => {
  loadDeptTree();
});

// 提取加载部门树的方法
async function loadDeptTree() {
  try {
    const data = await DeptAPI.getOptions();
    deptList.value = data || [];
  } catch (error) {
    console.error("加载部门树失败:", error);
    deptList.value = [];
  }
}
</script>
