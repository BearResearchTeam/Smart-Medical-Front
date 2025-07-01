<!-- filepath: d:\Practical projects\Smart-Medical-Front\src\views\system\patient\index.vue -->
<template>
	<div class="main-layout">
		<!-- 左侧就诊列表 -->
		<div class="today-visit-container">
			<div class="header-section">
				<h2 class="page-title">今日就诊</h2>
				<el-button type="primary" :icon="Plus" class="quick-reception-btn" @click="handleQuickReception">
					快速接诊
				</el-button>
			</div>
			<div class="search-section">
				<el-input v-model="searchQuery" placeholder="请输入患者姓名/联系方式/身份证号" class="search-input" clearable
					@keyup.enter="handleSearch">
					<template #append>
						<el-button :icon="Search" @click="handleSearch">搜索</el-button>
					</template>
				</el-input>
			</div>
			<div class="tabs-section">
				<el-tabs v-model="activeTab" class="visit-tabs" @tab-change="handleTabChange">
					<el-tab-pane name="pending">
						<template #label>
							<span class="tab-label">待就诊 <el-tag v-if="pendingCount > 0" type="danger" size="small">{{ pendingCount
}}</el-tag></span>
						</template>
						<div class="list-wrapper">
							<template v-if="pendingPatients.length > 0">
								<div v-for="(patient, index) in pendingPatients" :key="patient.id" class="patient-list-item">
									<div class="patient-info" @click="handlePatientClick(patient.id)">
										<span class="index">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
										<span class="name">{{ patient.patientName }}</span>
										<span class="gender">{{ formatGender(patient.gender) }}</span>
										<span class="age">{{ patient.age }}岁</span>
									</div>
									<div class="visit-time">
										<span>{{ formatDateTime(patient.visitDate) }}</span>
										<el-icon class="arrow-icon">
											<ArrowRight />
										</el-icon>
									</div>
								</div>
							</template>
							<el-empty v-else description="暂无待就诊患者" />
						</div>
						<div class="pagination-section">
							<el-pagination v-if="pendingCount > 0" background layout="prev, pager, next" :total="pendingCount"
								:page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
						</div>
					</el-tab-pane>
					<el-tab-pane name="completed">
						<template #label>
							<span class="tab-label">已就诊 <el-tag type="info" size="small">{{ completedCount }}+</el-tag></span>
						</template>
						<div class="list-wrapper">
							<template v-if="completedPatients.length > 0">
								<div v-for="(patient, index) in completedPatients" :key="patient.id" class="patient-list-item">
									<div class="patient-info">
										<span class="index">{{ (currentPage - 1) * pageSize + index + 1 }}.</span>
										<span class="name">{{ patient.patientName }}</span>
										<span class="gender">{{ formatGender(patient.gender) }}</span>
										<span class="age">{{ patient.age }}岁</span>
									</div>
									<div class="visit-time">
										<span>{{ formatDateTime(patient.visitDate) }}</span>
										<el-icon class="arrow-icon">
											<ArrowRight />
										</el-icon>
									</div>
								</div>
							</template>
							<el-empty v-else description="暂无已就诊患者" />
						</div>
						<div class="pagination-section">
							<el-pagination v-if="completedCount > 0" background layout="prev, pager, next" :total="completedCount"
								:page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
						</div>
					</el-tab-pane>
				</el-tabs>
			</div>
		</div>
		<div>
			<!-- 右侧上面基础信息卡片 -->
			<el-card class="base-info-card">
				<template #header>
					<span class="base-info-title">基础信息</span>
				</template>
				<el-row :gutter="24" class="base-info-row">
					<el-col :span="4"><span class="label">患者姓名：</span>{{ formData.patientName }}</el-col>
					<el-col :span="3"><span class="label">性别：</span>{{ formData.gender }}</el-col>
					<el-col :span="4"><span class="label">年龄：</span>{{ formData.age }}</el-col>
					<el-col :span="5"><span class="label">联系方式：</span>{{ formData.contact }}</el-col>
					<el-col :span="5"><span class="label">身份证号：</span>{{ formData.idNumber }}</el-col>
				</el-row>
				<el-row :gutter="24" class="base-info-row" style="margin-top: 18px;">
					<el-col :span="6">
						<span class="label">治疗类型：</span>
						<el-radio-group v-model="formData.treatmentType" disabled>
							<el-radio label="初诊">初诊</el-radio>
							<el-radio label="复诊">复诊</el-radio>
						</el-radio-group>
					</el-col>
					<el-col :span="6">
						<span class="label">传染病：</span>
						<el-radio-group v-model="formData.infectiousDisease" disabled>
							<el-radio label="否">否</el-radio>
							<el-radio label="是">是</el-radio>
						</el-radio-group>
					</el-col>
					<el-col :span="7">
						<span class="label">发病时间：</span>
						<el-date-picker v-model="formData.onsetTime" type="datetime" placeholder="选择日期时间" disabled
							style="width: 220px" />
					</el-col>
					<el-col :span="5" style="text-align: right;">
						<el-button type="primary" @click="viewRecords">就诊记录</el-button>
					</el-col>
				</el-row>
			</el-card>

			<!-- 右侧中间病历信息卡片 -->
			<el-card class="middle-info-card">
				<template #header>
					<span class="base-info-title">病历</span>
				</template>

			</el-card>

			<!-- 右侧处方病历信息卡片 -->
			<el-card class="middle-info-card">
				<template #header>
					<span class="base-info-title">处方</span>
				</template>

			</el-card>
		</div>

	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Search, Plus, ArrowRight } from '@element-plus/icons-vue';
