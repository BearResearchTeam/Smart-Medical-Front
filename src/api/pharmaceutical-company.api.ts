import request from "@/utils/request";

// #region 类型定义

/** 制药公司列表项 */
export interface PharmaceuticalCompanyItem {
  id: string;
  name: string; // 厂家名称
  contact: string; // 联系人
  address: string; // 地址
  phone: string; // 电话
  createBy: string; // 创建者
  createTime: string; // 创建时间
  enabled: boolean; // 启用状态
  enabledRemark: string; // 启用标记（如✔）
  companyType: string; // 厂商类型
}

/** 新增制药公司请求体 */
export interface PharmaceuticalCompanyAddRequest {
  name: string;
  // 可根据实际接口补充其它字段
}

// #endregion

const PharmaceuticalCompanyAPI = {
  /**
   * 根据公司名称查询
   * @param name 公司名称
   */
  findByName(name: string) {
    return request<any, PharmaceuticalCompanyItem[]>({
      url: "/api/app/pharmaceutical-company/find-by-name",
      method: "get",
      params: { name },
    });
  },

  /**
   * 获取所有公司列表
   */
  getAll() {
    return request<any, PharmaceuticalCompanyItem[]>({
      url: "/api/app/pharmaceutical-company/all",
      method: "get",
    });
  },

  // ... existing code ...
  /**
   * 新增制药公司
   * @param data 公司数据
   */
  addCompany(data: PharmaceuticalCompanyAddRequest) {
    return request({
      url: "/api/app/pharmaceutical-company",
      method: "post",
      data,
    });
  },
};

export default PharmaceuticalCompanyAPI;
