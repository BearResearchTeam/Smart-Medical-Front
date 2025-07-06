import request from "@/utils/request";

// 患者表单数据类型
export interface PatientForm {
  id?: number;
  patientName: string;
  gender: string;
  age: number;
  phone: string;
  idCard: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  allergies: string;
  status: string;
  createTime?: string;
  updateTime?: string;
}

// 患者查询参数类型
export interface PatientQuery {
  PatientName?: string;
  Phone?: string;
  IdCard?: string;
  PageIndex: number;
  PageSize: number;
}

// 患者列表响应类型
export interface PatientListResponse {
  data: PatientForm[];
  totleCount: number;
  totlePage: number;
  message: string;
  success: boolean;
}

// 患者API类
class PatientAPI {
  // 获取患者列表
  static getPatientList(params: PatientQuery): Promise<PatientListResponse> {
    return request({
      url: "/api/patient/list",
      method: "get",
      params,
    });
  }

  // 获取患者详情
  static getPatientById(id: number): Promise<{ data: PatientForm; success: boolean; message: string }> {
    return request({
      url: `/api/patient/${id}`,
      method: "get",
    });
  }

  // 新增患者
  static addPatient(data: PatientForm): Promise<{ success: boolean; message: string }> {
    return request({
      url: "/api/patient/add",
      method: "post",
      data,
    });
  }

  // 更新患者信息
  static updatePatient(data: PatientForm): Promise<{ success: boolean; message: string }> {
    return request({
      url: "/api/patient/update",
      method: "put",
      data,
    });
  }

  // 删除患者
  static deletePatient(id: number): Promise<{ success: boolean; message: string }> {
    return request({
      url: `/api/patient/delete/${id}`,
      method: "delete",
    });
  }

  // 批量删除患者
  static batchDeletePatient(ids: number[]): Promise<{ success: boolean; message: string }> {
    return request({
      url: "/api/patient/batch-delete",
      method: "delete",
      data: { ids },
    });
  }
}

export default PatientAPI; 