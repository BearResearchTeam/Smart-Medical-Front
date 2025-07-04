import request from "@/utils/request";
const BASE_URL = "/api/app/doctor-account-serivce";

const DoctorAPI = {
  //查询医生列表
  getdoctorPage(queryParams?: DoctorPageQuery) {
    return request<DoctorListResponse>({
      url: `${BASE_URL}/doctor-account-list`,
      method: "get",
      params: queryParams,
    });
  },
  //新增医生
  createdoctor(data: DoctorForm) {
    return request<DoctorForm>({
      url: `${BASE_URL}/doctor-account`,
      method: "post",
      data,
    });
  },
  //修改医生
  updatedoctor(id: string, data: DoctorForm) {
    return request<DoctorPageVO[]>({
      url: `${BASE_URL}/${id}/edit-doctor-account`,
      method: "post",
      data,
    });
  },
  //删除医生
  deletedoctor(idsString: string) {
    return request<DoctorPageVO[]>({
      url: `${BASE_URL}/doctor-account`,
      method: "delete",
      params: { idsString: idsString },
    });
  }
};
/** 医生列表查询参数 */
export interface DoctorPageQuery {
  Sorting: number;
  SkipCount: number;
  MaxResultCount: number;
  EmployeeName: string;
}
/** 医生列表响应类型 */
export interface DoctorPageVO {
  id: string | undefined;
  departmentId: string;
  accountId: string;
  employeeId: string;
  employeeName: string;
  institutionName: string;
  departmentName: string;
  isActive: boolean;
}
/** 医生表单类型 */
export interface DoctorForm {
  id: string | undefined;
  departmentId: string;
  isActive: boolean;
  accountId: string;
  employeeId: string;
  employeeName: string;
  institutionName: string;
  departmentName: string;
}
/** 医生列表响应类型 */
export interface DoctorListResponse {
  data: DoctorPageVO[];
  totleCount: number;
  totlePage: number;
}
export default DoctorAPI;
