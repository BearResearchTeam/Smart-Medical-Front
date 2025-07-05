// @/api/UserAPI.ts (或者您实际的API文件路径)
import request from "@/utils/request"; // 确保您的 request 模块路径正确
import { get } from "sortablejs";

const USER_BASE_URL = "/api/app/patient/"; // 根据您的实际 API 路径调整

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
      url: `${USER_BASE_URL}patient-info/${query}`,
      method: "get",
    });
  },

  /**
   * 右侧病历信息卡片
   * @param query 
   * @returns 
   */
  Getpatientsick(query: string) {
    return request<any, patientsickFormData>({
      url: `${USER_BASE_URL}patient-sick-info/${query}`,
      method: "get",
    })
  },
  /**
   * 新增患者/患者登记
   * @param data 患者信息接口 (对应后端返回的 items 数组中的单个对象)
   * @returns 
   */
  AddPatient(data: RegistrationPatient) {
    return request<any, ApiResponse>({
      url: `${USER_BASE_URL}registration-patient`,
      method: "post",
      data
    })
  },

  /**
   * 获取医生科室
   * @returns 
   */
  GetDoctorDepartMentList() {
    return request<any, GetDoctorDepartMent>({
      url: `/api/app/doctor-account-serivce/departments`,
      method: "get",
      params: {},
    })
  },

  /**
   * 根据科室获取医生
   * @param query 科室Id
   */
  GetDoctorCardId(query: string) {
    return request<any, GetDoctor>({
      url: `/api/app/doctor-account-serivce/doctors-by-department-id/${query}`,
      method: "get",
      params: {},
    })
  }




};



export default UserAPI;

// 定义通用的 API 响应结构
export interface ApiResponse {
  isSuc: boolean;
  code: number;
  msg: string;
}

/** 患者所有病历信息 */
export interface patientsickFormData {
  basicPatientId: string;
  temperature: string;
  pulse: string;
  breath: string;
  bloodPressure: string,
  chiefComplaint: string,
  drugIds: null,
  prescriptionTemplateNumber: string;
  medicalAdvice: string,
  drugItems: [
    {
      drugId: string;
      dosage: string;
      dosageUnit: string,
      usage: string,
      frequency: string,
      number: string;
      numberUnit: string,
      medicalAdvice: string,
    },
  ]
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
  visitStatus: number; // 就诊状态：1 待就诊, 2 已就诊 (假设)
  keyword: string; // 搜索关键词 (患者姓名/联系方式/身份证号)
  pageIndex: number; // 当前页码
  pageSize: number; // 每页大小
}

/** 获取患者列表响应的数据部分 */
export interface GetPatientResponse {
  totalCount: number; // 总条数
  items: IPatient[]; // 患者列表
}

export interface getPatientID {
  patientId: string
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

/** 患者信息接口 (对应后端返回的 items 数组中的单个对象) */
export interface RegistrationPatient {
  /** 患者姓名 */
  patientName: string;
  /** 性别 【1】男【2】女 */
  gender: number; // 注意：后端是int类型，前端也用number
  /** 年龄 */
  age: number;
  /** 年龄单位（年/月/日） */
  ageUnit: string;
  /** 联系方式 */
  contactPhone: string;
  /** 身份证号 */
  idNumber: string;
  /** 是否为传染病 */
  isInfectiousDisease: boolean;
  /** 发病时间 */
  diseaseOnsetTime: Date; // 后端DateTime?，前端通常用string表示ISO 8601格式日期，或null
  /** 主治医生ID (关联到 DoctorAccount 实体) */
  doctorId: string; // GUID在前端通常用string表示
  /** 门诊科室名称 */
  departmentName: string;
  /** 就诊类型（初诊/复诊） */
  visitType: string;
  /** 就诊日期 */
  visitDate: string; // 后端DateTime，前端用string表示ISO 8601格式日期
  /** 备注信息 */
  remarks: string;
  /** 体温 (单位：摄氏度（℃）) */
  temperature: number; // 后端decimal，前端用number表示
  /** 脉搏 (单位：次/分钟) */
  pulse: number;
  /** 呼吸频率 (单位：次/分钟) */
  breath: number;
  /** 血压 (格式：收缩压/舒张压，例如：120/80) */
  bloodPressure: string;
}

export interface GetDoctorDepartMent {
  id: string,
  departmentName: string
}

export interface GetDoctor {
  id: string,
  employeeName: string
}
