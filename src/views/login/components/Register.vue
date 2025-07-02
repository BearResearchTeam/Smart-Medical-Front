<template>
  <div>
    <h3 text-center m-0 mb-20px>{{ t("login.reg") }}</h3>
    <el-form ref="formRef" :model="model" :rules="rules" size="large">
      <!-- 用户名 -->
      <el-form-item prop="userName">
        <el-input v-model.trim="model.userName" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="userPwd">
          <el-input v-model.trim="model.userPwd" :placeholder="t('login.password')" type="password" show-password
            @keyup="checkCapsLock" @keyup.enter="submit">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- 邮箱 -->
      <el-form-item prop="userEmail">
        <el-input v-model.trim="model.userEmail" placeholder="邮箱">
            <template #prefix>
            <el-icon>
              <Message />
            </el-icon>
            </template>
          </el-input>
        </el-form-item>

      <!-- 手机号码 -->
      <el-form-item prop="userPhone">
        <el-input v-model.trim="model.userPhone" placeholder="手机号码">
            <template #prefix>
            <el-icon>
              <Iphone />
            </el-icon>
            </template>
          </el-input>
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别" prop="userSex">
        <el-radio-group v-model="displayUserSex">
          <el-radio :value="true">男</el-radio>
          <el-radio :value="false">女</el-radio>
          <el-radio :value="'unknown'">未知</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <div class="flex-y-center w-full gap-10px">
          <el-checkbox v-model="isRead">{{ t("login.agree") }}</el-checkbox>
          <el-link type="primary" underline="never">{{ t("login.userAgreement") }}</el-link>
        </div>
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button :loading="loading" type="success" class="w-full" @click="submit">
          {{ t("login.reg") }}
        </el-button>
      </el-form-item>
    </el-form>
    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.haveAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toLogin">{{ t("login.login") }}</el-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { Lock, Message, Iphone } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import MyUserAPI, { type UserRegisterRequest } from "@/api/myuser.api";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const emit = defineEmits(["update:modelValue"]);
const toLogin = () => emit("update:modelValue", "login");

const formRef = ref<FormInstance>();
const loading = ref(false); // 按钮 loading 状态
const isCapsLock = ref(false); // 是否大写锁定
const isRead = ref(false);

// userSex的计算属性，用于处理el-radio-group不支持null的问题
const displayUserSex = computed({
  get() {
    if (model.value.userSex === true) return true;
    if (model.value.userSex === false) return false;
    return 'unknown';
  },
  set(value: boolean | 'unknown') {
    if (value === 'unknown') {
      model.value.userSex = null;
    } else {
      model.value.userSex = value;
}
  },
});

const model = ref<UserRegisterRequest>({
  userName: "",
  userPwd: "",
  userEmail: "",
  userPhone: "",
  userSex: null,
});

const rules = computed(() => {
  return {
    userName: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    userPwd: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    userEmail: [
      {
        pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        message: "请输入正确的邮箱地址",
        trigger: "blur",
      },
    ],
    userPhone: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur",
      },
    ],
  };
});

// 检查输入大小写
function checkCapsLock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const submit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  if (!isRead.value) {
    ElMessage.warning("请先阅读并同意用户协议");
    return;
  }

  loading.value = true;
  try {
    await MyUserAPI.register(model.value);
    ElMessage.success("注册成功，请登录");
    toLogin(); // 注册成功后跳转到登录页
  } catch (error: any) {
    console.error("注册失败:", error);
    ElMessage.error(error.message || "注册失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>
