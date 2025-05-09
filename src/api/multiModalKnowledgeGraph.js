import { request } from '@/utils/request';

// 获取多模态知识图谱列表
export function getMultiModalKnowledgeGraphList() {
    return request({
        url: '/multiModalKnowledgeGraph/list',
        method: 'get',
    })
}
