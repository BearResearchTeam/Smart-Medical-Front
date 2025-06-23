import request from "@/utils/request";

const DEPT_BASE_URL = "/api/app/doctor-department/doctor-department-list";

const DeptAPI = {
  /**
   * 获取科室列表
   *
   * @param queryParams 查询参数（可选）
   * @returns 部门树形表格数据
   */
  getList(queryParams?: DeptQuery) {
    return request<any,DeptForm>({
      url: `${DEPT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取科室下拉列表 */
  // getOptions() {
  //   // return request<any, OptionType[]>({
  //   //   url: `${DEPT_BASE_URL}/options`,
  //   //   method: "get",
  //   // });
  //   return Promise.resolve({
  //     code: "200",
  //     data: [
  //       {
  //         value: "1",
  //         label: "技术部",
  //       },
  //       {
  //         value: "2",
  //         label: "市场部",
  //       },
  //       {
  //         value: "3",
  //         label: "销售部",
  //       },
  //     ],
  //     msg: "success",
  //   });
  // },

  /**
   * 获取科室表单数据
   *
   * @param id 部门ID
   * @returns 部门表单数据
   */
  getFormData(queryParams?: DeptQuery) {
    return request<any, DeptForm>({
      url: `${DEPT_BASE_URL}`,
      method: "get",
       params: queryParams,
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
      url: `${DEPT_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改科室
   *
   * @param id 科室ID
   * @param data 科室表单数据
   * @returns 请求结果
   */
  update(id: string, data: DeptForm) {
    return request({
      url: `${DEPT_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除科室
   *
   * @param ids 科室ID，多个以英文逗号(,)分隔
   * @returns 请求结果
   */
  deleteByIds(ids: string) {
    return request({
      url: `${DEPT_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default DeptAPI;

/** 部门查询参数 */
export interface DeptQuery {
  /** 搜索关键字 */
  DepartmentName?: string;
  PageIndex: number,
  PageSize:number
  /** 状态 */
  //status?: number;
}

/** 科室类型 */
// export interface DeptVO {
//   /** 子部门 */
//   children?: DeptVO[];
//   /** 创建时间 */
//   createTime?: Date;
//   /** 部门ID */
//   id?: string;
//   /** 部门名称 */
//   name?: string;
//   /** 部门编号 */
//   code?: string;
//   /** 父部门ID */
//   parentid?: string;
//   /** 排序 */
//   sort?: number;
//   /** 状态(1:启用；0:禁用) */
//   status?: number;
//   /** 修改时间 */
//   updateTime?: Date;
// }

/** 科室表单类型 */
export interface DeptForm {
  /** 部门ID(新增不填) */
  id?: string;
  /** 部门名称 */
 "departmentName": string,
  "departmentCategory": string,
  "address": string,
  "directorName": string,
  "doctorCount": number,
  "pharmacistCount": number,
  "nurseCount": number,
  "type": string
}
