import request from "@/utils/request";

export interface AppointmentFormData {
  patientId?: string | null; // 新增字段，后端表示可为空或任意值
  appointmentDateTime: string; // ISO 字符串用于日期时间
  remarks?: string;
  status: number;
  actualFee: number;
  visitId?: string; // 新增字段
  visitStatus?: string; // 新增字段
  visitDate?: string; // 新增字段，日期时间字符串
  // 以下是从 PatientInfoForm 移动过来的字段
  patientName: string;
  gender: number; // 假设 1 为男，2 为女
  age: number;
  ageUnit: string;
  contactPhone: string;
  idNumber: string;
  visitType: string;
  isInfectiousDisease: boolean;
  diseaseOnsetDateTime?: string; // ISO 字符串用于日期时间
  emergencyTime?: string; // ISO 字符串用于日期时间
}

class AppointmentAPI {
  /**
   * 添加预约
   * @param data 预约数据
   */
  addAppointment(data: AppointmentFormData) {
    return request({
      url: "/api/app/patient/make-appointment", // 改回带有 /app 的完整路径
      method: "post",
      data,
    });
  }
}

/**
 * 获取药品入库+药品+制药公司联合信息列表
 * GET /api/app/medical/drug-in-stock-company-full-list
 */
export function getDrugInStockCompanyFullList() {
  return request({
    url: "/api/app/medical/drug-in-stock-company-full-list",
    method: "get",
  });
}

// 病历信息导出Excel
export function exportSickExcel() {
  return request({
    url: "/api/app/medical/export-sick-excel",
    method: "GET",
    responseType: "blob", // 关键：返回文件流
  });
}

export default new AppointmentAPI();
