// @/api/UserAPI.ts (或者您实际的API文件路径)
import request from "@/utils/request"; // 确保您的 request 模块路径正确

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
};






export default UserAPI;

// 定义通用的 API 响应结构
export interface ApiResponse<T> {
  data: T;
  isSuc: boolean;
  code: number;
  msg: string;
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
  contact: string;
  idNumber: string;
  treatmentType: string;
  infectiousDisease: string;
  onsetTime: string;
}
