import request from "@/utils/request";
import { get } from "sortablejs";
const BASE_URL = "/api/app/doctor-account-serivce";

const DoctorAPI = {
  //查询医生列表
  getdoctorPage(queryParams?: DoctorPageQuery) {
    return request<DoctorListResponse>({
      url: `${BASE_URL}/doctor-account-audit-list`,
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
  //审核医生
  updatedoctor(id: string, data: DoctorAuditform) {
    return request<DoctorAuditform[]>({
      url: `${BASE_URL}/${id}/edit-doctor-account`,
      method: "post",
      data,
    });
  },
  //
getRoleUserGroupDto() {
    return request({
      url: `/api/app/user-role/role-user-groups`,
      method: "get",
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
  States:number;
}
/** 医生列表响应类型 */
export interface DoctorPageVO {
  id: string | undefined;
 departmentId:string | undefined,
  isActive: number,
  "doctorimgs": string,
  "accountId": string,
  "employeeId": string,
  "employeeName": string,
  "employeePhone": string,
  "sex": number,
  "institutionName": string,
  "departmentName": string,
  "doctorGoodat": string,
  "desc": string,
  "certificate": string,
  "auditName": string,
  "doctorId": string,
  "auditState": number,
  "auditDesc": string
}
export interface DoctorAuditform {
  id: string | undefined;
 departmentId:string | undefined,
  isActive: number,
  "doctorimgs": string,
  "accountId": string,
  "employeeId": string,
  "employeeName": string,
  "employeePhone": string,
  "sex": number,
  "institutionName": string,
  "departmentName": string,
  "doctorGoodat": string,
  "desc": string,
  "certificate": string,
  "auditName": string,
  "auditDesc": string
}

/** 医生表单类型 */
export interface DoctorForm {
  id: string | undefined;
 "departmentId": undefined,
  "isActive": number,
  "doctorimgs": string,
  "accountId": string,
  "employeeId": string,
  "employeeName": string,
  "employeePhone": string,
  "sex": number,
  "institutionName": string,
  "departmentName": string,
  "doctorGoodat": string,
  "desc": string,
  "certificate": string,
  "auditName": string
}
/** 医生列表响应类型 */
export interface DoctorListResponse {
  data: DoctorPageVO[];
  totleCount: number;
  totlePage: number;
}
export default DoctorAPI;
