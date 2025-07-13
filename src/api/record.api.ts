import request from "@/utils/request";
/**
 * 获取病人完整病历信息
 * GET /api/app/medical/patient-sick-full-info
 * 无需参数
 */
export function getPatientSickFullInfo() {
  return request({
    url: "/api/app/medical/patient-sick-full-info",
    method: "get",
  });
}

