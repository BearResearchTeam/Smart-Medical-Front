import request from "@/utils/request";

const DICT_BASE_URL = "/api/app/dictionary-type/";

const DictAPI = {
  //---------------------------------------------------
  // 字典相关接口
  //---------------------------------------------------

  /**
   * 字典分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典分页结果
  */
    getPage(data: any): Promise<DictListResponse> {
    // 正常API调用
    console.log("执行实际登录API调用", data);
    return request<DictListResponse>({
      url: `/api/app/dictionary-data/dictionary-data-list`,
      method: "get",
      params: data, // 将登录数据作为请求体发送
    });
  },
 

  /**
   * 新增字典
   *
   * @param data 字典表单数据
   */
  create(data: DictForm) {
    return request({
      url: `/api/app/dictionary-data/dictionary-data-l`,
      method: "post",
      data,
    });
  },

  /**
   * 修改字典
   *
   * @param id 字典ID
   * @param data 字典表单数据
   */
  update(id: string, data: DictForm) {
    return request({
      url: `/api/app/dictionary-data/${id}/dictionary-data-l`,
      method: "put",
      data,
    });
  },

  /**
   * 删除字典
   *
   * @param ids 字典ID，多个以英文逗号(,)分隔
   */
  deleteByIds(id: string) {
    return request({
      url: `/api/app/dictionary-data/${id}/delete-dictionary-list`,
      method: "put",
    });
  },

  //---------------------------------------------------
  // 字典项相关接口
  //---------------------------------------------------
  /**
   * 获取字典分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典分页结果
   */
  getDictItemPage(queryParams: DictItemPageQuery) {
    return request<PageResult<DictItemPageVO[]>>({
      url: `/api/app/dictionary-type/dictionary-type-list`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取字典项列表
   */
  getDictItems(dictCode: string) {
    return request< DictItemOption[]>({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
    });
  },

  /**
   * 新增字典项
   */
  createDictItem( data: DictItemForm) {
    return request({
      url: `/api/app/dictionary-type/dictionary-type-l`,
      method: "post",
      data,
    });
  },

  /**
   * 获取字典项表单数据
   *
   * @param id 字典项ID
   * @returns 字典项表单数据
   */
  getDictItemFormData(dictCode: string, id: string) {
    return request<DictItemForm>({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    });
  },

  /**
   * 修改字典项
   */
  updateDictItem(id: string, data: DictItemForm) {
    return request({
      url: `/api/app/dictionary-type/${id}/dictionary-type-l`,
      method: "put",
      data,
    });
  },

  /**
   * 删除字典项
   */
  deleteDictItems(ids: string) {
    return request({
      url: `/api/app/dictionary-type/delete-dictionary-type`,
      method: "put",
      params: { ids: ids,},
    });
  },
};

export default DictAPI;

/**
 * 字典查询参数
 * extends PageQuery
 */
export interface DictPageQuery extends PageQuery {
  /**
   * 关键字(字典名称/编码)
   */
  dictionaryDataName?: string;

  /**
   * 字典状态（1:启用，0:禁用）
   */
  dictionaryDataState?: number;

}

/**
 * 字典分页对象
 */
export interface DictPageVO {
  /**
   * 字典ID
   */
  id: string;
  /**
   * 字典名称
   */
  dictionaryDataName: string;
  /**
   * 字典编码
   */
  dictionaryDataType: string;
  /**
   * 字典状态（1:启用，0:禁用）
   */
  dictionaryDataState: number;
}

/**
 * 字典
 */
export interface DictForm {
  /**
   * 字典ID
   */
  id?: undefined | string;
  /**
   * 字典名称
   */
  dictionaryDataName?: string;
  /**
   * 字典编码
   */
  dictionaryDataType?: string;
  /**
   * 字典状态（1-启用，0-禁用）
   */
  dictionaryDataState?: number;
  /**
   * 备注
   */
  dictionaryDataDesc?: string;
}

/**
 * 字典查询参数
 */
export interface DictItemPageQuery extends PageQuery {
  /** 关键字(字典数据值/标签) */
  DictionaryLabel?: string;

  /** 字典编码 */
  datetype: string;
}

/**
 * 字典分页对象
 */
export interface DictItemPageVO {
  /**
   * 字典ID
   */
  id: undefined|string;
  /**
   * 字典编码
   */
  dictionaryLabel: string;
  /**
   * 字典数据值
   */
  dictionaryValue: string;
  /**
   * 字典数据标签
   */
  dictionaryDataType: string;
  /**
   * 状态（1:启用，0:禁用)
   */
  dictionaryTypeState: number;
  /**
   * 字典排序
   */
  dictionarySort?: number;
}

/**
 * 字典
 */
export interface DictItemForm {
  /**
   * 字典ID
   */
  id?: undefined|string;
  /**
   * 字典编码
   */
  dictionaryLabel: string;
  /**
   * 字典数据值
   */
  dictionaryValue?: string;
  /**
   * 字典数据标签
   */
  dictionaryDataType?: string;
  /**
   * 状态（1:启用，0:禁用)
   */
  dictionaryTypeState?: number;
  /**
   * 字典排序
   */
  dictionarySort?: number;

  /**
   * 标签类型
   */
  dictionaryTypeDesc?: "success" | "warning" | "info" | "primary" | "danger" | "";
}

/**
 * 字典项下拉选项
 */
export interface DictItemOption {
  value: number | string;
  label: string;
  tagType?: "" | "success" | "info" | "warning" | "danger";
  [key: string]: any;
}

/** 字典列表响应类型 */
export interface DictListResponse {
  data: DictPageVO[];
  totleCount: number;
  totlePage: number;
}
/** 字典项列表响应类型 */
export interface DictitemListResponse {
  data: DictItemPageVO[];
  totleCount: number;
  totlePage: number;
}