import UserAPI, {
	IPatient, PatientListQuery, FormData,
} from '@/api/system/patient.api';
import { ElMessage } from 'element-plus';

// 搜索框的值
const searchQuery = ref('');
// 当前激活的 Tab
const activeTab = ref('pending');

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(10);

// 待就诊数量和列表
const pendingCount = ref(0);
const pendingPatients = ref<IPatient[]>([]);

// 已就诊数量和列表
const completedCount = ref(0);
const completedPatients = ref<IPatient[]>([]);

// 格式化性别
const formatGender = (gender: number): string => {
	return gender === 1 ? '男' : '女';
};

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
	if (!dateTimeStr) return '';
	const date = new Date(dateTimeStr);
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${month}/${day} ${hours}:${minutes}`;
};

// 右侧基础信息卡片数据
const formData = ref<FormData>({
	patientName: '王芳',
	gender: '女',
	age: '5岁2月',
	contact: '',
	idNumber: '',
	treatmentType: '初诊',
	infectiousDisease: '否',
	onsetTime: ''
});

// 获取患者列表
const fetchPatientList = async (status: 'pending' | 'completed') => {
	let visitStatusValue: number;
	if (status === 'pending') {
		visitStatusValue = 1;
	} else {
		visitStatusValue = 2;
	}
	const query: PatientListQuery = ({
		visitStatus: visitStatusValue,
		keyword: searchQuery.value,
		pageIndex: currentPage.value,
		pageSize: pageSize.value,
	});

	try {
		const response = await UserAPI.getPatientList(query);
		if (status === 'pending') {
			pendingPatients.value = response.items;
			pendingCount.value = response.totalCount;
		} else {
			completedPatients.value = response.items;
			completedCount.value = response.totalCount;
		}
	} catch (error) {
		console.error(`获取${status === 'pending' ? '待就诊' : '已就诊'}患者请求失败:`, error);
	}
};

// 快速接诊按钮点击事件
const handleQuickReception = () => {
	ElMessage.success('跳转到快速接诊页面或打开弹窗！');
};

// 搜索按钮点击事件
const handleSearch = () => {
	currentPage.value = 1;
	fetchPatientList(activeTab.value as 'pending' | 'completed');
};

// Tab 切换时的处理
const handleTabChange = (name: string | number) => {
	currentPage.value = 1;
	fetchPatientList(name as 'pending' | 'completed');
};

// 分页器页码改变时的处理
const handlePageChange = (newPage: number) => {
	currentPage.value = newPage;
	fetchPatientList(activeTab.value as 'pending' | 'completed');
};

// 患者列表项点击事件
const handlePatientClick = async (id: string) => {
	const way = await UserAPI.getPatientIDWay(id);
	formData.value = way;
	console.log(way);
};

// 就诊记录按钮事件
const viewRecords = () => {
	ElMessage.info('查看就诊记录');
};

// 组件挂载时默认加载待就诊列表
onMounted(() => {
	fetchPatientList('pending');
});

</script>
<style lang="scss" scoped>
.main-layout {
	display: flex;
	align-items: flex-start;
	padding: 32px 0 0 32px;
	background: #f5f7fa;
	min-height: 100vh;
}

.today-visit-container {
	padding: 20px;
	background-color: var(--el-bg-color-page);
	border-radius: var(--el-border-radius-base);
	box-shadow: var(--el-box-shadow-light);
	width: 400px;
	min-height: 100vh;

	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid var(--el-border-color-lighter);

		.page-title {
			margin: 0;
			font-size: 24px;
			color: var(--el-text-color-primary);
		}
	}

	.search-section {
		margin-bottom: 20px;

		.search-input {
			width: 300px;
		}
	}

	.tabs-section {
		.visit-tabs {
			:deep(.el-tabs__header) {
				margin-bottom: 0;
			}

			:deep(.el-tabs__nav-wrap::after) {
				height: 0;
			}

			:deep(.el-tabs__item) {
				font-size: 16px;
				padding: 0 20px;
				height: 48px;
				line-height: 48px;
			}

			:deep(.el-tabs__active-bar) {
				background-color: var(--el-color-primary);
				height: 3px;
			}

			.tab-label {
				display: flex;
				align-items: center;

				.el-tag {
					margin-left: 8px;
					border-radius: 20px;
					height: 22px;
					line-height: 20px;
					padding: 0 8px;
					font-size: 12px;
				}
			}
		}
	}

	.list-wrapper {
		min-height: 300px;
		background-color: var(--el-bg-color);
		padding: 0 20px;
		border-top: 1px solid var(--el-border-color-lighter);
		border-radius: var(--el-border-radius-base);
		box-shadow: var(--el-box-shadow-lighter);

		.patient-list-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 0;
			border-bottom: 1px solid var(--el-border-color-extra-light);
			cursor: pointer;
			transition: background-color 0.2s ease;

			&:hover {
				background-color: var(--el-fill-color-light);
			}

			&:last-child {
				border-bottom: none;
			}

			.patient-info {
				display: flex;
				align-items: center;
				font-size: 16px;
				color: var(--el-text-color-regular);

				.index {
					font-weight: bold;
					margin-right: 10px;
					color: var(--el-text-color-primary);
				}

				.name {
					font-weight: bold;
					margin-right: 10px;
					color: var(--el-text-color-primary);
				}

				.gender,
				.age {
					margin-right: 10px;
					color: var(--el-text-color-secondary);
				}
			}

			.visit-time {
				display: flex;
				align-items: center;
				font-size: 14px;
				color: var(--el-text-color-secondary);

				.arrow-icon {
					margin-left: 8px;
					color: var(--el-text-color-placeholder);
				}
			}
		}

		:deep(.el-empty) {
			padding: 50px 0;
		}
	}

	.pagination-section {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		padding-bottom: 10px;
	}
}

.base-info-card {
	flex: 1;
	width: 120vh;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 8px #f0f1f2;
	padding: 32px 32px 24px 32px;
	margin-left: 0px;

	.base-info-title {
		font-weight: bold;
		font-size: 18px;
		color: #333;
	}

	.base-info-row {
		font-size: 16px;
		color: #555;
		margin-bottom: 0;

		.label {
			font-weight: bold;
			color: #555;
			margin-right: 6px;
		}

		.el-radio-group {
			margin-left: 8px;
		}

		.el-date-editor {
			width: 220px;
		}
	}
}

.middle-info-card {
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	padding: 32px;
	flex: 1;
	/* 让它撑满剩余高度，如果整个 right-panel 有固定高度 */
}
</style>
