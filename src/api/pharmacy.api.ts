import request from "@/utils/request";

/**
 * 批量药品入库（POST /api/app/drug-in-stock/batch-stock-in）
 * @param data { details: 入库明细数组, operator: string, stockInTime: string }
 */
export function drugStockInBatch(data: {
  details: Array<{
    drugId?: string | number;
    pharmaceuticalCompanyId?: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
    productionDate?: string;
    expiryDate?: string;
    batchNumber?: string;
    supplier?: string;
    status?: string;
    creationTime?: string;
    [key: string]: any;
  }>;
  operator?: string;
  remark?: string;
  inStockTime?: string;
}) {
  return request({
    url: "/api/app/drug-in-stock/batch-stock-in",
    method: "post",
    data,
  });
}

// #region 类型定义

/** 制药公司列表项 */
export interface PharmaceuticalCompanyItem {
  id: string;
  name: string;
  // 可根据实际接口补充其它字段
}

/** 新增制药公司请求体 */
export interface PharmaceuticalCompanyAddRequest {
  name: string;
  // 可根据实际接口补充其它字段
}

// #endregion

// 获取所有制药公司列表
export function getAllPharmaceuticalCompanies() {
  return request({
    url: "/api/app/pharmaceutical-company/all",
    method: "get",
  });
}

// 根据公司名称查询公司
export function findPharmaceuticalCompanyByName(name: any) {
  return request({
    url: "/api/app/pharmaceutical-company/find-by-name",
    method: "get",
    params: { name },
  });
}

// 新增制药公司
export function createPharmaceuticalCompany(data: any) {
  return request({
    url: "/api/app/pharmaceutical-company",
    method: "post",
    data,
  });
}

// 修改制药公司
export function updatePharmaceuticalCompany(id: string, data: any) {
  return request({
    url: `/api/app/pharmaceutical-company/${id}`,
    method: "put",
    data,
  });
}

// 删除制药公司
export function deletePharmaceuticalCompany(id: string) {
  return request({
    url: `/api/app/pharmaceutical-company/${id}`,
    method: "delete",
  });
}
