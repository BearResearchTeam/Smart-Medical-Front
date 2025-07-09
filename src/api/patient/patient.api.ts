import request from "@/utils/request";
import type { AxiosInstance } from "axios";
import { useUserStoreHook } from "@/store/modules/user.store";

// 患者信息接口 (用于主列表显示)
export interface PatientInfo {
  id: number; // 患者ID
  patientName: string; // 患者姓名 (对应图2 PatientName)
  gender: number; // 性别 (对应图2 Gender)
  age: number; // 年龄 (对应图2 Age)
  ageUnit?: string; // 年龄单位 (新增，对应图2 AgeUnit)
  contactPhone: string; // 联系电话 (对应图2 ContactPhone)
  idNumber: string; // 身份证号 (对应图2 IdNumber)
  address: string; // 地址
  createdTime: string;
  updatedTime: string;
}

// 预约信息接口 (用于预约详情弹窗显示，整合了图2的就诊信息)
export interface AppointmentInfo {
  id: number;
  patientId: number;
  departmentName?: string; // 科室名称 (原有)
  doctorName?: string; // 医生名称 (原有)
  appointmentTime?: string; // 预约时间 (原有，可考虑用 visitDate 替代)
  status?: number; // 预约状态 (原有)
  createdTime: string; // 创建时间 (原有)
  visitType?: string; // 就诊类型 (新增，对应图2 VisitType)
  isinfectiousDisease?: boolean; // 是否传染病 (新增，对应图2 IsinfectiousDisease)
  diseaseOnsettime?: string; // 发病时间 (新增，对应图2 DiseaseOnsettime)
  emergencyTime?: string; // 紧急时间 (新增，对应图2 EmergencyTime)
  visitStatus?: string; // 就诊状态文本 (新增，对应图2 VisitStatus)
  visitDate?: string; // 就诊日期 (新增，对应图2 VisitDate)
}

// 用户关联患者记录接口 (根据用户ID查询的结果)
export interface UserAssociatedPatientRecord {
  patientId: string; // 患者ID (GUID)
  visitId: string; // 就诊ID (GUID)
  patientName: string;
  gender: number;
  age: number;
  ageUnit: string; // 新增 ageUnit 属性
  contactPhone: string;
  idNumber: string;
  visitType: string;
  isinfectiousDisease: boolean;
  diseaseOnsettime: string;
  emergencyTime: string;
  visitStatus: string;
  visitDate: string;
}

// 分页查询参数
export interface PatientPageQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
}

// 分页响应数据
export interface PatientPageVO {
  list: PatientInfo[];
  total: number;
}

export interface PatientFormData {
  patientName: string;
  age: number | undefined;
  ageUnit: string;
  gender: boolean;
  contactPhone: string;
  idNumber: string;
  visitType: string;
  isInfetiousDisease: boolean;
  diseaseOnsetTime: string | undefined;
  emergencyTime: string | undefined;
  visitStatus: string;
  visitDate: string;
}

/**
 * 患者 API
 */
export const PatientAPI = {
  /**
   * 获取患者分页列表
   */
  getPage(params: PatientPageQuery) {
    // 模拟接口返回数据
    return new Promise<PatientPageVO>((resolve) => {
      setTimeout(() => {
        const mockData: PatientInfo[] = [
          {
            id: 1,
            patientName: "张三",
            gender: 1,
            age: 30,
            ageUnit: "岁",
            contactPhone: "13811112222",
            idNumber: "110101199001011234",
            address: "北京市朝阳区",
            createdTime: "2023-01-01 10:00:00",
            updatedTime: "2023-01-01 10:00:00",
          },
          {
            id: 2,
            patientName: "李四",
            gender: 0,
            age: 25,
            ageUnit: "岁",
            contactPhone: "13933334444",
            idNumber: "110101199505055678",
            address: "上海市浦东新区",
            createdTime: "2023-02-01 11:00:00",
            updatedTime: "2023-02-01 11:00:00",
          },
        ];
        resolve({
          list: mockData,
          total: mockData.length,
        });
      }, 500);
    });
    // 实际接口调用
    // return (request as AxiosInstance).get<PatientPageVO>('/patient/page', { params });
  },

  /**
   * 获取患者预约信息
   */
  getAppointments(patientId: string, params?: { MaxResultCount: string; SkipCount: string }) {
    return request<any, { data: AppointmentInfo[]; totleCount: number }>({
      url: `/api/app/patient/appointment`,
      method: "get",
      params: {
        PatientId: patientId,
        ...params,
      },
    });
  },

  /**
   * 根据用户ID添加并关联患者信息
   * @param userId 当前登录用户的ID
   * @param data 患者信息
   */
  addPatientForUser(userId: string, data: PatientFormData) {
    return request({
      url: `/api/app/user/patient-info/${userId}`,
      method: "post",
      data,
    });
  },

  // 获取单个预约的详细信息

  // 根据用户ID获取关联患者的就诊记录
  getAssociatedPatients() {
    const userStore = useUserStoreHook();
    const userId = userStore.userInfo.userId;
    //const userId = "f388f807-62c0-820f-412f-3a1ad1d6a48d";

    console.log(`调用 PatientAPI.getAssociatedPatients，用户ID: ${userId}`);
    return request<any, UserAssociatedPatientRecord[]>({
      url: `api/app/patient/my-patients/${userId}`,
      method: "get",
    });
  },

  // 删除患者
  deleteByIds(ids: string) {
    return (request as AxiosInstance).delete(`/patient/${ids}`);
  },

  // 导出患者数据
  export(params: PatientPageQuery) {
    return (request as AxiosInstance).get("/patient/export", { params, responseType: "blob" });
  },
};
