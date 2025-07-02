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

export default new AppointmentAPI();
