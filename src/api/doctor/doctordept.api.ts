import request from "@/utils/request";

const DEPT_BASE_URL = "/api/app/doctor-department/";

const DeptAPI = {
  /**
   * 获取科室列表
   *
   * @param queryParams 查询参数（可选）
   * @returns 科室列表响应
   */

  getdeptlist(data: any): Promise<DeptListResponse> {
    // 正常API调用
    console.log("执行实际登录API调用", data);
    return request<DeptListResponse>({
      url: "/api/app/doctor-department/doctor-department-list",
      method: "get",
      params: data, // 将查询参数作为请求体发送
    });
  },
  //查询科室列表(下拉)
getdept(){
    return request<Deptselete>({
      url: "/api/app/doctor-department/doctor-department",
      method: "get",
     
    });
  },
  /**
   * 获取科室表单数据
   *
   * @param id 部门ID
   * @returns 部门表单数据
   */
  getFormData(id: string) {
    return request<DeptForm>({
      url: `${DEPT_BASE_URL}/${id}`,
      method: "get",
      // params: queryParams,
    });
  },

  /**
   * 新增科室
   *
   * @param data 科室表单数据
   * @returns 请求结果
   */
  create(data: DeptForm) {
    return request({
      url: `/api/app/doctor-department/doctor-department`,
      method: "post",
      data,
    });
  },

  /**
   * 修改科室
   * /api/app/doctor-department/{id}/doctor-department
   * @param id 科室ID
   * @param data 科室表单数据
   * @returns 请求结果
   */
  update(id: string, data: DeptForm) {
    return request({
      url: `/api/app/doctor-department/${id}/doctor-department`,
      method: "put",
      data,
    });
  },

  /**
   * 删除科室
   * /api/app/doctor-department/delete-doctor-department
   * @param ids 科室ID，多个以英文逗号(,)分隔
   * @returns 请求结果
   */
  deleteByIds(idsString: string) {
    console.log("DeptAPI initialized",idsString)
    return request({
      url: `/api/app/doctor-department/delete-doctor-department`,
      method: "put",
      params:{ idsString: idsString }
    });
    
  },
  
};

export default DeptAPI;
export interface Deptselete{
  id: string;
  departmentName: string;
}
/** 部门查询参数 */
export interface DeptQuery {
  /** 搜索关键字 */
  DepartmentName?: string;
  PageIndex: number;
  PageSize: number;
  /** 状态 */
  //status?: number;
}

/** 科室表单类型 */
export interface DeptForm {
  /** 部门ID(新增不填) */
  id?: string;
  /** 部门名称 */
  departmentName: string;
  departmentCategory: string;
  address: string;
  directorName: string;
  doctorCount: number;
  pharmacistCount: number;
  nurseCount: number;
  type: string;
}

/** 科室列表响应类型 */
export interface DeptListResponse {
  data: DeptForm[];
  totleCount: number;
  totlePage: number;
}
