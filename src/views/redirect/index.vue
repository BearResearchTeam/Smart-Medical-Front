<template>
  <div />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const { params, query } = route;
const { path } = params;

// // 2. 使用 path.resolve 来确保路径正确
// // `path` 可能是一个数组，所以用 .toString()
// const resolvedPath = pathBrowserify.resolve("/", path.toString());
// router.replace({ path: resolvedPath, query });


// 手动移除 path 前面的所有斜杠
const cleanedPath = path.toString().replace(/^\/+/, "");

router.replace({ path: "/" + cleanedPath, query });
</script>
