export interface BackendApiResponse<T = any> {
  data: T;
  isSuc: boolean;
  code: number | string;
  msg: string;
}
