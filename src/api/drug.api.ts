import request from "@/utils/request";

// #region 类型定义

/**
 * 药品列表项数据类型 (GET /drug/{id} 和分页列表中的项)
 */
export interface DrugListItem {
  id: string;
  drugName: string;
  drugType: string;
  feeName: string;
  dosageForm: string;
  specification: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  stockUpper: number;
  stockLower: number;
  productionDate: string;
  expiryDate: string;
  effect: string;
  category: number;
  pharmaceuticalCompanyId: string;
  pharmaceuticalCompanyName: string;
}

/**
 * 药品列表查询参数类型 (GET /drug)
 */
export interface DrugListParams {
  pageIndex?: number;
  pageSize?: number;
  drugName?: string;
  drugType?: string;
  productionDateStart?: string;
  productionDateEnd?: string;
  stockLower?: number;
  stockUpper?: number;
  pharmaceuticalCompanyId?: string;
  pharmaceuticalCompanyName?: string;
}

/**
 * 药品分页结果类型 (GET /drug)
 */
export interface DrugPageResult {
  data: DrugListItem[];
  /**
   * 总记录数
   * @remark 后端接口字段为 totleCount (可能存在拼写错误)
   */
  totleCount: number;
  totalPage: number;
}

/**
 * 新增药品请求体类型 (POST /drug)
 */
export interface DrugAddRequest {
  drugName: string;
  drugType: string;
  feeName: string;
  dosageForm: string;
  specification: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  stockUpper: number;
  stockLower: number;
  productionDate: string;
  expiryDate: string;
  effect: string;
  category: number;
  pharmaceuticalCompanyId: string;
  pharmaceuticalCompanyName: string;
}

/**
 * 修改药品请求体类型 (PUT /drug/{id})
 */
export type DrugUpdateRequest = Partial<DrugAddRequest>;

// #endregion

/**
 * 药品API接口
 */
const DrugAPI = {
  /**
   * 获取药品分页列表
   * @param params 查询参数
   */
  getDrugList(params?: DrugListParams) {
    return request<any, DrugPageResult>({
      url: "/api/app/drug", // <--- 改成这样
      method: "get",
      params,
    });
  },

  /**
   * 根据ID获取药品详情
   * @param id 药品ID
   */
  getDrugById(id: string) {
    return request<any, DrugListItem>({
      url: `/api/app/drug/${id}`,
      method: "get",
    });
  },

  /**
   * 新增药品
   * @param data 药品数据
   */
  addDrug(data: DrugAddRequest) {
    return request({
      url: "/api/app/drug",
      method: "post",
      data,
    });
  },

  /**
   * 修改药品
   * @param id 药品ID
   * @param data 药品数据
   */
  updateDrug(id: string, data: DrugUpdateRequest) {
    return request({
      url: `/api/app/drug/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除药品
   * @param id 药品ID
   */
  deleteDrug(id: string) {
    return request({
      url: `/api/app/drug/${id}`,
      method: "delete",
    });
  },
};

export default DrugAPI;
