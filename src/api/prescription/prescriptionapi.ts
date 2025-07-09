 import request from "@/utils/request";
import { Interface } from "readline";
const BASE_URL = "/api/app/doctor-account-serivce";
const PrescriptionAPI = {
  // 获取处方列表
  getPrescriptionList(params:any) {
    return request({
      url: `/api/app/prescription/prescription-tree-list`,
      method: "get",
      params,
    });
  },

  // 获取处方详情
  getPrescriptionDetail(id:string) {
    return request({
      url: `${BASE_URL}/prescriptions/${id}`,
      method: "get",
    });
  },

  // 新增处方
  createPrescription(data:any) {
    return request({
      url: `/api/app/prescription`,
      method: "post",
      data,
    });
  },

  // 更新处方
  updatePrescription(id: string, data: any) {
    return request({
      url: `${BASE_URL}/prescriptions/${id}`,
      method: "put",
      data,
    });
  },

  // 处方左侧树形
  Prescriptiontreelist(pid:any) {
    return request({
      url: `/api/app/prescription/get-prescription-tree`,
      method: "post",
      params: {pid:pid},
    });
  },
};

 export interface PrescriptionListQuery {
  SkipCount ?: number; // 偏移量 
}
export interface PrescriptionForm {
  id: string;
  patientId: string;
  doctorId: string;
  prescriptionDate: string;
  items: PrescriptionForm[];
}
export interface PrescriptionTree {
  value: number ;
  label: string;
  children: PrescriptionTree[];
}
export default PrescriptionAPI;
