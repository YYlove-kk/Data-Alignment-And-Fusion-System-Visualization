import { request } from '@/utils/request';

// 提交患者数据分析
export function submitPatientDataAnalysis(data) {
    return request({
        url: '/patientDataAnalysis/submit',
        method: 'post',
        data,
    })
}