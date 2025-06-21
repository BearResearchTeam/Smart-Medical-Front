import request from "@/utils/request";

const NOTICE_BASE_URL = "/api/v1/notices";

const NoticeAPI = {
  /** 获取通知公告分页数据 */
  getPage(queryParams?: NoticePageQuery) {
    // return request<any, PageResult<NoticePageVO[]>>({
    //   url: `${NOTICE_BASE_URL}/page`,
    //   method: "get",
    //   params: queryParams,
    // });
    return Promise.resolve({
      code: "200",
      data: {
        list: [
          {
            id: "1",
            title: "系统维护通知",
            content:
              "系统将于今晚23:00至次日01:00进行维护，期间部分服务可能受到影响，请提前做好准备。",
            type: 1,
            publisherId: 123n,
            priority: 2,
            targetType: 0,
            publishStatus: 1,
            publishTime: new Date("2023-10-26T15:00:00Z"),
            revokeTime: null,
          },
          {
            id: "2",
            title: "新功能上线公告",
            content: "我们很高兴地宣布，全新的数据分析功能已正式上线！欢迎大家体验。",
            type: 1,
            publisherId: 124n,
            priority: 1,
            targetType: 0,
            publishStatus: 1,
            publishTime: new Date("2023-10-20T10:00:00Z"),
            revokeTime: null,
          },
        ],
        total: 2,
      },
      msg: "success",
    });
  },

  /**
   * 获取通知公告表单数据
   *
   * @param id 通知
   * @returns 通知表单数据
   */
  getFormData(id: string) {
    return request<any, NoticeForm>({
      url: `${NOTICE_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   * 添加通知公告
   *
   * @param data 通知表单数据
   * @returns
   */
  create(data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新通知公告
   *
   * @param id 通知ID
   * @param data 通知表单数据
   */
  update(id: string, data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除通知公告，多个以英文逗号(,)分割
   *
   * @param ids 通知公告ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${NOTICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 发布通知
   *
   * @param id 被发布的通知公告id
   * @returns
   */
  publish(id: string) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/publish`,
      method: "put",
    });
  },

  /**
   * 撤回通知
   *
   * @param id 撤回的通知id
   * @returns
   */
  revoke(id: string) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/revoke`,
      method: "put",
    });
  },
  /**
   * 查看通知
   *
   * @param id
   */
  getDetail(id: string) {
    return request<any, NoticeDetailVO>({
      url: `${NOTICE_BASE_URL}/${id}/detail`,
      method: "get",
    });
  },

  /* 全部已读 */
  readAll() {
    return request({
      url: `${NOTICE_BASE_URL}/read-all`,
      method: "put",
    });
  },

  /** 获取我的通知分页列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    // return request<any, PageResult<NoticePageVO[]>>({
    //   url: `${NOTICE_BASE_URL}/my-page`,
    //   method: "get",
    //   params: queryParams,
    // });
    return Promise.resolve({
      code: "200",
      data: {
        list: [
          {
            id: "101",
            title: "个人通知1",
            content: "这是您的第一条个人通知。",
            type: 1,
            publisherId: 123n,
            priority: 1,
            targetType: 1,
            publishStatus: 1,
            publishTime: new Date("2023-11-01T10:00:00Z"),
            revokeTime: null,
          },
          {
            id: "102",
            title: "个人通知2",
            content: "这是您的第二条个人通知。",
            type: 1,
            publisherId: 124n,
            priority: 0,
            targetType: 1,
            publishStatus: 1,
            publishTime: new Date("2023-11-05T14:30:00Z"),
            revokeTime: null,
          },
        ],
        total: 2,
      },
      msg: "success",
    });
  },
};

export default NoticeAPI;

/** 通知公告分页查询参数 */
export interface NoticePageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 发布状态(0：未发布，1：已发布，-1：已撤回) */
  publishStatus?: number;

  isRead?: number;
}

/** 通知公告表单对象 */
export interface NoticeForm {
  id?: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 优先级(L：低，M：中，H：高) */
  level?: string;
  /** 目标类型(1-全体 2-指定) */
  targetType?: number;
  /** 目标ID合集，以,分割 */
  targetUserIds?: string;
}

/** 通知公告分页对象 */
export interface NoticePageVO {
  id: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 发布人 */
  publisherId?: bigint;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  targetType?: number;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  publishStatus?: number;
  /** 发布时间 */
  publishTime?: Date;
  /** 撤回时间 */
  revokeTime?: Date;
}

export interface NoticeDetailVO {
  /** 通知ID */
  id?: string;

  /** 通知标题 */
  title?: string;

  /** 通知内容 */
  content?: string;

  /** 通知类型 */
  type?: number;

  /** 发布人 */
  publisherName?: string;

  /** 优先级(L-低 M-中 H-高) */
  level?: string;

  /** 发布时间 */
  publishTime?: Date;

  /** 发布状态 */
  publishStatus?: number;
}
