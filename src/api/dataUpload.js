import { request } from '@/utils/request';

// 获取数据上传列表
export function getDataUploadList() {
    return request({
        url: '/api/upload/list',
        method: 'get',
    })
}

// 上传数据
export function uploadData(data) {
    return request({
        url: '/api/upload-data',
        method: 'post',
        data,
    })
}

// 删除数据
export function deleteData(data) {
    return request({
        url: '/api/upload/'+data.id,
        method: 'delete',
    })
}