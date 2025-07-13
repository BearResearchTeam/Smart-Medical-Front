 import request from "@/utils/request";
const BASE_URL = "/api/app/prescription/";
const PrescriptionAPI = {
  //新增处方
createPrescriptiondata(data: any) {
    return request({
      url: `/api/app/prescription`,
      method: "post",
      data,
    });
  },

  // 获取处方列表
  getPrescriptionList(params:any) {
    return request({
      url: `/api/app/prescription/prescription-tree-list`,
      method: "get",
      params,
    });
  },

  // 批量删除处方下的指定药品
  basthdeletePrescription(prescriptionId:number,drugIdsToDeleteString:string) {
    return request({
      url: `/api/app/prescription/prescription-drugs/${prescriptionId}`,
      method: "delete",
      params: {drugIdsToDeleteString}
    });
  },

  // 新增处方药品 (批量修改)
  createPrescription(prescriptionId:any,newDrugIdsString:string) {
    return request({
      url: `/api/app/prescription/prescription-drugs/${prescriptionId}`,
      method: "put",
      params: {newDrugIdsString},
    });
  },
/**
   * 获取处方中的药品
   * @param prescriptionId 处方id
   * @param drugIdsToDeleteString 删除的药品id
   */
  drugselectlist()
  {
    return request({
      url: `/api/app/prescription/drug-select`,
      method: "get",
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
  // 获取处方列表 下拉
  getprelistselect(pid:any) {
  return request({
      url: `/api/app/prescription/start-prescriptions`,
      method: "get",
      params: {pid:pid},
    });
}
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
