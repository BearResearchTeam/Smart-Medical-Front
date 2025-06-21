import request from "@/utils/request";

const BOOK_BASE_URL = "/api/v1/books";

// 图书类型枚举
export enum BookType {
  Undefined = 0,
  Fiction = 1,
  NonFiction = 2,
  Science = 3,
  Biography = 4,
  History = 5,
  Technology = 6,
}

const BookAPI = {
  /** 获取图书分页数据 */
  getPage(queryParams?: BookPageQuery) {
    return request<any, PageResult<BookPageVO[]>>({
      url: `${BOOK_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取图书下拉数据源 */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${BOOK_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 获取图书详情数据
   *
   * @param id 图书ID
   * @returns 图书详情数据
   */
  getDetail(id: string) {
    return request<any, BookPageVO>({
      url: `${BOOK_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 获取图书表单数据
   *
   * @param id 图书ID
   * @returns 图书表单数据
   */
  getFormData(id: string) {
    return request<any, BookForm>({
      url: `${BOOK_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 添加图书 */
  create(data: BookForm) {
    return request({
      url: `${BOOK_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新图书
   *
   * @param id 图书ID
   * @param data 图书表单数据
   */
  update(data: BookForm) {
    return request({
      url: `${BOOK_BASE_URL}/${data.id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除图书，多个以英文逗号(,)分割
   *
   * @param ids 图书ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${BOOK_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 导出图书数据
   *
   * @param queryParams 查询参数
   */
  export(queryParams?: BookPageQuery) {
    return request({
      url: `${BOOK_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },
};

export default BookAPI;

/** 图书分页查询参数 */
export interface BookPageQuery extends PageQuery {
  /** 图书名称 */
  name?: string;
  /** 图书类型 */
  type?: BookType;
  /** 出版日期范围 */
  publishDate?: string[];
}

/** 图书分页对象 */
export interface BookPageVO {
  /** 图书ID */
  id?: string;
  /** 图书名称 */
  name?: string;
  /** 图书类型 */
  type?: BookType;
  /** 出版日期 */
  publishDate?: string;
  /** 价格 */
  price?: number;
  /** 创建时间 */
  createdTime?: string;
  /** 更新时间 */
  updatedTime?: string;
}

/** 图书表单对象 */
export interface BookForm {
  /** 图书ID */
  id?: string;
  /** 图书名称 */
  name: string;
  /** 图书类型 */
  type: BookType;
  /** 出版日期 */
  publishDate: string;
  /** 价格 */
  price: number;
}
