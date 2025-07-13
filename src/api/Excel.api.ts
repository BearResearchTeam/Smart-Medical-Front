// ... existing code ...
import request from '@/utils/request';

// 病历信息导出Excel
export function exportSickExcel() {
  return request({
    url: '/api/app/medical/export-sick-excel',
    method: 'GET',
    responseType: 'blob', // 关键：返回文件流
  });
}

// ... existing code ...