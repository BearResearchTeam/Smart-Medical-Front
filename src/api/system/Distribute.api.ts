// @/api/UserAPI.ts (或者您实际的API文件路径)
import request from "@/utils/request"; // 确保您的 request 模块路径正确

const USER_BASE_URL = "api/app/dispensing-medicine/"; // 根据您的实际 API 路径调整
const howpital_BASE_URL = "api/app/hospitalized"
const UserAPI = {

  /**
   * 获取患者列表（待就诊或已就诊）
   * 根据传入的 PatientListQuery 参数进行查询
   * @param query 查询参数，包含就诊状态、关键词、分页信息
   * @returns 患者列表及总数
   */
  getPatientList(query: PatientListQuery) { // 方法名改为更通用的 getPatientList
    return request<any, GetPatientResponse>({
      url: `${USER_BASE_URL}visiting-patients`, // 假设同一个接口处理不同状态和搜索
      method: "post", // 您的后端接口是 POSTpatient/patient-info
      data: query, // 将查询参数作为请求体发送
    });
  },
  /**
   * 右侧基础信息卡片
   * @param query 
   * @returns 
   */
  getPatientIDWay(query: string) {
    return request<any, FormData>({
      url: `/api/app/patient/patient-info/${query}`,
      method: "get",
    });
  },

  //处方信息
  ConsultationRecord(query: string) {
    return request<any, DrugItem>({
      url: `${USER_BASE_URL}consultation-record/${query}`,
      method: "post",
    });
  },

  //分配药品
  DistributeMedicine(query: string) {
    return request<any, ApiResponse>({
      url: `${USER_BASE_URL}distribute-medicine`,
      method: "post",
      params: {
        patientNumber: query
      },
    });
  },


  /*住院信息*/
  getHospitalized(query: string) {
    return request<any, ApiResponse>({
      url: `${howpital_BASE_URL}?keyword=${query}`,
      method: "get",
    });
  },

  /*获取所有住院记录*/
  GetAllPatient() {
    return request<AllPatient[]>({
      url: `${howpital_BASE_URL}/patient`,
      method: "get",
    });
  },

  /*办理入院*/
  CreateAsync(query: string) {
    return request<any, ApiResponse>({
      url: `${howpital_BASE_URL}/${query}`,
      method: "post",
    });
  },

  /* 更新住院状态 */
  updateHospitalizedStatus(id: string, status: string) {
    return request<ApiResponse>({
      url: `${howpital_BASE_URL}/${id}/update-status`,
      method: 'post',
      params: { status }
    });
  },

  /* 获取登记列表 */
  getRegistrations(query: RegistrationQuery): Promise<RegistrationResponse> {
    return request({
      url: `${howpital_BASE_URL}/get-registrations`,
      method: 'post',
      data: query,
    });
  },

  /* 获取所有患者信息 (分页+模糊搜索) */
  getAllPatientInfos(query: GetAllPatientsQuery) {
    return request<GetAllPatientsResponse>({
      url: '/api/app/patient/patient-info',
      method: 'get',
      params: query,
    });
  },
};



export default UserAPI;

/*所有住院记录*/
export interface AllPatient {
  id: string,
  patientName: string
}
/* 获取所有患者信息查询参数 */
export interface GetAllPatientsQuery {
  Keyword?: string;
  PageIndex: number;
  PageSize: number;
}

/* 患者信息项 */
export interface PatientInfoItem {
  visitId: string;
  patientName: string;
  gender: number;
  age: number;
  ageUnit: string;
  contactPhone: string;
  idNumber: string;
  visitType: string;
  isİnfectiousDisease: boolean; // 注意：这个字段名来自后端，中间的 'i' 是一个特殊字符
  diseaseOnsetTime: string;
  emergencyTime: string | null;
  visitStatus: string;
  visitDate: string;
}

/* 获取所有患者信息响应 (注意：字段名来自后端，存在拼写错误) */
export interface GetAllPatientsResponse {
  totleCount: number;
  totlePage: number;
  items: PatientInfoItem[];
}

/* 登记信息查询参数 */
export interface RegistrationQuery {
  maxResultCount: number;
  skipCount: number;
  sorting?: string;
  startTime?: string;
  endTime?: string;
  departmentName?: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
  patientName?: string;
}

/* 登记信息列表项 */
export interface RegistrationItem {
  id: string;
  departmentName: string;
  patientName: string;
  doctorName: string;
  visitType: string;
  status: string;
  remarks: string;
  visitId: string;
  gender: number;
  age: number;
  ageUnit: string;
  contactPhone: string;
  idNumber: string;
  isInfectiousDisease: boolean;
  diseaseOnsetTime: string;
  emergencyTime: string | null;
  patientVisitStatus: string;
  patientVisitDate: string;
}

/* 登记信息响应 */
export interface RegistrationResponse {
  totalCount: number;
  items: RegistrationItem[];
}

// 住院患者信息
export interface HospitalizedPatient {
  id: string;
  basicPatientId: string;
  status: string;
  patientName: string;
  temperature: number;
  pulse: number;
  breath: number;
  bloodPressure: string;
  dischargeDiagnosis: string;
  inpatientNumber: string;
  dischargeDepartment: string;
  dischargeTime: string;
  admissionDiagnosis: string;
}

// 定义通用的 API 响应结构
export interface ApiResponse {
  isSuc: boolean;
  code: number;
  msg: string;
}

/** 药品信息 */
export interface DrugItem {
  drugId: string
  drugName: string
  dosage: string
  dosageUnit: string
  usage: string
  frequency: string
  number: string
  numberUnit: string
  medicalAdvice: string
}

/** 患者列表查询参数接口 */
export interface PatientListQuery {
  dispensingStatus: number; // 就诊状态：1 待就诊, 2 已就诊 (假设)
  keyword: string; // 搜索关键词 (患者姓名/联系方式/身份证号)
  pageIndex: number; // 当前页码
  pageSize: number; // 每页大小
}

/** 获取患者列表响应的数据部分 */
export interface GetPatientResponse {
  totalCount: number; // 总条数
  items: IPatient[]; // 患者列表
}

/** 患者信息接口 (对应后端返回的 items 数组中的单个对象) */
export interface IPatient {
  id: string;
  patientName: string; // 姓名
  gender: number; // 性别 0:女, 1:男
  age: number; // 年龄
  visitDate: string; // 就诊日期，后端返回的是 ISO 8601 格式字符串
}


// 右侧基础信息卡片数据
export interface FormData {
  patientName: string;
  gender: string;
  age: string;
  contactPhone: string;
  idNumber: string;
  visitType: string;
  isInfectiousDisease: boolean;
  diseaseOnsetTime: string;
}


